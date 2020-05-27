import {deepObserve} from 'mobx-utils';
import {WebContents, ipcRenderer, ipcMain} from 'electron';
import {
  set,
  get,
  IObjectDidChange,
  IArrayChange,
  IArraySplice,
  IMapDidChange,
  isObservableArray,
  remove,
  toJS,
  isObservableObject,
} from 'mobx';

import store, {AppStore, DeviceStore, MixstatusStore, HydrationInfo} from '.';
import {serialize, deserialize, update} from 'serializr';

type ValueChange = Omit<
  IObjectDidChange | IArrayChange | IArraySplice | IMapDidChange,
  'object' | 'oldValue'
>;

type SerializedChange = {
  /**
   * The path to the object within the store that has changed. Separated by `/`.
   * Nueric map keys are string which is a limitation of mobx-utils/deepObserve
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
 * however serializing chnage subsets is more difficult since serialization
 * definitions don't neccisarily communicate additions to things like maps.
 *
 * We work around this by tracking specific serializable classes to give our
 * diffing serializer the information it needs to undersatnd what it's appyling
 * the serialized chnage to.
 */
const serializableClasses = [AppStore, DeviceStore, HydrationInfo, MixstatusStore];

const serializerModelMap = serializableClasses.reduce(
  (acc, klass) => acc.set(klass.name, klass),
  new Map<string, typeof serializableClasses[number]>()
);

function getAtPath(obj: any, path: string) {
  const splitPath = path.split('/');
  let target = obj;

  while (splitPath.length > 0) {
    const segment = splitPath.shift()!;

    // We lose some type information when computing the deep observation path
    // of the store. If we get a number lets just assume it needs to be
    // coerced. This may need to be revisted.
    target = get(target, isNaN(segment as any) === false ? Number(segment) : segment);
  }

  return target;
}

function applyStoreChange({path, change, serializerModel}: SerializedChange) {
  let target = getAtPath(store, path);

  const model = serializerModelMap.get(serializerModel ?? '');

  // deserialization of our chnage object is a bit of a dance, we keep that
  // dance here
  const getNewValue = () => {
    const update = change as any;

    // First attempt to use the specified serializer model if it maps to a
    // serializableClass
    if (model !== undefined) {
      return deserialize(model as any, update.newValue);
    }

    // No deserializer found, assume it is a plain object
    return update.newValue;
  };

  const objChange = change as IObjectDidChange;

  // We can update the target object if it has serializeInfo available
  const serializeSchema = target?.constructor?.serializeInfo;

  if (
    serializeSchema &&
    !model &&
    isObservableObject(target) &&
    (objChange.type === 'add' || objChange.type === 'update')
  ) {
    update(serializeSchema, target, {[objChange.name]: objChange.newValue}, () => {});
    return;
  }

  // Update arrays
  if (isObservableArray(target)) {
    const arrChange = change as IArrayChange | IArraySplice;

    if (arrChange.type === 'update') {
      set(arrChange.index, getNewValue());
      return;
    }
    if (arrChange.type == 'splice') {
      // TODO This neds deserialization toooooo
      target.splice(arrChange.index, arrChange.removedCount, ...arrChange.added);
      return;
    }
  }

  if (objChange.type === 'add' || objChange.type === 'update') {
    set(target, objChange.name, getNewValue());
    return;
  }
  if (objChange.type === 'remove') {
    remove(target, objChange.name as string);
    return;
  }
}

export function subscribeWebcontent(webContents: WebContents) {
  deepObserve(store, (change, path) => {
    const anyChange = {...change} as {[k: string]: any} & Object;

    // Avoid including the full object and oldValue in the change we're going
    // to send over IPC. We're not going to serialize these.
    delete anyChange.object;
    delete anyChange.oldValue;

    const serialzedChange: SerializedChange = {change: anyChange as ValueChange, path};

    // New values will require serialization. We'll take advantage of the
    // serialization definitions that have been placed onto our store
    // objects to do the serialization. The same will be done for
    // deserialization.
    if (anyChange.hasOwnProperty('newValue')) {
      // mark the direct serializer class name for the value if we can
      serialzedChange.serializerModel = anyChange.newValue?.constructor?.name;

      const parentClass = getAtPath(store, path)?.constructor;
      const serializer = anyChange.newValue?.constructor?.serializeInfo
        ? serialize
        : parentClass?.serializeInfo?.props?.[anyChange.name]?.serializer ?? toJS;

      anyChange.newValue = serializer(anyChange.newValue);
    }

    webContents.send('store-update', serialzedChange);
  });
}

/**
 * Listens for IPC from any created windows. Upon registration the current state
 * store will be passed back, and all future state changes will be send to the
 * window via webContents.send.
 *
 * This should be called when the main app initializes _before_ any windows are
 * created.
 */
export const registerMainIpc = () =>
  ipcMain.on('store-subscribe', event => {
    // Send the current state of the store
    event.sender.send('store-init', serialize(AppStore, store));

    // Register this window to recieve store changes over ipc
    subscribeWebcontent(event.sender);
  });

/**
 * Register this window to have it's store hydrated and synced from the main
 * process' store.
 *
 */
export const registerRendererIpc = () => {
  ipcRenderer.on('store-init', (_, data: Object) => {
    set(store, deserialize(AppStore, data));
  });

  ipcRenderer.on('store-update', (_, change: SerializedChange) => {
    applyStoreChange(change);
  });

  // Kick things off
  ipcRenderer.send('store-subscribe');
};
