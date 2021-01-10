import Router from '@koa/router';
import Koa from 'koa';
import {Server, Socket} from 'socket.io';

import {createServer} from 'http';

type Connection = {
  socket: Socket;
};

const ingestMatcher = /^\/ingest\/([^/]+)$/;

const connections: Record<string, Connection> = {};

const app = new Koa();
const server = createServer(app.callback());
const wss = new Server(server);

const router = new Router();

router.get('/stats', ctx => {
  ctx.body = `Current number of clients: ${Object.keys(connections).length}`;
});

app.use(router.routes()).use(router.allowedMethods());

// Connect
wss.of(ingestMatcher).on('connection', socket => {
  const key = socket.nsp.name.match(ingestMatcher)[1];

  connections[key] = {
    socket,
  };

  socket.on('disconnect', () => delete connections[key]);

  socket.on('store-init', console.log);
  socket.on('store-update', console.log);
});

server.listen(8888);
