import Router from '@koa/router';
import {runInAction} from 'mobx';
import {AccessToken, AuthorizationCode} from 'simple-oauth2';

import {InternalStore} from 'src/api/internalStore';

const nightbotApi = 'https://api.nightbot.tv';

const scopes = [
  // Ability to send messages via nightbot
  'channel_send',
  // Ability to edit commands. Used to add the user configured command
  'commands',
];

const redirectUrl = `${process.env.BASE_API_URL}/authorize/nightbot`;

const params = {
  redirect_uri: redirectUrl,
  scope: scopes.join(' '),
};

export function setupNightbot(apiStore: InternalStore, router: Router) {
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

  router.get('/connect/nightbot/:appKey', (ctx, next) => {
    const {appKey} = ctx.params;
    const redirectUrl = oauthClient.authorizeURL({...params, state: appKey});

    if (ctx.accepts('json')) {
      ctx.body = {redirectUrl};
    } else {
      ctx.redirect(redirectUrl);
    }

    next();
  });

  router.get('/authorize/nightbot', async (ctx, next) => {
    const appKey = ctx.request.query.state;
    const tokenParams = {...params, code: ctx.request.query.code};

    let accessToken: AccessToken | null = null;

    try {
      accessToken = await oauthClient.getToken(tokenParams);
    } catch (error) {
      ctx.body = error.message;
      ctx.status = 400;
      return next();
    }

    const appConn = apiStore.appConnections.get(appKey);

    if (appConn === undefined) {
      ctx.body = 'Prolink Tools connection not present';
      ctx.status = 400;
      return next();
    }

    runInAction(
      () => (appConn.store.config.cloudTools.nightbotAuth = accessToken!.token)
    );

    return next();
  });
}
