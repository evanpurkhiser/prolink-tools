import type {AppKey} from 'src/api/internalStore';
import type {OAuthProvider} from 'src/shared/store/types';
import type {ApiExternalServerSocket} from 'src/shared/websockeTypes';

import {handleAuthorize as nightbotAuthorize} from './nightbot';

type OAuthAuthorizeHandler = (
  appKey: AppKey,
  code: string,
  done: (opts: {error: string | null}) => void,
) => void;

/**
 * Maps OAuth providers to their authorize handlers
 */
const authorizeHandlers: Record<OAuthProvider, OAuthAuthorizeHandler> = {
  nightbot: nightbotAuthorize,
};

/**
 * Listen for OAuth authorization requests and map to the appropriate oauth
 * providers authorization handler.
 */
export const listenOAuthAuthorize = (appKey: AppKey, client: ApiExternalServerSocket) =>
  client.on('oauth:authorize', (provider, code, resolve) =>
    authorizeHandlers[provider]?.(appKey, code, resolve),
  );
