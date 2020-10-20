import {observable, toJS, computed} from 'mobx';
import {map, mapAsArray, object, list, custom, serializable, date} from 'serializr';
import * as ip from 'ip-address';
import {
  Track,
  CDJStatus,
  Device,
  DeviceID,
  FetchProgress,
  HydrationProgress,
  MediaSlot,
  NetworkState,
  MixstatusConfig,
} from 'prolink-connect/lib/types';

import {OverlayInstance} from 'src/overlay';
import {identity} from 'lodash';

type PerTableHydrationProgress = Omit<HydrationProgress, 'table'>;

const rawJS = custom(value => toJS(value), identity);

const deviceToJs = custom(
  value => ({...toJS(value), ip: value.ip.address}),
  data => ({...data, ip: new ip.Address4(data.ip)})
);

const bufferSerialize = custom(
  value => (value instanceof Buffer ? Array.from(value) : undefined),
  data => (Array.isArray(data) ? Buffer.from(data) : data)
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
  artwork?: Buffer;
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

export class PlayedTrack {
  @serializable(date())
  playedAt: Date;

  @serializable(rawJS)
  track: Track;

  @serializable(bufferSerialize)
  artwork?: Buffer;

  constructor(playedAt: Date, track: Track) {
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
}

export default observable(new AppStore());
