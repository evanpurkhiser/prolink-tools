import {cloneDeep, random} from 'lodash';
import {CDJStatus, MediaSlot, TrackType} from 'prolink-connect/lib/types';

import store from 'src/shared/store';
import {makeRandomTrack} from 'src/utils/randomMetadata';

export async function loadTrack(deviceId: number, state: Partial<CDJStatus.State>) {
  const d = store.devices.get(deviceId)!;
  const track = await makeRandomTrack({artwork: true});

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
    beat: -1,
    packetNum: 0,
    ...state,
  };

  await new Promise(r => setTimeout(r, 500));

  d.state.playState = CDJStatus.PlayState.Cued;
}

export function updateState(deviceId: number, state: Partial<CDJStatus.State>) {
  const d = store.devices.get(deviceId)!;

  d.state = {...d.state!, ...state};
}

export async function tapCue(deviceId: number) {
  const s = store.devices.get(deviceId)!.state!;

  for (let i = 0; i < 4; ++i) {
    s.playState = CDJStatus.PlayState.Cuing;
    s.beatInMeasure = 2;
    await new Promise(r => setTimeout(r, 100));
    s.playState = CDJStatus.PlayState.Cued;
    s.beatInMeasure = 1;
    await new Promise(r => setTimeout(r, 160));
  }
}

export async function setPitch(deviceId: number, pitch: number) {
  const s = store.devices.get(deviceId)!.state!;

  while (s.sliderPitch < pitch) {
    s.sliderPitch += 0.02;
    await new Promise(r => setTimeout(r, random(1, 5)));
  }
}

export function incrementBeat(deviceId: number) {
  const s = store.devices.get(deviceId)!.state!;

  s.playState = CDJStatus.PlayState.Playing;
  s.beat = (s.beat ?? 0) + 1;
  s.beatInMeasure = (s.beat % 4) + 1;
  s.beatsUntilCue =
    s.beatsUntilCue === null || s.beatsUntilCue < 1 ? null : (s.beatsUntilCue ?? 0) - 1;
}

export function markAsPlaying(deviceId: number) {
  const s = store.devices.get(deviceId)!;

  // Deep clone since we cannot observe two of the same object in our store
  store.mixstatus.trackHistory.push({
    track: cloneDeep(s.track!),
    artwork: s.artwork,
    playedAt: new Date(),
  });
}
