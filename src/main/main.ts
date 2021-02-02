import 'regenerator-runtime/runtime';

import {app, BrowserWindow, nativeTheme, shell} from 'electron';
import isDev from 'electron-is-dev';
import {reaction, set, when} from 'mobx';
import {bringOnline, NetworkState, ProlinkNetwork} from 'prolink-connect';

import * as path from 'path';
import * as url from 'url';

import {runConfigMigrations} from 'main/configMigrations';
import {registerDebuggingEventsService} from 'main/debugEvents';
import {setupMenu} from 'main/menu';
import {startOverlayServer} from 'main/overlayServer';
import {userInfo} from 'src/shared/sentry/main';
import {AppStore, createAppStore} from 'src/shared/store';
import {observeStore} from 'src/shared/store/ipc';
import connectNetworkStore from 'src/shared/store/network';
import {
  loadMainConfig,
  observerAndPersistConfig,
  persistConfig,
  registerMainIpc,
  registerMainWebsocket,
  startMainApiWebsocket,
} from 'src/shared/store/server';
import theme from 'src/theme';

const mainStore = createAppStore();

export const withMainStore = (cb: (store: AppStore) => void) => cb(mainStore);

// Update the store with user details ASAP
(async () => set(mainStore, {user: await userInfo}))();

// Intialize the store for the main thread immedaitely.
mainStore.isInitalized = true;

// see https://www.electronjs.org/docs/api/app#appallowrendererprocessreuse
app.allowRendererProcessReuse = true;

// Setup application menu
setupMenu(mainStore);

// Setup theme from configuration
reaction(
  () => mainStore.config.theme,
  schema => {
    nativeTheme.themeSource = schema;

    const bg = nativeTheme.shouldUseDarkColors
      ? theme.dark.background
      : theme.light.background;
    win?.setBackgroundColor(bg);
  },
  {fireImmediately: true}
);

// Require overlay main functionality
require('src/overlay/overlays/nowPlaying/main');

let win: BrowserWindow | null;

const createWindow = () => {
  win = new BrowserWindow({
    width: 920,
    minWidth: 700,
    height: 900,
    titleBarStyle: 'hiddenInset',
    title: 'Prolink Tools',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'sentry.js'),
    },
    backgroundColor: nativeTheme.shouldUseDarkColors
      ? theme.dark.background
      : theme.light.background,
  });

  win.on('closed', () => (win = null));

  if (isDev) {
    process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1';
    win.webContents.once('dom-ready', () => win!.webContents.openDevTools());
  }

  const indexUrl = isDev
    ? 'http://127.0.0.1:2003/index.html'
    : url.format({
        pathname: path.join(__dirname, 'index.html'),
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
  await loadMainConfig(mainStore);
  observerAndPersistConfig(mainStore);
  mainStore.config.ensureDefaults();
  runConfigMigrations(mainStore);

  createWindow();

  const [register] = observeStore({target: mainStore});
  registerMainIpc(mainStore, register);

  let network: ProlinkNetwork;

  // Open connections to the network
  try {
    network = await bringOnline();
    mainStore.networkState = network.state;
  } catch (e) {
    if (e.errno !== 'EADDRINUSE') {
      throw e;
    }

    // Something is using the status port... Most likely rekordbox
    mainStore.networkState = NetworkState.Failed;
    return;
  }

  // Attempt to autoconfigure from other devices on the network
  await network.autoconfigFromPeers();
  network.connect();
  mainStore.networkState = network.state;

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
  const httpServer = await startOverlayServer();

  // Start the main websocket on the overlay server
  registerMainWebsocket(mainStore, httpServer, register);

  // Connect to api.prolink.tools when enabled
  reaction(
    () => mainStore.config.enableCloudApi,
    enabled => {
      if (enabled) {
        const disconnect = startMainApiWebsocket(mainStore, register);
        when(() => mainStore.config.enableCloudApi === false, disconnect);
      }
    },
    {fireImmediately: true}
  );

  connectNetworkStore(mainStore, network);
  registerDebuggingEventsService(mainStore, network);
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

app.on('will-quit', async event => {
  const didMark = mainStore.config.markLatestVersion();

  if (didMark) {
    event.preventDefault();
    await persistConfig(mainStore);
    app.quit();
  }
});
