import {observable, observe, runInAction, when} from 'mobx';
import {serialize} from 'serializr';
import {Socket} from 'socket.io';

import {AppStore, createAppStore} from 'src/shared/store';
import {registerWebsocketListener} from 'src/shared/store/client';
import {SerializedChange} from 'src/shared/store/ipc';

import {Connection} from './internalStore';
import {apiStore, internalStore} from '.';

/**
 * Matches the ingest namespace, where the matched group is the private API key
 */
export const ingestSocketNamespace = /^\/ingest\/([^/]+)$/;

function initClientStore(client: Socket, store: AppStore) {
  // XXX: We MUST scrub the API key when serializing the store. It is a
  // private value that must not be publicly available.
  const serializedStore = serialize(store);
  serializedStore.config.apiKey = '';

  // Initialize the store on the client and subscribe it to receive updates
  client.emit('store-init', serializedStore);
}

/**
 * Function called when a prolink tools app connects to the websocket API
 */
export function registerAppConnection(appSocket: Socket) {
  const apiKey = appSocket.nsp.name.match(ingestSocketNamespace)![1];
  const store = createAppStore();
  const conn = new Connection(apiKey, appSocket, store);

  internalStore.addAppConnection(conn);
  registerWebsocketListener(store, appSocket);

  const {appStoreClients} = internalStore;

  // Ensure the appStoreClients has an observable client list
  if (!appStoreClients.has(conn.appKey)) {
    appStoreClients.set(conn.appKey, observable.array<Socket>());
  }

  // Init the app store in all existing clients. These clients will have
  // already been initialized from a prior connection, if they are still
  // connected. But we should consider their state outdated.
  when(
    () => store.isInitalized,
    () =>
      appStoreClients.get(conn.appKey)?.forEach(client => initClientStore(client, store))
  );

  // Init the app store for newly added clients
  const disposeClientInitalizer = observe(
    internalStore.appStoreClients.get(conn.appKey)!,
    change =>
      change.type === 'splice' &&
      change.added.forEach(client => initClientStore(client, store))
  );

  // re-broadcast app store updates to subscribed clients
  appSocket.on('store-update', (change: SerializedChange) =>
    // TODO: We should probably maintain the list of clients on the
    // internalStore, so they are not lost when the app connection drops and
    // comes back.
    appStoreClients
      .get(conn.appKey)
      ?.forEach(client => client.emit('store-update', change))
  );

  runInAction(() => apiStore.clientCount++);

  appSocket.on('disconnect', () => {
    runInAction(() => apiStore.clientCount--);
    disposeClientInitalizer();
    internalStore.removeAppConnection(conn.appKey);
  });
}
