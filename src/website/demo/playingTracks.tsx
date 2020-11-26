import {Address4} from 'ip-address';
import {CDJStatus, Device, DeviceType, NetworkState} from 'prolink-connect/lib/types';

import store, {DeviceStore} from 'src/shared/store';
import Routine from 'src/website/demo/routine';

import {
  incrementBeat,
  loadTrack,
  markAsPlaying,
  setPitch,
  tapCue,
  updateState,
} from './helpers';

const ONE_BEAT = (1 / (140 / 60)) * 1000;

const bootRoutine = new Routine([
  {
    fn: () => {
      store.isInitalized = true;
      store.networkState = NetworkState.Online;

      store.config.overlays.push({
        key: 'exampleNowPlaying',
        type: 'nowPlaying',
        config: {theme: 'asot', tags: ['label'], historyCount: 1},
      });
    },
  },
  {
    delay: 4000,
    fn: () => {
      store.networkState = NetworkState.Connected;
    },
  },
  {
    delay: 200,
    repeat: 2,
    fn: ({run}) => {
      const device: Device = {
        id: run + 2,
        name: 'CDJ-2000nxs2',
        type: DeviceType.CDJ,
        ip: new Address4('192.16.0.0'),
        macAddr: Uint8Array.from([0, 0, 0, 0, 0, 0, 0]),
      };

      store.networkState = NetworkState.Connected;
      store.devices.set(device.id, new DeviceStore(device));
    },
  },
  {
    delay: 150,
    fn: () => {
      const device: Device = {
        id: 10,
        name: 'DJM-900nxs2',
        type: DeviceType.Mixer,
        ip: new Address4('192.16.0.0'),
        macAddr: Uint8Array.from([0, 0, 0, 0, 0, 0, 0]),
      };
      store.devices.set(device.id, new DeviceStore(device));
    },
  },
]);

const playPairs = () => {
  let beat = 0;

  const atBeats = ([start, end]: [number, number?], fn: () => void) => {
    if (beat === start || (end !== undefined && beat > start && beat <= end)) {
      fn();
    }
  };

  setInterval(() => {
    // Dealy if 1st track sin't loaded immediately
    if (beat > 0 && store.devices.get(2)!.state === undefined) {
      return;
    }
    // Delay if 2nd track isn't loaded by beat 22
    if (beat > 22 && store.devices.get(3)!.state === undefined) {
      return;
    }

    // First track loaded and playing
    atBeats([0], () => loadTrack(2, {beatsUntilCue: 40}));
    atBeats([1, 48], () => incrementBeat(2));
    atBeats([1], () => markAsPlaying(2));

    // Second track loaded and playing
    atBeats([16], () => loadTrack(3, {beatsUntilCue: 33}));
    atBeats([24], () => setPitch(3, 1.44));
    atBeats([26], () => tapCue(3));
    atBeats([40, 84], () => incrementBeat(3));

    // First track ending
    atBeats([46], () => updateState(2, {isOnAir: false}));
    atBeats([48], () => updateState(2, {playState: CDJStatus.PlayState.Cued}));
    atBeats([48], () => markAsPlaying(3));

    // First track loading again after ending
    atBeats([52], () => loadTrack(2, {beatsUntilCue: 33}));

    atBeats([60], () => setPitch(3, 1.44));
    atBeats([66], () => tapCue(2));
    atBeats([72, 84], () => incrementBeat(2));

    // Second track ending
    atBeats([75], () => updateState(3, {isOnAir: false}));
    atBeats([79], () => updateState(3, {playState: CDJStatus.PlayState.Cued}));
    atBeats([79], () => markAsPlaying(2));

    beat = beat == 79 ? 16 : beat + 1;
  }, ONE_BEAT);
};

const mainRoutine = new Routine([{fn: () => bootRoutine.run()}, {fn: () => playPairs()}]);

export default () => mainRoutine.run();
