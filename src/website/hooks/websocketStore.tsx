import * as React from 'react';
import {io, Socket} from 'socket.io-client';

import {connectToAppStore} from 'src/shared/api/client';
import {AppStore} from 'src/shared/store';
import {apiBaseUrl} from 'src/utils/urls';

/**
 * AppKeyResolver is used to resolve the appKey once the websocket has been
 * established with the API server.
 *
 * This is useful if you need to make an RPC call to translate a different key
 * to an appKey.
 */
type AppKeyResolver = (ws: Socket) => string | Promise<string>;

/**
 * Simply passes an app key through to use for connecting the store
 */
export const simpleAppKeyResolver = (appKey: string) => (_ws: Socket) => appKey;

/**
 * Resolve the appKey from an overlayKey
 */
export const overlayAppKeyResolver = (overlayKey: string) => (ws: Socket) =>
  new Promise<string>(resolve => ws.emit('appKey:by-overlay-key', overlayKey, resolve));

/**
 * Hook to retrieve a connected AppStore.
 */
export function useWebsocketStore(resolver: AppKeyResolver) {
  const [store, setStore] = React.useState<AppStore | null>(null);

  const connectStore = async () => {
    const ws = io(apiBaseUrl);
    const appKey = await resolver(ws);
    ws.close();

    setStore(connectToAppStore(appKey));
  };

  React.useEffect(() => void connectStore(), []);

  return store;
}
