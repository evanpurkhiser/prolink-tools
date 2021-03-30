import {observable, observe, runInAction, when} from 'mobx';
import {serialize} from 'serializr';
import {Socket} from 'socket.io';

import {AppStore, createAppStore} from 'src/shared/store';
import {registerWebsocketListener} from 'src/shared/store/client';
import {SerializedChange} from 'src/shared/store/ipc';

import {Connection} from './internalStore';
import {AppHandshake, ConnectionState} from './types';
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

  // Scrub user details
  serializedStore.user = {};

  // TODO: This should handle locking replies

  // Initialize the store on the client and subscribe it to receive updates
  client.emit('store-init', serializedStore);
}

type HandshakeData = {
  /**
   * The API version from LATEST_API_VERSION
   */
  version: number;
};

type HandshakeReply = {
  data: HandshakeData;
  reply: (data: AppHandshake) => void;
};

/**
 * Older clients don't do the handshake. This is how long we will wait before
 * receiveing a handhash and considering the app "old".
 */
const HANDSHAKE_TIMEOUT = 5000;

/**
 * The app handshake is done immedaitely after a app connects, before the API
 * completes app registration. This will resolve to false if we are not able to
 * complete the handshake with the app,
 */
async function appHandshake(appSocket: Socket) {
  const timeout = new Promise<null>(resolve =>
    setTimeout(() => resolve(null), HANDSHAKE_TIMEOUT)
  );

  const handshake = new Promise<HandshakeReply>(resolve =>
    appSocket.once('handshake', (data, reply) => resolve({data, reply}))
  );

  const result = await Promise.race([timeout, handshake]);

  // Old client never initiated the handshake. Rude.
  if (result === null) {
    return false;
  }

  // TODO: more logic to decide if the app is successfully connected to the server or not.

  result.reply({
    connectionState: ConnectionState.Connected,
    version: 'TODO: Put the version here somehow...',
  });

  return true;
}

/**
 * Function called when a prolink tools app connects to the websocket API
 */
export async function registerAppConnection(appSocket: Socket) {
  const apiKey = appSocket.nsp.name.match(ingestSocketNamespace)![1];
  const store = createAppStore();
  const conn = new Connection(apiKey, appSocket, store);

  const handshakeOk = await appHandshake(appSocket);

  if (!handshakeOk) {
    return;
  }

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
