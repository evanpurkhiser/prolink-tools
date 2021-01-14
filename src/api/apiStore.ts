import {makeAutoObservable, observable} from 'mobx';
import {object, serializable} from 'serializr';

import {PlayedTrack} from 'src/shared/store';

export class ApiStore {
  /**
   * The number of current active clients
   */
  @serializable
  @observable
  clientCount = 0;
  /**
   * All the most recently played tracks
   */
  @serializable(object(PlayedTrack))
  @observable
  history: PlayedTrack[] = [];

  constructor() {
    makeAutoObservable(this);
  }
}

export const createApiStore = () => observable(new ApiStore());
