import {observer} from 'mobx-react';

import {registeredOverlays} from 'src/overlay';
import {AppStore} from 'src/shared/store';
import withStore from 'src/utils/withStore';

type Props = {
  store: AppStore;
};

export const ExampleOverlay = withStore(
  observer(({store}: Props) => {
    const instance = store.config.overlays.find(i => i.key === 'exampleNowPlaying');
    const descriptor = registeredOverlays?.find(
      overlay => overlay.type === instance?.type
    );

    if (instance === undefined || descriptor === undefined) {
      // Show something silly if they removed the overlay
      return null;
    }

    return <descriptor.component config={instance.config} />;
  })
);

export const ExampleConfig = withStore(
  observer(({store}: Props) => {
    const instance = store.config.overlays.find(i => i.key === 'exampleNowPlaying');
    const descriptor = registeredOverlays?.find(
      overlay => overlay.type === instance?.type
    );

    if (instance === undefined || descriptor === undefined) {
      // Show something silly if they removed the overlay
      return null;
    }

    return <descriptor.configInterface config={instance.config} />;
  })
);
