import {IReactionDisposer, IReactionPublic, reaction} from 'mobx';
import {DeviceID} from 'prolink-connect/lib/types';

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
      (arg, r) => effect(deviceStore, arg, r)
    );
    disposers.set(deviceStore.device.id, disposer);
  };

  store.devices.observe(change => {
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
