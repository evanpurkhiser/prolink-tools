import {Mutex} from 'async-mutex';
import {ipcMain} from 'electron';
import settings from 'electron-settings';
import {runInAction, set} from 'mobx';
import {deepObserve, IDisposer} from 'mobx-utils';
import {deserialize, serialize} from 'serializr';
import {Server} from 'socket.io';
import {io} from 'socket.io-client';

import http from 'http';

import {AppHandshake, ConnectionState} from 'src/api/types';
import {apiHost} from 'src/shared/api/url';

import {LATEST_API_VERSION} from '../constants';

import {applyChanges, RegisterHandler, SerializedChange} from './ipc';
import {AppConfig, AppStore} from '.';

/**
 * Load and deserialize the app config from the settings file
 */
export const loadMainConfig = async (store: AppStore) => {
  const obj = await settings.get();
  runInAction(() => set(store.config, deserialize(AppConfig, obj)));
};

/**
 * Register for store config changes to be saved saved to the settings file
 */
export const observerAndPersistConfig = (store: AppStore) =>
  deepObserve(store.config, () => persistConfig(store));

/**
 * Persist application configuration into the settings file
 */
export const persistConfig = (store: AppStore) => settings.set(serialize(store.config));

/**
 * Listens for IPC from any created windows. Upon registration the current state
 * store will be passed back, and all future state changes will be send to the
 * window via webContents.send.
 *
 * This should be called when the main app initializes _before_ any windows are
 * created.
 */
export const registerMainIpc = (store: AppStore, register: RegisterHandler) => {
  const lock = new Mutex();

  // Lock for applying configuration changes from the UI, to avoid propegating
  // the changes back via IPC causing a loop.
  const configLock = new Mutex();

  ipcMain.on('store-subscribe', event => {
    // Send the current state of the store. Do not release lock until store
    // initalization is done.
    lock.acquire().then(release => {
      event.sender.send('store-init', serialize(store));
      ipcMain.once('store-init-done', () => release());
    });

    // Register this window to recieve store changes over ipc.
    register(
      'main-ipc',
      change =>
        !configLock.isLocked &&
        lock.acquire().then(release => {
          event.sender.send('store-update', change);
          ipcMain.once('store-update-done', () => release());
        })
    );
  });

  // Register listener for config object changes
  ipcMain.on('config-update', (_e, change: SerializedChange) => {
    configLock.runExclusive(() => applyChanges(store.config, change));
  });
};

/**
 * Pushes updates to the API server running on api.prolink.tools.
 *
 * Returns a function to disconnect.
 */
export const startMainApiWebsocket = (store: AppStore, register: RegisterHandler) => {
  const lock = new Mutex();

  const conn = io(`${apiHost}/ingest/${store.config.apiKey}`, {
    transports: ['websocket'],
  });

  let clearObserver: IDisposer | undefined;

  const connect = async () => {
    runInAction(() => (store.cloudApiState.connectionState = ConnectionState.Connecting));

    // Must handshake with the server before we can setup IPC handlers. We need
    // to know if it's OK to communicate with the server or not.
    const handshake = await new Promise<AppHandshake>(resolve =>
      conn.emit('handshake', {version: LATEST_API_VERSION}, resolve)
    );

    store.cloudApiState.setFromHandshake(handshake);

    // Nothing we can do if we were rejected
    if (!store.cloudApiState.isReady) {
      return;
    }

    lock
      .acquire()
      .then(release => conn.emit('store-init', serialize(store), () => release()));

    clearObserver = register('api-ws', change =>
      lock.acquire().then(release => conn.emit('store-update', change, () => release()))
    );
  };

  // If the server drops the connection it's likely we'll be able to reconnect
  conn.on('disconnect', () => {
    console.warn('Dropped connection to prolink api server');

    clearObserver?.();
    lock.cancel();
    store.cloudApiState.reset();
    conn.once('connect', connect);
  });

  connect();

  return () => conn.disconnect();
};

/**
 * Register a websocket server as a transport to broadcast store changes
 */
export const registerMainWebsocket = (
  store: AppStore,
  httpServer: http.Server,
  register: RegisterHandler
) => {
  const wss = new Server(httpServer, {serveClient: false});

  // Send the current state to all new comections
  wss.on('connection', client => {
    client.emit('store-init', serialize(store));
  });

  // Send changes to the websocket
  register('main-ws', change => wss.sockets.emit('store-update', change));

  return wss;
};
