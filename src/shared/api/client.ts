import {io} from 'socket.io-client';

import {createAppStore} from 'src/shared/store';
import {registerWebsocketListener} from 'src/shared/store/client';
import {apiBaseUrl} from 'src/utils/urls';

/**
 * Connects to the AppStore given an appKey.
 */
export function connectToAppStore(appKey: string) {
  const appStore = createAppStore();
  const ws = io(`${apiBaseUrl}/store/${appKey}`);

  registerWebsocketListener(appStore, ws);

  return appStore;
}
