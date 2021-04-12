import {io} from 'socket.io-client';

import {createAppStore} from 'src/shared/store';
import {registerWebsocketListener} from 'src/shared/store/client';
import {apiBaseUrl} from 'src/utils/urls';

import {ApiExternalClientSocket} from '../websockeTypes';

/**
 * Connects to the API server representation AppStore of an App given an
 * appKey.
 */
export function connectToAppStore(appKey: string) {
  const appStore = createAppStore();
  const ws: ApiExternalClientSocket = io(`${apiBaseUrl}/store/${appKey}`);

  registerWebsocketListener(appStore, ws);

  return [appStore, ws] as const;
}
