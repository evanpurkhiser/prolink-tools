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
   * The most recently played tarck globally across all clients
   */
  @serializable(object(PlayedTrack))
  @observable
  lastPlayedTrack: PlayedTrack | null = null;

  constructor() {
    makeAutoObservable(this);
  }
}

export const createApiStore = () => observable(new ApiStore());
