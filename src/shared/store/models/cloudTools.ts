import {action, computed, makeObservable, observable} from 'mobx';
import {serializable} from 'serializr';
import {uuid} from 'short-uuid';

import {AppHandshake, ConnectionState} from 'src/api/types';

import {OAuthProvider} from '../types';
import {rawJsSerialize} from '../utils';

/**
 * When the app initiates an OAuth flow, this is the storated state
 */
type OAuthState = {
  /**
   * The name of the OAuth provider
   */
  provider: OAuthProvider;
  /**
   * The nonce is unique to the OAuth request
   */
  nonce: string;
  /**
   * The redirect URL will be generated in the API server's representation of
   * the AppStore. The client app does not know client ID values to OAuth with.
   */
  redirectUrl?: string;
};

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

  @serializable(rawJsSerialize)
  @observable
  oauthState: OAuthState | null = null;

  /**
   * Initalizes an OAuth flow
   */
  @action
  initOauthFlow(provider: OAuthProvider) {
    this.oauthState = {nonce: uuid(), provider};
  }

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
  initFromHandshake(data: AppHandshake) {
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
