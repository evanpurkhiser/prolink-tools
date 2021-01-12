import 'tsconfig-paths/register';

import Router from '@koa/router';
import Koa from 'koa';
import {Server, Socket} from 'socket.io';

import {createServer} from 'http';

import {AppStore, createStore} from 'src/shared/store';
import {registerWebsocketListener} from 'src/shared/store/ipc';

type Connection = {
  socket: Socket;
  store: AppStore;
};

const ingestMatcher = /^\/ingest\/([^/]+)$/;

const connections: Record<string, Connection> = {};

const app = new Koa();
const server = createServer(app.callback());
const wss = new Server(server);

const router = new Router();

router.get('/stats', ctx => {
  const data = Object.keys(connections).map(key => ({
    key,
    devices: [...connections[key].store.devices.values()].map(d => d.device.name),
    user: connections[key].store.user?.username,
  }));

  ctx.body = `Client Info: ${JSON.stringify(data)}`;
});

app.use(router.routes()).use(router.allowedMethods());

// Connect
wss.of(ingestMatcher).on('connection', socket => {
  const key = socket.nsp.name.match(ingestMatcher)[1];
  const store = createStore();

  connections[key] = {socket, store};

  registerWebsocketListener(store, socket);

  socket.on('disconnect', () => delete connections[key]);
});

server.listen(8888);
