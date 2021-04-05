import {User} from '@sentry/types';
import {action, computed, makeObservable, observable} from 'mobx';
import {DeviceID, DeviceType, NetworkState} from 'prolink-connect/lib/types';
import {mapAsArray, object, serializable} from 'serializr';
import shajs from 'sha.js';

import {rawJsSerialize} from 'src/shared/store/utils';

import {CloudApiState} from './models/cloudTools';
import {AppConfig} from './models/config';
import {CloudToolsConfig} from './models/configCloudTools';
import {DeviceStore, HydrationInfo} from './models/devices';
import {MixstatusStore, PlayedTrack} from './models/mixStatus';

export {
  AppConfig,
  CloudApiState,
  CloudToolsConfig,
  DeviceStore,
  HydrationInfo,
  MixstatusStore,
  PlayedTrack,
};

export class AppStore {
  /**
   * Indicates that the store has been initalized. Useful for ensuring we have
   * real data before showing things like empty-states.
   */
  @serializable
  @observable
  isInitalized = false;
  /**
   * The current state of the prolink network
   */
  @serializable
  @observable
  networkState = NetworkState.Offline;
  /**
   * The observable list of active devices
   */
  @serializable(mapAsArray(object(DeviceStore), 'id'))
  @observable
  devices = observable.map<DeviceID, DeviceStore>();
  /**
   * The observable mixstatus
   */
  @serializable(object(MixstatusStore))
  @observable
  mixstatus = new MixstatusStore();
  /**
   * Maintains the current status of the cloud API service.
   */
  @serializable(object(CloudApiState))
  @observable
  cloudApiState = new CloudApiState();
  /**
   * Configuration is stored here.
   *
   * This config is observed in client app and will propegate changes back to
   * the main thread via IPC.
   */
  @serializable(object(AppConfig))
  @observable
  config = new AppConfig();
  /**
   * Sentry user information
   */
  @serializable(rawJsSerialize)
  @observable
  user?: User;
  /**
   * Get the appKey for this app instance.
   */
  @computed
  get appKey() {
    return this.makeOpaqueApiKey('appKey');
  }

  makeOpaqueApiKey(subKey: string) {
    // XXX: Note this logic is duplicated in node-only form in api/internalStore
    return shajs('sha256')
      .update(`${this.config.cloudTools.apiKey}:${subKey}`)
      .digest('base64')
      .slice(0, 20);
  }

  @action
  markNetworkState(state: NetworkState) {
    this.networkState = state;
  }

  /**
   * Does the current network configuration support on-air status?
   *
   * Caveats:
   *  - XDJ-XZ will also be considered as having a mixer on the network.
   *  - If we're using 2000s there is no onAir indicator in the status packets
   *    unfortunately.
   */
  @computed
  get onAirSupport() {
    const devices = [...this.devices.values()].map(s => s.device);

    const hasDJM = devices.some(d => d.type === DeviceType.Mixer);
    const has2000 = devices.some(d => d.name.toLowerCase() === 'cdj-2000');
    const hasXZ = devices.some(d => d.name.toLowerCase() === 'xdj-xz');

    return {
      present: !has2000 && (hasDJM || hasXZ),
      disabledReason: has2000
        ? "The CDJ-2000 (non-nxs) does not properly support reporting it's on-air status. This may be fixed in a future update"
        : !hasDJM
        ? 'No compatible DJM is currently detected on the network. Requires a DJM-900nxs or newer.'
        : null,
    };
  }

  constructor() {
    makeObservable(this);
  }
}

export const createAppStore = () => observable(new AppStore());
