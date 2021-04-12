import {Mutex} from 'async-mutex';
import {ipcRenderer} from 'electron';
import {action, set} from 'mobx';
import {deserialize} from 'serializr';

import {ApiAppServerSocket, AppOverlayClientSocket} from 'src/shared/websockeTypes';

import {applyChanges, observeStore, SerializedChange} from './ipc';
import {AppStore} from '.';

function applyConfigLockedChange(
  store: AppStore,
  change: SerializedChange,
  configLock?: Mutex
) {
  if (configLock && change.path.startsWith('config')) {
    configLock.runExclusive(() => applyChanges(store, change));
  } else {
    applyChanges(store, change);
  }
}

/**
 * Register this window to have it's store hydrated and synced from the main
 * process' store.
 *
 * The config lock is used to hold a lock when config updates are propagated
 * from the main thread and should not be propagated back.
 */
export const registerRendererIpc = (store: AppStore, configLock: Mutex) => {
  ipcRenderer.on('store-update', (_, change: SerializedChange) => {
    applyConfigLockedChange(store, change, configLock);
    ipcRenderer.send('store-update-done');
  });

  ipcRenderer.on(
    'store-init',
    action((event, data: any) => {
      set(store, deserialize(AppStore, data));
      event.sender.send('store-init-done');
    })
  );

  // Kick things off
  ipcRenderer.send('store-subscribe');
};

/**
 * Register this window to have configuration changes be propagated back to the
 * main thread.
 */
export const registerRendererConfigIpc = (store: AppStore, configLock: Mutex) =>
  observeStore({
    target: store.config,
    handler: change =>
      !configLock.isLocked() && ipcRenderer.send('config-update', change),
  });

/**
 * Register this client to receive websocket broadcasts to update the store.
 *
 * You may pass a config lock if config changes are also propegated back to the
 * server, see registerRendererIpc above to understand the purpose of this.
 */
export const registerWebsocketListener = (
  store: AppStore,
  ws: ApiAppServerSocket | AppOverlayClientSocket,
  configLock?: Mutex
) => {
  // XXX: work around type error...
  // see: https://github.com/socketio/socket.io/issues/3872
  (ws as ApiAppServerSocket)
    .on('store-update', (change, done) => {
      applyConfigLockedChange(store, change, configLock);
      done?.();
    })
    .on(
      'store-init',
      action((data, done) => {
        set(store, deserialize(AppStore, data));
        done?.();
      })
    );
};

/**
 * Register a server websocket connection to have configuration changes
 * propegated back to the app client.
 *
 * XXX: This should _not_ be used for any public clients. The API server as a
 * client of the Prolink Tools API is the intended consumer.
 */
export const registerWebsocketConfigListener = (
  store: AppStore,
  ws: ApiAppServerSocket,
  configLock: Mutex
) =>
  observeStore({
    target: store.config,
    handler: change => !configLock.isLocked() && ws.emit('config-update', change),
  });
