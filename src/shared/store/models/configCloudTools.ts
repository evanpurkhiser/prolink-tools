import {makeObservable, observable} from 'mobx';
import {serializable} from 'serializr';

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

  constructor() {
    makeObservable(this);
  }
}
