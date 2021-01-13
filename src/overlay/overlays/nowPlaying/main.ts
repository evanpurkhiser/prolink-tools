import {reaction, set} from 'mobx';

import {withMainStore} from 'main/main';

/**
 * Ensure demo mode is disabled when track history appears
 */
withMainStore(store =>
  reaction(
    () => store.mixstatus.trackHistory.length > 0,
    () =>
      store.config.overlays
        ?.filter(overlay => overlay.type === 'nowPlaying')
        ?.forEach(instance => set(instance.config, {demoMode: false}))
  )
);
