import {action, makeObservable, observable} from 'mobx';
import {MixstatusConfig, MixstatusMode} from 'prolink-connect/lib/types';
import {list, object, serializable} from 'serializr';
import {uuid} from 'short-uuid';

import {OverlayInstance} from 'src/overlay';
import {rawJsSerialize} from 'src/shared/store/utils';

import {CloudToolsConfig} from './configCloudTools';
import {SaveHistoryConfig} from './saveHistoryConfig';

export class AppConfig {
  @serializable(list(rawJsSerialize))
  @observable
  overlays = observable.array<OverlayInstance>();
  /**
   * Configuration for the Cloud tools API service
   */
  @serializable(object(CloudToolsConfig))
  @observable
  cloudTools = new CloudToolsConfig();
  /**
   * Configuration for the Cloud tools API service
   */
  @serializable(object(SaveHistoryConfig))
  @observable
  saveHistory = new SaveHistoryConfig();
  /**
   * Should debug events be enabled to be stored and uploaded?
   */
  @serializable
  @observable
  reportDebugEvents = false;
  /**
   * Mark tracks as 'IDs' using this string
   */
  @serializable
  @observable
  idMarker = '[ID]';
  /**
   * The theme to ues in the app
   */
  @serializable
  @observable
  theme: 'light' | 'dark' | 'system' = 'light';
  /**
   * The configuration object controlling the network mix-status processor
   */
  @serializable(rawJsSerialize)
  @observable
  mixstatusConfig: MixstatusConfig = observable.object({
    mode: MixstatusMode.SmartTiming,
    allowedInterruptBeats: 8,
    beatsUntilReported: 128,
    timeBetweenSets: 30,
    useOnAirStatus: true,
  });
  /**
   * State of the sidebar
   */
  @serializable
  @observable
  sidebarCollapsed = false;
  /**
   * The last version that was run prior to this run
   */
  @serializable
  @observable
  lastUsedVersion = '';

  @action
  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  @action
  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
  }

  @action
  markLatestVersion() {
    if (this.lastUsedVersion === process.env.RELEASE) {
      return false;
    }

    this.lastUsedVersion = process.env.RELEASE ?? this.lastUsedVersion;
    return true;
  }

  @action
  ensureDefaults() {
    this.cloudTools.apiKey =
      this.cloudTools.apiKey === '' ? uuid() : this.cloudTools.apiKey;
  }

  constructor() {
    makeObservable(this);
  }
}
