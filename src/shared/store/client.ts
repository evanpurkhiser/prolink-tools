import {ipcRenderer} from 'electron';
import {action, set} from 'mobx';
import {deserialize} from 'serializr';
import {Socket as ServerSocker} from 'socket.io';
import {Socket as ClientSocket} from 'socket.io-client';

import {applyChanges, observeStore, SerializedChange} from './ipc';
import {AppStore} from '.';

/**
 * Mark when we're applying a UI config change via IPC to avoid a loop over IPC.
 */
let isApplyingConfigChange = false;

/**
 * Register this window to have it's store hydrated and synced from the main
 * process' store.
 */
export const registerRendererIpc = (store: AppStore) => {
  ipcRenderer.on('store-update', (_, change: SerializedChange) => {
    isApplyingConfigChange = change.path.startsWith('config');
    applyChanges(store, change);
    isApplyingConfigChange = false;

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
export const registerRendererConfigIpc = (store: AppStore) =>
  observeStore({
    target: store.config,
    handler: change =>
      !isApplyingConfigChange && ipcRenderer.send('config-update', change),
  });

/**
 * Register this client to recieve websocket broadcasts to update the store
 */
export const registerWebsocketListener = (
  store: AppStore,
  ws: ClientSocket | ServerSocker
) => {
  ws.on('store-update', (change: SerializedChange, done: () => void) => {
    applyChanges(store, change);
    done?.();
  });
  ws.on(
    'store-init',
    action((data: any, done: () => void) => {
      set(store, deserialize(AppStore, data));
      done?.();
    })
  );
};
