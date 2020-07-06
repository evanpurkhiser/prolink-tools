import 'regenerator-runtime/runtime';
import 'src/shared/sentry/main';

import * as path from 'path';
import * as url from 'url';
import {app, BrowserWindow, shell} from 'electron';
import {bringOnline} from 'prolink-connect';
import isDev from 'electron-is-dev';

import {startOverlayServer} from 'main/overlayServer';
import {registerMainIpc, observeStore, loadMainConfig} from 'src/shared/store/ipc';
import connectNetworkStore from 'src/shared/store/network';
import store from 'src/shared/store';

// see https://www.electronjs.org/docs/api/app#appallowrendererprocessreuse
app.allowRendererProcessReuse = true;

let win: BrowserWindow | null;

const createWindow = () => {
  win = new BrowserWindow({
    width: 700,
    minWidth: 700,
    height: 600,
    titleBarStyle: 'hiddenInset',
    title: 'Prolink Tools',
    webPreferences: {nodeIntegration: true},
  });

  win.on('closed', () => (win = null));

  if (isDev) {
    process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1';
    win.webContents.once('dom-ready', () => win!.webContents.openDevTools());
  }

  const indexUrl = isDev
    ? 'http://127.0.0.1:2003/app.html'
    : url.format({
        pathname: path.join(__dirname, 'app.html'),
        protocol: 'file:',
        slashes: true,
      });

  win.loadURL(indexUrl);

  win.webContents.on('will-navigate', (e, url) => {
    if (win && url !== win.webContents.getURL() && url.startsWith('http')) {
      e.preventDefault();
      shell.openExternal(url);
    }
  });

  return win;
};
app.on('ready', async () => {
  createWindow();

  await loadMainConfig();
  registerMainIpc();
  observeStore();

  // Start overlay http / websocket server
  await startOverlayServer();

  // Open connections to the network
  const network = await bringOnline();
  store.networkState = network.state;

  // Attempt to autoconfigure from other devices on the network
  await network.autoconfigFromPeers();
  network.connect();
  store.networkState = network.state;

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
