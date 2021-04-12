import {action, reaction, runInAction} from 'mobx';
import {AccessToken, AuthorizationCode} from 'simple-oauth2';

import {internalStore} from 'src/api';
import {AppKey, Connection} from 'src/api/internalStore';
import {OAuthProvider} from 'src/shared/store/types';
import {ApiExternalServerSocket} from 'src/shared/websockeTypes';

const nightbotApi = 'https://api.nightbot.tv';

const scopes = [
  // Ability to send messages via nightbot
  'channel_send',
  // Ability to edit commands. Used to add the user configured command
  'commands',
];

const params = {
  redirect_uri: `${process.env.BASE_WEB_URL}/oauth-callback`,
  scope: scopes.join(' '),
};

const oauthClient = new AuthorizationCode({
  client: {
    id: process.env.NIGHTBOT_API_CLIENT_ID ?? '[disabled]',
    secret: process.env.NIGHTBOT_API_SECRET ?? '[disabled]',
  },
  auth: {
    tokenHost: nightbotApi,
    tokenPath: 'oauth2/token',
    authorizePath: 'oauth2/authorize',
  },
});

export function nightbotLinkApp(appConn: Connection) {
  const {store} = appConn;

  reaction(
    () =>
      store.cloudApiState.oauthState !== null &&
      store.cloudApiState.oauthState.provider === 'nightbot' &&
      store.cloudApiState.oauthState.nonce,
    action(() => {
      const redirectUrl = oauthClient.authorizeURL({...params, state: appConn.appKey});
      const oauthState = store.cloudApiState.oauthState!;
      store.cloudApiState.oauthState = {...oauthState, redirectUrl};
    })
  );
}

export function nightbotLinkClients(appKey: AppKey, socket: ApiExternalServerSocket) {
  socket.on(
    'oauth/authorize',
    async (provider: OAuthProvider, code: string, done: (err: string | null) => void) => {
      const appConn = internalStore.appConnections.get(appKey);

      if (appConn === undefined) {
        // The client will already be aware that it's not connected to the app,
        // so this is just a formality.
        done('app not connected');
        return;
      }

      const tokenParams = {...params, code};
      let accessToken: AccessToken;

      try {
        accessToken = await oauthClient.getToken(tokenParams);
      } catch (error) {
        done(error);
        return;
      }

      runInAction(
        () => (appConn.store.config.cloudTools.nightbotAuth = accessToken.token)
      );
      done(null);
    }
  );
}
