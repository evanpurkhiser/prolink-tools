import {reaction, set} from 'mobx';

import store from 'src/shared/store';

/**
 * Ensure demo mode is disabled when track history appears
 */
reaction(
  () => store.mixstatus.trackHistory.length > 0,
  () =>
    store.config.overlays
      ?.filter(overlay => overlay.type === 'nowPlaying')
      ?.forEach(instance => set(instance.config, {demoMode: false}))
);
