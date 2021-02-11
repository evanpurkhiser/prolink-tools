import {runInAction, set} from 'mobx';

import {AppStore} from 'src/shared/store';

/**
 * There may be some situations where we have to implement migrations of the
 * users configuration as they upgrade versiosns. These migrations will live
 * here.
 */
export function runConfigMigrations(store: AppStore) {
  /**
   * 11-19-20
   *
   * Migrate old 'taggedNowPlaying' overlay configurations to the new themeable
   * nowPlaying overlay type.
   */
  runInAction(() => {
    const overlay = store.config.overlays.find(
      overlay => overlay.type === 'taggedNowPlaying'
    );

    if (overlay === undefined) {
      return;
    }

    set(overlay, {type: 'nowPlaying'});
    set(overlay.config, {theme: 'tracklist'});
  });
}
