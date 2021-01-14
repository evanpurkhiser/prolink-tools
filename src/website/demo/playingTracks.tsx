import {Address4} from 'ip-address';
import {action, runInAction} from 'mobx';
import {CDJStatus, Device, DeviceType, NetworkState} from 'prolink-connect/lib/types';

import {AppStore, DeviceStore} from 'src/shared/store';
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
    fn: action((s: AppStore) => {
      s.isInitalized = true;
      s.networkState = NetworkState.Online;
      s.config.sidebarCollapsed = true;

      s.config.overlays.push({
        key: 'exampleNowPlaying',
        type: 'nowPlaying',
        config: {theme: 'asot', tags: ['label'], historyCount: 1},
      });
    }),
  },
  {
    delay: 4000,
    fn: action((s: AppStore) => {
      s.networkState = NetworkState.Connected;
    }),
  },
  {
    delay: 200,
    repeat: 2,
    fn: (s, {run}) => {
      const device: Device = {
        id: run + 2,
        name: 'CDJ-2000nxs2',
        type: DeviceType.CDJ,
        ip: new Address4('192.16.0.0'),
        macAddr: Uint8Array.from([0, 0, 0, 0, 0, 0, 0]),
      };

      runInAction(() => {
        s.networkState = NetworkState.Connected;
        s.devices.set(device.id, new DeviceStore(device));
      });
    },
  },
  {
    delay: 150,
    fn: action((s: AppStore) => {
      const device: Device = {
        id: 10,
        name: 'DJM-900nxs2',
        type: DeviceType.Mixer,
        ip: new Address4('192.16.0.0'),
        macAddr: Uint8Array.from([0, 0, 0, 0, 0, 0, 0]),
      };
      s.devices.set(device.id, new DeviceStore(device));
    }),
  },
]);

const playPairs = (s: AppStore) => {
  let beat = 0;

  const atBeats = ([start, end]: [number, number?], fn: () => void) => {
    if (beat === start || (end !== undefined && beat > start && beat <= end)) {
      fn();
    }
  };

  setInterval(() => {
    // Dealy if 1st track sin't loaded immediately
    if (beat > 0 && s.devices.get(2)!.state === undefined) {
      return;
    }
    // Delay if 2nd track isn't loaded by beat 22
    if (beat > 22 && s.devices.get(3)!.state === undefined) {
      return;
    }

    // First track loaded and playing
    atBeats([0], () => loadTrack(s, 2, {beatsUntilCue: 40}));
    atBeats([1, 48], () => incrementBeat(s, 2));
    atBeats([1], () => markAsPlaying(s, 2));

    // Second track loaded and playing
    atBeats([16], () => loadTrack(s, 3, {beatsUntilCue: 33}));
    atBeats([24], () => setPitch(s, 3, 1.44));
    atBeats([26], () => tapCue(s, 3));
    atBeats([40, 84], () => incrementBeat(s, 3));

    // First track ending
    atBeats([46], () => updateState(s, 2, {isOnAir: false}));
    atBeats([48], () => updateState(s, 2, {playState: CDJStatus.PlayState.Cued}));
    atBeats([48], () => markAsPlaying(s, 3));

    // First track loading again after ending
    atBeats([52], () => loadTrack(s, 2, {beatsUntilCue: 33}));

    atBeats([60], () => setPitch(s, 3, 1.44));
    atBeats([66], () => tapCue(s, 2));
    atBeats([72, 84], () => incrementBeat(s, 2));

    // Second track ending
    atBeats([75], () => updateState(s, 3, {isOnAir: false}));
    atBeats([79], () => updateState(s, 3, {playState: CDJStatus.PlayState.Cued}));
    atBeats([79], () => markAsPlaying(s, 2));

    beat = beat === 79 ? 16 : beat + 1;
  }, ONE_BEAT);
};

const playingTracksRoutine = new Routine([
  {fn: s => bootRoutine.run(s)},
  {fn: s => playPairs(s)},
]);

export default playingTracksRoutine;
