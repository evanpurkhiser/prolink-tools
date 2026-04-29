import {useEffect, useState} from 'react';

import type {PlayedTrack} from 'src/shared/store';

import {makeRandomTrack} from './randomMetadata';

type Options = {
  /**
   * Should we continue to produce random history data
   */
  enabled: boolean;
  /**
   * Maximum number of history items to store
   */
  cutoff: number;
  /**
   * Time between adding new history items, in milliseconds.
   */
  updateInterval: number;
};

/**
 * Generates a random track history from a random music metadata API + random
 * image API.
 */
const useRandomHistory = ({enabled, cutoff, updateInterval}: Options) => {
  const [history, setHistory] = useState<PlayedTrack[]>([]);

  let isUpdating = true;

  const startUpdater = async () => {
    let lastHistory = history;

    while (enabled && isUpdating) {
      lastHistory = [...lastHistory, await makeRandomTrack()].slice(-1 * cutoff);
      if (enabled && isUpdating) {
        setHistory(lastHistory);
        await new Promise(resolve => setTimeout(resolve, updateInterval));
      }
    }
  };

  // TODO figure out if it's safe to pass all deps
  /* oxlint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    startUpdater();
    return () => {
      isUpdating = false;
    };
  }, [enabled, cutoff, updateInterval]);
  /* oxlint-enable react-hooks/exhaustive-deps */

  return history;
};

export default useRandomHistory;
