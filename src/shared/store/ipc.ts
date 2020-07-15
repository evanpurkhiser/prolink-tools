import {ipcRenderer, ipcMain} from 'electron';
import {Server} from 'socket.io';
import {serialize, deserialize, update} from 'serializr';
import {deepObserve} from 'mobx-utils';
import settings from 'electron-settings';
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

import store, {
  AppStore,
  DeviceStore,
  MixstatusStore,
  HydrationInfo,
  PlayedTrack,
  AppConfig,
} from '.';

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

type ChangeHandler = (change: SerializedChange) => void;

/**
 * Maintains a list of handlers that will be called in response to a serailized
 * change in the store.
 */
const changeHandlers: ChangeHandler[] = [];

/**
 * Serializr allows us to easily serialize and deserialize our _entire_ store,
 * however serializing chnage subsets is more difficult since serialization
 * definitions don't neccisarily communicate additions to things like maps.
 *
 * We work around this by tracking specific serializable classes to give our
 * diffing serializer the information it needs to undersatnd what it's appyling
 * the serialized chnage to.
 */
const serializableClasses = [
  AppStore,
  DeviceStore,
  HydrationInfo,
  MixstatusStore,
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
    // coerced. This may need to be revisted.
    target = get(target, isNaN(segment as any) === false ? Number(segment) : segment);
  }

  return target;
}

function applyStoreChange({path, change, serializerModel}: SerializedChange) {
  let target = getAtPath(store, path);

  if (target === undefined) {
    // TODO: Race. Remove this and sometimes things happen
    return;
  }

  const model = serializerModelMap.get(serializerModel ?? '');

  // deserialization of our chnage object is a bit of a dance, we keep that
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
  const arrChange = change as IArrayChange | IArraySplice;

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
    update(serializeSchema, target, {[objChange.name]: objChange.newValue}, () => {});
    return;
  }

  // Update arrays
  if (isObservableArray(target)) {
    if (arrChange.type === 'update') {
      set(arrChange.index, getNewValue());
      return;
    }
    if (arrChange.type == 'splice') {
      // TODO This neds deserialization toooooo
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
    return;
  }
}

type ObserverStoreOpts = {
  /**
   * The target observable to observer. If not specified the entire store will be
   * observed.
   */
  target?: any;
  /**
   * If targeting a nested store, a prefix path must be specified
   */
  prefix?: string;
  /**
   * The function to call with a serializedChange when a observable has changed in
   * the observed tree.
   *
   * If not specified all registered changeHandlers will be called.
   */
  handler?: ChangeHandler;
};

const defaultChangeHandler = (serializedChange: SerializedChange) =>
  changeHandlers.forEach(handler => handler(serializedChange));

/**
 * Start observing the store for changes.
 *
 */
export const observeStore = ({target, prefix, handler}: ObserverStoreOpts = {}) =>
  deepObserve(target ?? store, (change, changePath) => {
    const anyChange = {...change} as {[k: string]: any} & Object;

    const path =
      prefix === undefined
        ? changePath
        : changePath === ''
        ? prefix
        : `${prefix}/${changePath}`;

    // Avoid including the full object and oldValue in the change we're going
    // to send over IPC. We're not going to serialize these.
    delete anyChange.object;
    delete anyChange.oldValue;

    const serializedChange: SerializedChange = {change: anyChange as ValueChange, path};

    // New values will require serialization. We'll take advantage of the
    // serialization definitions that have been placed onto our store
    // objects to do the serialization. The same will be done for
    // deserialization.
    if (anyChange.hasOwnProperty('newValue')) {
      // mark the direct serializer class name for the value if we can
      serializedChange.serializerModel = anyChange.newValue?.constructor?.name;

      const parentClass = getAtPath(store, path)?.constructor;
      const serializer = anyChange.newValue?.constructor?.serializeInfo
        ? serialize
        : parentClass?.serializeInfo?.props?.[anyChange.name]?.serializer ?? toJS;

      anyChange.newValue = serializer(anyChange.newValue);
    }

    // We do the same thing for spliced values in an arrays, which are handled
    // slightly differently
    if (anyChange.hasOwnProperty('added') && anyChange.added.length > 0) {
      // mark the direct serializer class name for the value if we can
      serializedChange.serializerModel = anyChange.added[0]?.constructor?.name;

      const parentClass = getAtPath(store, path)?.constructor;
      const serializer = anyChange.added[0]?.constructor?.serializeInfo
        ? serialize
        : parentClass?.serializeInfo?.props?.[anyChange.name]?.serializer ?? toJS;

      anyChange.added = anyChange.added.map((v: any) => serializer(v));
    }

    // XXX: Duplicated remove code from above. Maybe this should be refactored
    if (anyChange.hasOwnProperty('removed') && anyChange.removed.length > 0) {
      // mark the direct serializer class name for the value if we can
      serializedChange.serializerModel = anyChange.removed[0]?.constructor?.name;

      const parentClass = getAtPath(store, path)?.constructor;
      const serializer = anyChange.removed[0]?.constructor?.serializeInfo
        ? serialize
        : parentClass?.serializeInfo?.props?.[anyChange.name]?.serializer ?? toJS;

      anyChange.removed = anyChange.removed.map((v: any) => serializer(v));
    }

    const handlerFunc = handler ?? defaultChangeHandler;
    handlerFunc(serializedChange);
  });

/**
 * Load and deserialize the app config from the settings file
 */
export const loadMainConfig = async () =>
  set(store.config, deserialize(AppConfig, await settings.get()));

/**
 * Listens for IPC from any created windows. Upon registration the current state
 * store will be passed back, and all future state changes will be send to the
 * window via webContents.send.
 *
 * This should be called when the main app initializes _before_ any windows are
 * created.
 */
export const registerMainIpc = () => {
  ipcMain.on('store-subscribe', event => {
    // Send the current state of the store
    event.sender.send('store-init', serialize(AppStore, store));

    // Register this window to recieve store changes over ipc
    changeHandlers.push(change => event.sender.send('store-update', change));
  });

  // Register listener for config object changes
  ipcMain.on('config-update', (_e, change: SerializedChange) => {
    applyStoreChange(change);
    settings.set(serialize(AppConfig, store.config));
  });
};

/**
 * XXX: This list MAY be brittle as it is what stops us from getting stuck in an
 * update loop upon config changes.
 *
 * Becuase changes will be propagated from the client -> main, and then back
 * from main -> client, we need to ignore the changes we just made.
 */
const recentConfigChanges = new Set<string>();

/**
 * Register this window to have it's store hydrated and synced from the main
 * process' store.
 */
export const registerRendererIpc = () => {
  ipcRenderer.on('store-update', (_, change: SerializedChange) => {
    // When recieving configuration changes, drop changes that were jsut made.
    if (change.path.startsWith('config') && recentConfigChanges.has(change.path)) {
      setTimeout(() => recentConfigChanges.delete(change.path), 500);
      return;
    }

    applyStoreChange(change);
  });

  ipcRenderer.on('store-init', (_, data: Object) => {
    set(store, deserialize(AppStore, data));
  });

  // Kick things off
  ipcRenderer.send('store-subscribe');
};

/**
 * Register this window to have configuration changes be propagated back to the
 * main thread.
 */
export const registerRendererConfigIpc = () =>
  observeStore({
    target: store.config,
    prefix: 'config',
    handler: change => {
      recentConfigChanges.add(change.path);
      ipcRenderer.send('config-update', change);
    },
  });

/**
 * Register a websocket server as a transport to broadcast store changes
 */
export const registerMainWebsocket = (wss: Server) => {
  // Send the current state to all new comections
  wss.on('connection', client => {
    client.emit('store-init', serialize(AppStore, store));
  });

  // Send changes
  changeHandlers.push(change => wss.sockets.emit('store-update', change));
};

/**
 * Register this client to recieve websocket broadcasts to update the store
 */
export const registerClientWebsocket = (ws: SocketIOClient.Socket) => {
  ws.on('store-update', (change: SerializedChange) => applyStoreChange(change));
  ws.on('store-init', (data: Object) => set(store, deserialize(AppStore, data)));
};
