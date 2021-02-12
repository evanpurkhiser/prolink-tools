import 'tsconfig-paths/register';
import 'src/shared/sentry/api';

import Router from '@koa/router';
import Koa from 'koa';
import {when} from 'mobx';
import {serialize} from 'serializr';
import {Server, Socket} from 'socket.io';

import {createServer} from 'http';

import {observeStore} from 'src/shared/store/ipc';

import {ApiStore, createApiStore} from './apiStore';
import {createInternalStore} from './internalStore';
import {ingestSocketNamespace, registerAppConnection} from './registerApp';
import {clientAppStoreNamespace, registerClientConnection} from './registerClient';

const app = new Koa();
const server = createServer(app.callback());

/**
 * The active websocket server
 */
const wss = new Server(server, {
  cors: {origin: '*', methods: ['GET', 'POST']},
});

/**
 * Global api store maintaining websocket based API state
 */
export const apiStore = createApiStore();

/**
 * Internal api store used to maintain private state
 */
export const internalStore = createInternalStore();

/**
 * Global api store observer
 */
const [registerListener] = observeStore({target: apiStore});
registerListener('global-api-store', change =>
  wss.sockets.emit('api-store-update', change)
);

wss.on('connection', (client: Socket) => {
  client.emit('api-store-init', serialize(ApiStore, apiStore));

  /**
   * Respond to overlay key lookups, providng the appKey.
   */
  client.on('appKey:by-overlay-key', (overlayKey: string, respond: any) => {
    // If the app providing this overlay key isn't already connected we should
    // wait for it to show up.
    const disposeDeferredKeyLookup = when(
      () => overlayKey in internalStore.overlayKeyMap,
      () => respond(internalStore.overlayKeyMap[overlayKey]!.appKey)
    );
    // Client disconnected, avoid memory leaks and dispose of remaining reactions
    client.on('disconnect', () => disposeDeferredKeyLookup());
  });
});

/**
 * Register app clients from the ingest socket
 */
wss.of(ingestSocketNamespace).on('connection', registerAppConnection);

/**
 * Register AppStore subscribers provided an appKey
 */
wss.of(clientAppStoreNamespace).on('connection', registerClientConnection);

// TODO: Add API routes
const router = new Router();

/**
 * Get nowplaying text for a specific appKey
 */
router.get('/now-playing/:appKey', (ctx, next) => {
  const {appKey} = ctx.params;
  const store = internalStore.appConnections.get(appKey)?.store;

  if (store === undefined) {
    ctx.body = 'Nothing is playing!';
    return next();
  }

  const {trackHistory} = store.mixstatus;

  if (trackHistory.length === 0) {
    ctx.body = 'Nothing is playing!';
    return next();
  }

  const {track} = trackHistory[trackHistory.length - 1];

  ctx.body = `${track.artist?.name ?? 'Unknown Artist'} - ${track.title}`;
  return next();
});

app.use(router.routes()).use(router.allowedMethods());
server.listen(8888);
