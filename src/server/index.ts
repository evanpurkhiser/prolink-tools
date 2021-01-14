import 'tsconfig-paths/register';

import Router from '@koa/router';
import Koa from 'koa';
import {autorun, runInAction} from 'mobx';
import {Server, Socket} from 'socket.io';

import {createServer} from 'http';

import {AppStore, createAppStore} from 'src/shared/store';
import {registerWebsocketListener} from 'src/shared/store/client';

import {createServerStore} from './serverStore';

/**
 * Global server store maintaining in memory state
 */
const serverStore = createServerStore();

type Connection = {
  /**
   * The active websocket connection to the client
   */
  socket: Socket;
  /**
   * The observable store which will be synced to events recieved via the
   * socket
   */
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
    playedTracks: connections[key].store.mixstatus.trackHistory.map(h => ({
      title: h.track.title,
      id: h.metadataIncludes(connections[key].store.config.idMarker),
    })),
  }));

  ctx.body = data;
});

app.use(router.routes()).use(router.allowedMethods());

// Register a client and setup socket handlers
wss.of(ingestMatcher).on('connection', socket => {
  const key = socket.nsp.name.match(ingestMatcher)[1];
  const store = createAppStore();

  connections[key] = {socket, store};
  runInAction(() => serverStore.clientCount++);

  registerWebsocketListener(store, socket);

  autorun(() => {
    const history = store.mixstatus.trackHistory;

    if (history.length === 0) {
      return;
    }

    console.log('updating last played: ', history[0].track.title);
    runInAction(() => (serverStore.lastPlayedTrack = history[0]));
  });

  socket.on('disconnect', () => {
    runInAction(() => serverStore.clientCount--);
    delete connections[key];
  });
});

server.listen(8888);
