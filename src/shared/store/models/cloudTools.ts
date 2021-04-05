import {action, computed, makeObservable, observable} from 'mobx';
import {serializable} from 'serializr';

import {AppHandshake, ConnectionState} from 'src/api/types';

export class CloudApiState {
  @serializable
  @observable
  connectionState = ConnectionState.Offline;
  /**
   * The git version sha that is running on the API server.
   */
  @serializable
  @observable
  version?: string;
  /**
   * A message from the API server
   */
  @serializable
  @observable
  notice?: string;
  /**
   * Time in miliseconds it takes to communicate with the cloud API
   */
  @serializable
  @observable
  latency = 0;

  @action
  reset() {
    this.connectionState = ConnectionState.Offline;
    this.version = undefined;
    this.notice = undefined;
  }

  /**
   * Set the CloudApiState from a AppHandshake
   */
  @action
  setFromHandshake(data: AppHandshake) {
    this.connectionState = data.connectionState;
    this.version = data.version;
    this.notice = data.notice;
  }

  /**
   * Are we able to communicate with the API server in it's current state?
   */
  @computed
  get isReady() {
    const state = this.connectionState;
    return state === ConnectionState.Connected || state === ConnectionState.Degraded;
  }

  constructor() {
    makeObservable(this);
  }
}
