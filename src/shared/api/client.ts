import {io} from 'socket.io-client';

import {apiHost} from 'src/shared/api/url';
import {createAppStore} from 'src/shared/store';
import {registerWebsocketListener} from 'src/shared/store/client';

/**
 * Connects to the AppStore given an appKey.
 */
export function connectToAppStore(appKey: string) {
  const appStore = createAppStore();
  const ws = io(`${apiHost}/store/${appKey}`);

  registerWebsocketListener(appStore, ws);

  return appStore;
}
