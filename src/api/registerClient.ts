import {serialize} from 'serializr';
import {Socket} from 'socket.io';

import {internalStore} from '.';

/**
 * Matches the store namespace. The matched group is the AppKey which allows us
 * to map back to a store to subscribe to.
 */
export const clientAppStoreNamespace = /^\/store\/([^/]+)$/;

/**
 * Function called when a prolink tools app connects to the websocket API
 */
export function registerClientConnection(client: Socket) {
  const appKey = client.nsp.name.match(clientAppStoreNamespace)![1];
  const conn = internalStore.connections.get(appKey);

  if (conn === undefined) {
    return;
  }

  // XXX: We MUST scrube the API key when serializing the store. It is a
  // private value that must not be publically available.
  const serializedStore = serialize(conn.store);
  serializedStore.config.apiKey = '';

  // Initalize the store on the client and subscribe it to recieve updates
  client.emit('store-init', serializedStore);
  conn.clients.push(client);
}
