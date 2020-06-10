import 'regenerator-runtime/runtime';
import 'src/shared/sentryConfig';

import * as path from 'path';
import * as url from 'url';
import {app, BrowserWindow} from 'electron';
import {bringOnline} from 'prolink-connect';
import isDev from 'electron-is-dev';
import http from 'http';
import httpProxy from 'http-proxy';
import httpStatic from 'node-static';
import socketio from 'socket.io';

import connectNetworkStore from 'src/shared/store/network';
import {registerMainIpc, registerMainWebsocket, observeStore} from 'src/shared/store/ipc';
import store from 'src/shared/store';

const WEBSERVER_PORT = 5152;

// see https://www.electronjs.org/docs/api/app#appallowrendererprocessreuse
app.allowRendererProcessReuse = true;

let win: BrowserWindow | null;

const createWindow = () => {
  win = new BrowserWindow({
    width: 700,
    minWidth: 700,
    height: 400,
    titleBarStyle: 'hiddenInset',
    title: 'Prolink Tools',
    webPreferences: {
      nodeIntegration: true,
    },
  });

  if (isDev) {
    process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1';
    win.loadURL(`http://localhost:2003/app.html`);
    win.webContents.once('dom-ready', () => win!.webContents.openDevTools());
  } else {
    win.loadURL(
      url.format({
        pathname: path.join(__dirname, 'app.html'),
        protocol: 'file:',
        slashes: true,
      })
    );
  }

  win.on('closed', () => (win = null));

  return win;
};

const fileServer = new httpStatic.Server(__dirname, {indexFile: 'overlay.html'});
const proxy = httpProxy.createProxy();

const handleOverlayRequest: http.RequestListener = isDev
  ? (req, resp) => proxy.web(req, resp, {target: 'http://localhost:2003'})
  : (req, resp) => fileServer.serve(req, resp);

app.on('ready', async () => {
  createWindow();
  registerMainIpc();
  observeStore();

  // Open connections to the network
  const network = await bringOnline();
  store.networkState = network.state;

  // Attempt to autoconfigure from other devices on the network
  await network.autoconfigFromPeers();
  network.connect();
  store.networkState = network.state;

  // Setup overlay server
  const httpServer = http.createServer(handleOverlayRequest);

  // Setup socketio server
  const wss = socketio(httpServer, {serveClient: false});
  registerMainWebsocket(wss);

  await new Promise(resolve =>
    httpServer.listen(WEBSERVER_PORT, '0.0.0.0', () => resolve())
  );

  connectNetworkStore(network);
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
