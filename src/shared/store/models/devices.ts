import * as ip from 'ip-address';
import {computed, makeObservable, observable, toJS} from 'mobx';
import {
  CDJStatus,
  Device,
  FetchProgress,
  HydrationProgress,
  MediaSlot,
  Track,
} from 'prolink-connect/lib/types';
import {custom, map, serializable} from 'serializr';

import {bufferSerialize, rawJsSerialize} from 'src/shared/store/utils';

type PerTableHydrationProgress = Omit<HydrationProgress, 'table'>;

const deviceToJs = custom(
  value => ({...toJS(value), ip: value.ip.address}),
  data => ({...data, ip: new ip.Address4(data.ip)})
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
  @serializable(rawJsSerialize)
  @observable
  state?: CDJStatus.State;
  /**
   * The current loaded track of the device. May be undefined if there is no track
   * loaded.
   */
  @serializable(rawJsSerialize)
  @observable.ref
  track?: Track;
  /**
   * The artwork buffer of the loaded track. May be undefined if there is no
   * artwork for the loaded track.
   */
  @serializable(bufferSerialize)
  @observable.ref
  artwork?: Uint8Array;
  /**
   * Database fetch progress for each device slot
   */
  @serializable(map(rawJsSerialize))
  @observable
  fetchProgress = observable.map<MediaSlot, FetchProgress>();
  /**
   * Hydration progress for each table of each device slot
   */
  @serializable(map(map(rawJsSerialize)))
  @observable
  hydrationProgress = observable.map<MediaSlot, HydrationInfo>();

  constructor(device: Device) {
    makeObservable(this);

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
  @serializable(map(rawJsSerialize))
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

  constructor() {
    makeObservable(this);
  }
}
