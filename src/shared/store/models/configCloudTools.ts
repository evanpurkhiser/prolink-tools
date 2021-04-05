import {makeObservable, observable} from 'mobx';
import {serializable} from 'serializr';
import type {Token} from 'simple-oauth2';

import {rawJsSerialize} from 'src/shared/store/utils';

export class CloudToolsConfig {
  /**
   * Should we publish state to api.prolink.tools?
   */
  @serializable
  @observable
  enabled = false;
  /**
   * Unique identifier used to identify the application to the server. Changing
   * this will change all derrived identifiers.
   *
   * Will be generated on the users first run of the application.
   */
  @serializable
  @observable
  apiKey = '';
  /**
   * When connected, this stores the Nightbot Token
   */
  @serializable(rawJsSerialize)
  @observable.ref
  nightbotAuth: Token | null = null;

  constructor() {
    makeObservable(this);
  }
}
