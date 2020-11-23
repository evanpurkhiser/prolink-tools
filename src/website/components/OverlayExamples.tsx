import {observer} from 'mobx-react';
import * as React from 'react';

import {registeredOverlays} from 'src/overlay';
import store from 'src/shared/store';

export const ExampleOverlay = observer(() => {
  const instance = store.config.overlays.find(i => i.key === 'exampleNowPlaying');
  const descriptor = registeredOverlays?.find(overlay => overlay.type === instance?.type);

  if (instance === undefined || descriptor === undefined) {
    // Show something silly if they removed the overlay
    return null;
  }

  return <descriptor.component config={instance.config} />;
});

export const ExampleConfig = observer(() => {
  const instance = store.config.overlays.find(i => i.key === 'exampleNowPlaying');
  const descriptor = registeredOverlays?.find(overlay => overlay.type === instance?.type);

  if (instance === undefined || descriptor === undefined) {
    // Show something silly if they removed the overlay
    return null;
  }

  return <descriptor.configInterface config={instance.config} />;
});
