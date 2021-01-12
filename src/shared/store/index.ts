import {User} from '@sentry/types';
import * as ip from 'ip-address';
import {identity} from 'lodash';
import {action, computed, observable, toJS} from 'mobx';
import {
  CDJStatus,
  Device,
  DeviceID,
  DeviceType,
  FetchProgress,
  HydrationProgress,
  MediaSlot,
  NetworkState,
  Track,
} from 'prolink-connect/lib/types';
import {custom, date, list, map, mapAsArray, object, serializable} from 'serializr';
import {uuid} from 'short-uuid';

import {OverlayInstance} from 'src/overlay';
import isId from 'src/utils/isId';

type PerTableHydrationProgress = Omit<HydrationProgress, 'table'>;

const rawJS = custom(value => toJS(value), identity);

const deviceToJs = custom(
  value => ({...toJS(value), ip: value.ip.address}),
  data => ({...data, ip: new ip.Address4(data.ip)})
);

const bufferSerialize = custom(
  value => (value instanceof Uint8Array ? Array.from(value) : undefined),
  data => (Array.isArray(data) ? Uint8Array.from(data) : data)
);

/**
 * Maintains state for a single device (CDJ) on the network.
 */
export class DeviceStore {
  @serializable
  id: number;
  /**
   * The device this store represents
   */
  @serializable(deviceToJs)
  @observable
  device: Device;
  /**
   * Current state of the device. May be unknown if we have not yet heard from it.
   */
  @serializable(rawJS)
  @observable
  state?: CDJStatus.State;
  /**
   * The current loaded track of the device. May be undefined if there is no track
   * loaded.
   */
  @serializable(rawJS)
  @observable
  track?: Track;
  /**
   * The artwork buffer of the loaded track. May be undefined if there is no
   * artwork for the loaded track.
   */
  @serializable(bufferSerialize)
  @observable
  artwork?: Uint8Array;
  /**
   * Database fetch progress for each device slot
   */
  @serializable(map(rawJS))
  @observable
  fetchProgress = observable.map<MediaSlot, FetchProgress>();
  /**
   * Hydration progress for each table of each device slot
   */
  @serializable(map(map(rawJS)))
  @observable
  hydrationProgress = observable.map<MediaSlot, HydrationInfo>();

  constructor(device: Device) {
    this.device = device;

    // NOTE: We use the null traversal here for when this object is
    // deserialized, the device wont' be passed in (can we fix?)
    this.id = device?.id;
  }
}

export class HydrationInfo {
  /**
   * Reports the per-table hydration progress
   */
  @serializable(map(rawJS))
  @observable
  perTable = observable.map<string, PerTableHydrationProgress>();
  /**
   * Reports the known total number of hydration entities to be completed.
   */
  @computed
  get total() {
    return [...this.perTable.values()].reduce((sum, val) => sum + val.total, 0);
  }
  /**
   * Reports the total completed hydration entities.
   */
  @computed
  get complete() {
    return [...this.perTable.values()].reduce((sum, val) => sum + val.complete, 0);
  }
  /**
   * Reports if the hydration has finished.
   */
  @serializable
  @observable
  isDone = false;
}

type PlayedTrackParams = {
  config?: AppConfig;
  playedAt: Date;
  track: Track;
};

export class PlayedTrack {
  #config?: AppConfig;

  @serializable(date())
  playedAt: Date;

  @serializable(rawJS)
  track: Track;

  @serializable(bufferSerialize)
  artwork?: Uint8Array;

  @computed
  get isId() {
    const marker = this.#config?.idMarker ?? '[ID]';
    return marker !== '' ? isId(this.track, marker) : false;
  }

  constructor({config, playedAt, track}: PlayedTrackParams) {
    this.#config = config;
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
}

export class AppConfig {
  @serializable(list(rawJS))
  @observable
  overlays = observable.array<OverlayInstance>();
  /**
   * Should debug events be enabled to be stored and uploaded?
   */
  @serializable
  @observable
  reportDebugEvents = false;
  /**
   * Should we publish state to app.prolink.tools?
   */
  @serializable
  @observable
  enableCloudApi = false;
  /**
   * Unique identifier used to identify the application to the server.
   */
  @serializable
  @observable
  apiKey = uuid();
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
   * State of the sidebar
   */
  @serializable
  @observable
  sidebarCollapsed = false;

  @action
  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  @action
  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
  }
}

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
  @serializable(rawJS)
  @observable
  user?: User;

  /**
   * Does the current network configuration support on-air status?
   *
   * Caveats:
   *  - XDJ-XZ will also be considered as having a mixer on the network.
   *  - If we're using 2000s there is no onAir indicator in the status packets
   *    unfortunately.
   */
  @computed
  get hasOnAirSupport() {
    const devices = [...this.devices.values()].map(s => s.device);

    const hasDJM = devices.some(d => d.type === DeviceType.Mixer);
    const has2000 = devices.some(d => d.name.toLowerCase() === 'cdj-2000');
    const hasXZ = devices.some(d => d.name.toLowerCase() === 'xdj-xz');

    return !has2000 && (hasDJM || hasXZ);
  }
}

export const createStore = () => observable(new AppStore());
