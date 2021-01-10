import Koa from 'koa';
import {Server} from 'socket.io';

import {createServer} from 'http';

const app = new Koa();
const server = createServer(app.callback());

const wss = new Server(server);

wss.of('/ingest').on('connection', socket => {
  socket.on('store-init', console.log);
  socket.on('store-update', console.log);
});

console.log('here we gooo');

app.use(ctx => {
  ctx.body = 'Hello World';
});

server.listen(3000);
