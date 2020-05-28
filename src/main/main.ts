import 'source-map-support/register';
import 'module-alias/register';

import {app, BrowserWindow} from 'electron';
import * as path from 'path';
import * as url from 'url';
import {bringOnline} from 'prolink-connect';

import connectNetworkStore from 'src/shared/store/network';
import {registerMainIpc} from 'src/shared/store/ipc';
import store from 'src/shared/store';

// see https://www.electronjs.org/docs/api/app#appallowrendererprocessreuse
app.allowRendererProcessReuse = true;

let win: BrowserWindow | null;

const createWindow = async () => {
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

  if (process.env.NODE_ENV !== 'production') {
    process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1';
    win.loadURL(`http://localhost:2003`);
  } else {
    win.loadURL(
      url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true,
      })
    );
  }

  if (process.env.NODE_ENV !== 'production') {
    win.webContents.once('dom-ready', () => win!.webContents.openDevTools());
  }

  win.on('closed', () => (win = null));

  return win;
};

app.on('ready', async () => {
  createWindow();
  registerMainIpc();

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
