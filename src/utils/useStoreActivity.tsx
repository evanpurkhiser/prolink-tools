import * as React from 'react';
import {deepObserve} from 'mobx-utils';

import {StoreContext} from 'src/shared/store/context';

type Options = {
  /**
   * The paths in the device object ot watch for activity.
   */
  targetTest: (path: string) => boolean;
  /**
   * A function used to test weather the value constitutes an activity blip.
   */
  valueTest?: (value: any) => boolean;
  /**
   * Number of milliseconds to blip when there is target activity. Defaults to
   * 300ms.
   */
  blipTime?: number;
};

function useStoreActivity({targetTest, valueTest, blipTime}: Options) {
  const store = React.useContext(StoreContext);

  const [blip, setBlip] = React.useState<boolean>(false);
  const timeoutId = 0;

  React.useEffect(() =>
    deepObserve(store, (change: any, changePath) => {
      const nameSuffix = change.name !== undefined ? `/${change.name}` : '';

      const path = changePath.includes('/')
        ? `${changePath.replace(/[0-9]+\//, '')}${nameSuffix}`
        : change.name;

      if (!targetTest(path)) {
        return;
      }

      if (valueTest !== undefined && !valueTest(change.newValue)) {
        return;
      }

      setBlip(true);
      clearInterval(timeoutId);
      setTimeout(() => setBlip(false), blipTime ?? 300);
    })
  );

  return [blip];
}

export default useStoreActivity;
