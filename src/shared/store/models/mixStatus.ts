import {action, makeObservable, observable} from 'mobx';
import {Track} from 'prolink-connect/lib/types';
import {date, list, object, serializable} from 'serializr';

import {bufferSerialize, rawJsSerialize} from 'src/shared/store/utils';
import metadatIncludes from 'src/utils/metadatIncludes';

export class PlayedTrack {
  @serializable(date())
  playedAt: Date;

  @serializable(rawJsSerialize)
  track: Track;

  @serializable(bufferSerialize)
  artwork?: Uint8Array;

  metadataIncludes(marker?: string) {
    return marker !== undefined && marker !== ''
      ? metadatIncludes(this.track, marker)
      : false;
  }

  constructor(playedAt: Date, track: Track) {
    this.playedAt = playedAt;
    this.track = track;
  }
}

export class MixstatusStore {
  /**
   * Records an ordered list of every track that was played in the current set
   */
  @serializable(list(object(PlayedTrack)))
  @observable
  trackHistory = observable.array<PlayedTrack>();

  @action
  addPlayedTrack(played: PlayedTrack) {
    this.trackHistory.push(played);
  }

  constructor() {
    makeObservable(this);
  }
}
