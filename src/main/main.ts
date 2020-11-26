import 'regenerator-runtime/runtime';

import {app, BrowserWindow, shell} from 'electron';
import isDev from 'electron-is-dev';
import {set} from 'mobx';
import {bringOnline, NetworkState, ProlinkNetwork} from 'prolink-connect';

import * as path from 'path';
import * as url from 'url';

import {startOverlayServer} from 'main/overlayServer';
import {runConfigMigrations} from 'src/main/configMigrations';
import {registerDebuggingEventsService} from 'src/main/debugEvents';
import {userInfo} from 'src/shared/sentry/main';
import store from 'src/shared/store';
import {loadMainConfig, observeStore, registerMainIpc} from 'src/shared/store/ipc';
import connectNetworkStore from 'src/shared/store/network';

// Update the store with user details ASAP
(async () => set(store, {user: await userInfo}))();

// Intialize the store for the main thread immedaitely.
store.isInitalized = true;

// see https://www.electronjs.org/docs/api/app#appallowrendererprocessreuse
app.allowRendererProcessReuse = true;

let win: BrowserWindow | null;

const createWindow = () => {
  win = new BrowserWindow({
    width: 850,
    minWidth: 700,
    height: 700,
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
  runConfigMigrations();
  observeStore();

  let network: ProlinkNetwork;

  // Open connections to the network
  try {
    network = await bringOnline();
    store.networkState = network.state;
  } catch (e) {
    if (e.errno !== 'EADDRINUSE') {
      throw e;
    }

    // Something is using the status port... Most likely rekordbox
    store.networkState = NetworkState.Failed;
    return;
  }

  // Attempt to autoconfigure from other devices on the network
  await network.autoconfigFromPeers();
  network.connect();
  store.networkState = network.state;

  // Start overlay http / websocket server.
  //
  // XXX: Becuase of a strange bug in MacOS's firewall dialog, if two
  // connections are opened at the same time before the program is given
  // permission to open connections, when the software is closed the kernel
  // will not correctly close one of the ports.
  //
  // Because the `network.bringOnline` will block until connected we ensure two
  // are not opened
  //
  // As thus THIS LINE MUST BE PLACED AFTER THE NETWORK IS BROUGHT ONLINE.
  //
  await startOverlayServer();

  connectNetworkStore(network);
  registerDebuggingEventsService(network);
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
