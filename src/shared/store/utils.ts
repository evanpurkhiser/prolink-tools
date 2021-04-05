import {identity} from 'lodash';
import {IReactionDisposer, IReactionPublic, observe, reaction, toJS} from 'mobx';
import {DeviceID} from 'prolink-connect/lib/types';
import {custom} from 'serializr';

import {AppStore, DeviceStore} from '.';

/**
 * A wrapper on the mobx reaction API to add reactors for every device on the
 * network. This will automatically create and dispose of reactions for every
 * device added or removed from the network.
 */
export function deviceReaction<T>(
  store: AppStore,
  expression: (deviceStore: DeviceStore, r: IReactionPublic) => T,
  effect: (deviceStore: DeviceStore, arg: T, r: IReactionPublic) => void
): () => void {
  const disposers = new Map<DeviceID, IReactionDisposer>();

  const createDeviceReaction = (deviceStore: DeviceStore) => {
    const disposer = reaction(
      r => expression(deviceStore, r),
      (arg, _prev, r) => effect(deviceStore, arg, r)
    );
    disposers.set(deviceStore.device.id, disposer);
  };

  observe(store.devices, change => {
    if (change.type === 'add') {
      createDeviceReaction(change.newValue);
    }
    if (change.type === 'delete') {
      disposers.get(change.oldValue.device.id)?.();
      disposers.delete(change.oldValue.device.id);
    }
  });

  return () => {
    disposers.forEach(disposer => disposer());
    disposers.clear();
  };
}

/**
 * Used with @serializable to (de)serialize a buffer
 */
export const bufferSerialize = custom(
  value => (value instanceof Uint8Array ? Array.from(value) : undefined),
  data => (Array.isArray(data) ? Uint8Array.from(data) : data)
);

/**
 * Used with @serializable to deep serialize a whole object
 */
export const rawJsSerialize = custom(value => toJS(value), identity);
