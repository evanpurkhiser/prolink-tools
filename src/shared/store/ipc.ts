import * as Sentry from '@sentry/electron';
import {
  action,
  get,
  IArrayDidChange,
  IMapDidChange,
  IObjectDidChange,
  isObservableArray,
  isObservableObject,
  remove,
  set,
  toJS,
} from 'mobx';
import {deepObserve, IDisposer} from 'mobx-utils';
import {deserialize, serialize, update} from 'serializr';

import {
  AppStore,
  CloudApiState,
  DeviceStore,
  HydrationInfo,
  MixstatusStore,
  PlayedTrack,
} from '.';

type ValueChange = Omit<
  IObjectDidChange | IArrayDidChange | IMapDidChange,
  'object' | 'oldValue'
>;

export type SerializedChange = {
  /**
   * The path to the object within the store that has changed. Separated by `/`.
   * Numeric map keys are string which is a limitation of mobx-utils/deepObserve
   * (see getPathAt for the workaround).
   */
  path: string;
  /**
   * The specific change that must be applied
   */
  change: ValueChange;

  serializerModel?: string;
};

/**
 * Serializr allows us to easily serialize and deserialize our _entire_ store,
 * however serializing change subsets is more difficult since serialization
 * definitions don't necessarily communicate additions to things like maps.
 *
 * We work around this by tracking specific serializable classes to give our
 * diffing serializer the information it needs to understand what it's applying
 * the serialized change to.
 */
const serializableClasses = [
  AppStore,
  DeviceStore,
  HydrationInfo,
  MixstatusStore,
  CloudApiState,
  PlayedTrack,
];

const serializerModelMap = serializableClasses.reduce(
  (acc, klass) => acc.set(klass.name, klass),
  new Map<string, typeof serializableClasses[number]>()
);

function getAtPath(obj: any, path: string) {
  if (path === '') {
    return obj;
  }

  const splitPath = path.split('/');
  let target = obj;

  while (splitPath.length > 0) {
    const segment = splitPath.shift()!;

    // We lose some type information when computing the deep observation path
    // of the store. If we get a number lets just assume it needs to be
    // coerced. This may need to be revisited.
    target = get(target, isNaN(segment as any) === false ? Number(segment) : segment);
  }

  return target;
}

/**
 * Apply serialized change objects to a store
 */
export const applyChanges = action(
  (obj: any, {path, change, serializerModel}: SerializedChange) => {
    const target = getAtPath(obj, path);

    if (target === undefined) {
      // TODO: Race. Remove this and sometimes things happen
      return;
    }

    const model = serializerModelMap.get(serializerModel ?? '');

    // deserialization of our change object is a bit of a dance, we keep that
    // dance here
    const getNewValue = (override?: any) => {
      const update = change as any;
      const newValue = override ?? update.newValue;

      // First attempt to use the specified serializer model if it maps to a
      // serializableClass
      if (model !== undefined) {
        return deserialize(model as any, newValue);
      }

      // No deserializer found, assume it is a plain object
      return newValue;
    };

    // A bit of a TS hack, cast each expected change type
    const objChange = change as IObjectDidChange;
    const mapChange = change as IMapDidChange;
    const arrChange = change as IArrayDidChange;

    // We can update the target object if it has serializeInfo available
    const serializeSchema = target?.constructor?.serializeInfo;

    if (
      serializeSchema &&
      !model &&
      isObservableObject(target) &&
      (objChange.type === 'add' || objChange.type === 'update') &&
      objChange.newValue !== null &&
      objChange.newValue !== undefined
    ) {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      update(serializeSchema, target, {[objChange.name]: getNewValue()}, () => {});
      return;
    }

    // Update arrays
    if (isObservableArray(target)) {
      if (arrChange.type === 'update') {
        set(arrChange.index, getNewValue());
        return;
      }
      if (arrChange.type === 'splice') {
        // TODO This needs deserialization toooooo
        target.splice(
          arrChange.index,
          arrChange.removedCount,
          ...arrChange.added.map(getNewValue)
        );
        return;
      }
    }

    if (objChange.type === 'add' || objChange.type === 'update') {
      set(target, objChange.name, getNewValue());
      return;
    }
    if (objChange.type === 'remove' || mapChange.type === 'delete') {
      remove(target, objChange.name as string);
    }
  }
);

type ObserverStoreOpts = {
  /**
   * The target observable to observer. If not specified the entire store will be
   * observed.
   */
  target: any;
  /**
   * A handler to initially register
   */
  handler?: changeHandler;
};

type changeHandler = (change: SerializedChange) => void;

/**
 * Function used to register to receive serialized updated from an observer
 */
export type RegisterHandler = (key: string, reciever: changeHandler) => IDisposer;

/**
 * Start observing the store (or some part of it) for changes.
 *
 * Returns a 2 element tuple. The first is used to register handlers to receive
 * serialized changes to the store. The second is used to dispose of the observer.
 */
export const observeStore = ({
  target,
  handler,
}: ObserverStoreOpts): [RegisterHandler, IDisposer] => {
  // Maintains a list of handlers that will be called in response to a serialized
  // change in the store.
  const handlers: Map<string, changeHandler> = new Map();

  if (handler) {
    handlers.set('root', handler);
  }

  const dispose = deepObserve(target, (change, changePath) => {
    const anyChange = {...change} as {[k: string]: any};

    const path = changePath;

    // Avoid including the full object and oldValue in the change we're going
    // to send over IPC. We're not going to serialize these.
    delete anyChange.object;
    delete anyChange.oldValue;

    const serializedChange: SerializedChange = {change: anyChange as ValueChange, path};

    // New values will require serialization. We'll take advantage of the
    // serialization definitions that have been placed onto our store
    // objects to do the serialization. The same will be done for
    // deserialization.
    if (Object.prototype.hasOwnProperty.call(anyChange, 'newValue')) {
      // mark the direct serializer class name for the value if we can
      serializedChange.serializerModel = anyChange.newValue?.constructor?.name;

      const parentClass = getAtPath(target, path)?.constructor;
      const serializer = anyChange.newValue?.constructor?.serializeInfo
        ? serialize
        : parentClass?.serializeInfo?.props?.[anyChange.name]?.serializer ?? toJS;

      anyChange.newValue = serializer(anyChange.newValue);
    }

    // We do the same thing for spliced values in an arrays, which are handled
    // slightly differently
    if (
      Object.prototype.hasOwnProperty.call(anyChange, 'added') &&
      anyChange.added.length > 0
    ) {
      // mark the direct serializer class name for the value if we can
      serializedChange.serializerModel = anyChange.added[0]?.constructor?.name;

      const parentClass = getAtPath(target, path)?.constructor;
      const serializer = anyChange.added[0]?.constructor?.serializeInfo
        ? serialize
        : parentClass?.serializeInfo?.props?.[anyChange.name]?.serializer ?? toJS;

      anyChange.added = anyChange.added.map((v: any) => serializer(v));
    }

    // XXX: Duplicated remove code from above. Maybe this should be refactored
    if (
      Object.prototype.hasOwnProperty.call(anyChange, 'removed') &&
      anyChange.removed.length > 0
    ) {
      // mark the direct serializer class name for the value if we can
      serializedChange.serializerModel = anyChange.removed[0]?.constructor?.name;

      const parentClass = getAtPath(target, path)?.constructor;
      const serializer = anyChange.removed[0]?.constructor?.serializeInfo
        ? serialize
        : parentClass?.serializeInfo?.props?.[anyChange.name]?.serializer ?? toJS;

      anyChange.removed = anyChange.removed.map((v: any) => serializer(v));
    }

    handlers.forEach(handler => handler(serializedChange));
  });

  const register: RegisterHandler = (key, handler) => {
    handlers.set(key, handler);
    return () => handlers.delete(key);
  };

  return [register, dispose];
};
