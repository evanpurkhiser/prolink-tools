import 'module-alias/register';

import {app, BrowserWindow} from 'electron';
import * as path from 'path';
import * as url from 'url';

import {bringOnline} from 'prolink-connect';
import {connectToNetwork} from 'src/shared/store';

let win: BrowserWindow | null;

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  );
};



const createWindow = async () => {
  if (process.env.NODE_ENV !== 'production') {
    await installExtensions();
  }

  win = new BrowserWindow({
    width: 800,
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

  const network = await bringOnline();
  await network.autoconfigFromPeers();

  network.connect();
  connectToNetwork(win, network);

  win.on('closed', () => (win = null));
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
