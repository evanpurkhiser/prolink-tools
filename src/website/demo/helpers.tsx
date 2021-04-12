import {cloneDeep, random} from 'lodash';
import {action, runInAction} from 'mobx';
import {CDJStatus, MediaSlot, TrackType} from 'prolink-connect/lib/types';

import {AppStore, PlayedTrack} from 'src/shared/store';
import {makeRandomTrack} from 'src/utils/randomMetadata';

export const loadTrack = async (
  store: AppStore,
  deviceId: number,
  state: Partial<CDJStatus.State>
) => {
  const d = store.devices.get(deviceId)!;
  const track = await makeRandomTrack({artwork: true});

  runInAction(() => {
    d.track = track.track;
    d.artwork = track.artwork;

    d.state = {
      deviceId: 1,
      trackId: 1,
      trackDeviceId: 1,
      trackSlot: MediaSlot.USB,
      trackType: TrackType.RB,
      playState: CDJStatus.PlayState.Loading,
      isOnAir: true,
      isSync: false,
      isMaster: false,
      trackBPM: 138,
      effectivePitch: 0,
      sliderPitch: 0,
      beatInMeasure: 1,
      beatsUntilCue: null,
      isEmergencyMode: false,
      beat: -1,
      packetNum: 0,
      ...state,
    };
  });

  await new Promise(r => setTimeout(r, 500));

  runInAction(() => (d.state!.playState = CDJStatus.PlayState.Cued));
};

export const updateState = action(
  (store: AppStore, deviceId: number, state: Partial<CDJStatus.State>) => {
    const d = store.devices.get(deviceId)!;

    d.state = {...d.state!, ...state};
  }
);

export const tapCue = async (store: AppStore, deviceId: number) => {
  const s = store.devices.get(deviceId)!.state!;

  for (let i = 0; i < 4; ++i) {
    runInAction(() => {
      s.playState = CDJStatus.PlayState.Cuing;
      s.beatInMeasure = 2;
    });
    await new Promise(r => setTimeout(r, 100));
    runInAction(() => {
      s.playState = CDJStatus.PlayState.Cued;
      s.beatInMeasure = 1;
    });
    await new Promise(r => setTimeout(r, 160));
  }
};

export const setPitch = async (store: AppStore, deviceId: number, pitch: number) => {
  const s = store.devices.get(deviceId)!.state!;

  while (s.sliderPitch < pitch) {
    runInAction(() => (s.sliderPitch += 0.02));
    await new Promise(r => setTimeout(r, random(1, 5)));
  }
};

export const incrementBeat = action((store: AppStore, deviceId: number) => {
  const s = store.devices.get(deviceId)!.state!;

  s.playState = CDJStatus.PlayState.Playing;
  s.beat = (s.beat ?? 0) + 1;
  s.beatInMeasure = (s.beat % 4) + 1;
  s.beatsUntilCue =
    s.beatsUntilCue === null || s.beatsUntilCue < 1 ? null : (s.beatsUntilCue ?? 0) - 1;
});

export const markAsPlaying = action((store: AppStore, deviceId: number) => {
  const s = store.devices.get(deviceId)!;

  // Deep clone since we cannot observe two of the same object in our store
  const played = new PlayedTrack(new Date(), cloneDeep(s.track!));
  played.artwork = s.artwork;

  store.mixstatus.trackHistory.push(played);
});
