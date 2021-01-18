import {io} from 'socket.io-client';

import {createAppStore} from '../store';
import {registerWebsocketListener} from '../store/client';

/**
 * Connects to the AppStore given an appKey.
 */
export function connectToAppStore(appKey: string) {
  const appStore = createAppStore();
  const ws = io(`https://api.prolink.tools/store/${appKey}`);

  registerWebsocketListener(appStore, ws);

  return appStore;
}
