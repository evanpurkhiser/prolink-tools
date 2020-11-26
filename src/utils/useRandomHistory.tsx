import * as React from 'react';

import {PlayedTrack} from 'src/shared/store';

import {makeRandomTrack} from './randomMetadata';

type Options = {
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
const useRandomHistory = ({cutoff, updateInterval}: Options) => {
  const [history, setHistory] = React.useState<PlayedTrack[]>([]);

  let isUpdating = true;

  const startUpdater = async () => {
    let lastHistory = history;

    while (isUpdating) {
      lastHistory = [...lastHistory, await makeRandomTrack()].slice(-1 * cutoff);
      if (isUpdating) {
        setHistory(lastHistory);
        await new Promise(r => setTimeout(r, updateInterval));
      }
    }
  };

  React.useEffect(() => {
    startUpdater();
    return () => {
      isUpdating = false;
    };
  }, [cutoff, updateInterval]);

  return history;
};

export default useRandomHistory;
