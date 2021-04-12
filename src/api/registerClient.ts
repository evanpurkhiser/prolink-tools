import {ApiExternalServerSocket} from 'src/shared/websockeTypes';

import {listenOAuthAuthorize} from './integrations/oauth';
import {internalStore} from '.';

/**
 * Matches the store namespace. The matched group is the AppKey which allows us
 * to map back to a store to subscribe to.
 */
export const clientAppStoreNamespace = /^\/store\/([^/]+)$/;

/**
 * Function called when a prolink tools app connects to the websocket API
 */
export function registerClientConnection(client: ApiExternalServerSocket) {
  const appKey = client.nsp.name.match(clientAppStoreNamespace)![1];

  // XXX: Subscribing the client to the app store is handled by observers in
  // the registerAppConnection. We only need to update the client in the store.

  // Setup integrations
  listenOAuthAuthorize(appKey, client);

  internalStore.addStoreClient(appKey, client);
  client.on('disconnect', () => internalStore.removeStoreClient(appKey, client));
}
