import {action, computed, makeObservable, observable} from 'mobx';
import {Track} from 'prolink-connect/lib/types';
import {date, list, object, primitive, serializable} from 'serializr';

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

export class IndividualSet {
  /**
   * The list of tracks played during this set
   */
  tracks: PlayedTrack[];

  /**
   * Is this set happening right now?
   */
  isActive = false;

  /**
   * Returns a unique ID for the set. It is the timestamp of the first played
   * track, but is not gaurenteed to always be in the future.
   */
  get id() {
    const firstTrack = this.tracks[0];

    if (firstTrack === undefined) {
      return 'empty-set';
    }

    return firstTrack.playedAt.getTime();
  }

  get lastPlayed(): PlayedTrack | undefined {
    return this.tracks[this.tracks.length - 1];
  }

  constructor(history: PlayedTrack[]) {
    this.tracks = history;
  }
}

export class MixstatusStore {
  /**
   * Records an ordered list of every track that was played in the current set
   */
  @serializable(list(object(PlayedTrack)))
  @observable
  trackHistory = observable.array<PlayedTrack>();

  /**
   * The set markers mark when a specific track index in the trackHistory is
   * the "last" track of a set. This can be used to partiton
   */
  @serializable(list(primitive()))
  @observable
  setEndIndexes = observable.array<number>();

  /**
   * Returns the current live set
   */
  @computed
  get liveSet() {
    const {setHistory} = this;
    return setHistory[setHistory.length - 1];
  }

  /**
   * Returns a list of IndividualSet objects computed from the track history
   * and set end markers.
   */
  @computed
  get setHistory() {
    const sets = [0, ...this.setEndIndexes]
      .reduce<PlayedTrack[][]>(
        (acc, start, end) => [
          ...acc,
          this.trackHistory.slice(start, this.setEndIndexes.slice()[end]),
        ],
        []
      )
      .map(history => new IndividualSet(history));

    // Mark the last set as being the current live set
    sets[sets.length - 1].isActive = true;

    return sets;
  }

  /**
   * Insert a set end marker in the history, creating a new set history.
   */
  @action
  recordSetEnd() {
    this.setEndIndexes.push(this.trackHistory.length);
  }

  @action
  addPlayedTrack(played: PlayedTrack) {
    this.trackHistory.push(played);
  }

  constructor() {
    makeObservable(this);
  }
}
