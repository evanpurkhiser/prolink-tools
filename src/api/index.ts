import 'tsconfig-paths/register';

import Router from '@koa/router';
import Koa from 'koa';
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

wss.on('connection', (client: Socket) => {
  client.emit('api-store-init', serialize(ApiStore, apiStore));
  registerListener(change => wss.sockets.emit('api-store-update', change));

  /**
   * Respond to overlay key lookups, providng the appKey.
   */
  client.on('appKey:by-overlay-key', (overlayKey: string, respond: any) =>
    respond(internalStore.overlayKeyMap[overlayKey]?.appKey ?? null)
  );
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

app.use(router.routes()).use(router.allowedMethods());
server.listen(8888);
