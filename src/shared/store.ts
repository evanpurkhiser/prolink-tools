import {BrowserWindow, ipcRenderer, ipcMain} from 'electron';
import {observable, autorun, toJS, reaction} from 'mobx';
import {
  Track,
  CDJStatus,
  Device,
  DeviceID,
  FetchProgress,
  HydrationProgress,
  ProlinkNetwork,
} from 'prolink-connect';

/**
 * The observable list of active devices
 */
export const devices = observable.map<DeviceID, Device>();

/**
 * The observable map of device states
 */
export const states = observable.map<DeviceID, CDJStatus.State>();

export const localdbState = observable.object({
  /**
   * The observable state of the local database fetch progress
   */
  fetchProgress: observable.map<DeviceID, FetchProgress>(),
  /**
   * The observable state of the local database hydration progress
   */
  hydrationProgress: observable.map<DeviceID, HydrationProgress>(),
});

/**
 * The observable map of trackIds -> tracks. Contains actively loaded tracks.
 */
export const tracks = observable.map<DeviceID, Track>();

/**
 * Connect the electron main process's prolink network instance to the
 * observable store data. As well as hookup IPC to the main window to send
 * state changes.
 */
export function connectToNetwork(win: BrowserWindow, network: ProlinkNetwork) {
  if (!network.isConnected()) {
    return;
  }

  // Update device list from prolink network
  network.deviceManager.on('connected', () => {
    console.log(network.deviceManager.devices);
    devices.replace(network.deviceManager.devices);
  });
  network.deviceManager.on('disconnected', () =>
    devices.replace(network.deviceManager.devices)
  );

  network.localdb.on('fetchProgress', progress =>
    // TODO: This isn't quite right as we dont account for the slot
    localdbState.fetchProgress.set(progress.device.id, progress.progress)
  );

  network.localdb.on('hydrationProgress', progress =>
    // TODO: This isn't quite right as we dont account for the slot
    localdbState.hydrationProgress.set(progress.device.id, progress.progress)
  );

  // Update device states from prolink network
  network.statusEmitter.on('status', async s => states.set(s.deviceId, s));

  network.localdb.on('fetchProgress', console.log);
  network.localdb.on('hydrationProgress', console.log);

  reaction(
    () => states.get(2)?.trackId,
    async () => {
      const s = states.get(2)!;

      const track = await network.db.getMetadata({
        deviceId: s.trackDeviceId,
        trackSlot: s.trackSlot,
        trackType: s.trackType,
        trackId: s.trackId,
      });

      console.log(track);
    }
  );

  // Send changes via IPC
  const sendDevices = () => win?.webContents.send('prolink:devices', toJS(devices));
  const sendState = () => win?.webContents.send('prolink:state', toJS(states));
  const sendLocaldbState = () =>
    win?.webContents.send('prolink:localdb-state', toJS(localdbState));

  autorun(sendDevices);
  autorun(sendState);
  autorun(sendLocaldbState);

  // Send all data when requested
  ipcMain.on('init-data', () => {
    sendDevices();
    sendState();
    sendLocaldbState();
  });
}

export function connectRenderer() {
  ipcRenderer.send('init-data');

  ipcRenderer.on('prolink:devices', (_: any, data: Record<DeviceID, Device>) =>
    devices.replace(data)
  );

  ipcRenderer.on('prolink:state', (_: any, data: Record<DeviceID, CDJStatus.State>) => {
    states.replace(Object.entries(data).map(([k, v]) => [Number(k), v]));
  });

  ipcRenderer.on('prolink:localdb-state', (_: any, data: typeof localdbState) => {
    localdbState.fetchProgress.replace(data.fetchProgress);
    localdbState.hydrationProgress.replace(data.hydrationProgress);

    console.log(data.fetchProgress);
  });
}

autorun(() => console.log(devices.toJSON()));
