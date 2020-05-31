import {observable, toJS, computed} from 'mobx';
import {map, mapAsArray, object, list, custom, serializable} from 'serializr';
import {
  Track,
  CDJStatus,
  Device,
  DeviceID,
  FetchProgress,
  HydrationProgress,
  MediaSlot,
  NetworkState,
} from 'prolink-connect';

import {PlayedTrack} from './types';

type PerTableHydrationProgress = Omit<HydrationProgress, 'table'>;

const rawJS = custom(
  (value: any) => toJS(value),
  (value: any) => value
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
  @serializable(rawJS)
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
  @serializable(
    custom(
      value => (value instanceof Buffer ? Array.from(value) : undefined),
      data => (Array.isArray(data) ? Buffer.from(data) : data)
    )
  )
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

export class MixstatusStore {
  /**
   * Records an ordered list of every track that was played in the current set
   */
  @serializable(list(rawJS))
  @observable
  trackHistory = observable.array<PlayedTrack>();
}

export class AppStore {
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
}

export default observable(new AppStore());
