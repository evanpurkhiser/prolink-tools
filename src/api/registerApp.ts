import {runInAction} from 'mobx';
import {Socket} from 'socket.io';

import {createAppStore} from 'src/shared/store';
import {registerWebsocketListener} from 'src/shared/store/client';
import {SerializedChange} from 'src/shared/store/ipc';

import {Connection} from './internalStore';
import {apiStore, internalStore} from '.';

/**
 * Matches the ingest namespace, where the matched group is the private API key
 */
export const ingestSocketNamespace = /^\/ingest\/([^/]+)$/;

/**
 * Function called when a prolink tools app connects to the websocket API
 */
export function registerAppConnection(appSocket: Socket) {
  const apiKey = appSocket.nsp.name.match(ingestSocketNamespace)![1];
  const store = createAppStore();
  const conn = new Connection(apiKey, appSocket, store);

  internalStore.addConnection(conn);
  registerWebsocketListener(store, appSocket);

  // re-broadcast app store updates to subscribed clients
  appSocket.on('store-update', (change: SerializedChange) =>
    // TODO: We should probably maintain the list of clients on the
    // internalStore, so they are not lost when the app connection drops and
    // comes back.
    conn.clients.forEach(client => client.emit('store-update', change))
  );

  runInAction(() => apiStore.clientCount++);

  appSocket.on('disconnect', () => {
    runInAction(() => apiStore.clientCount--);
    internalStore.removeConnection(conn.appKey);
  });
}
