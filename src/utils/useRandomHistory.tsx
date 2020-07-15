import * as React from 'react';
import {Track} from 'prolink-connect';

import {PlayedTrack} from 'src/shared/store';
import exampleMetadata from './exampleMetadata';

const generateEntry = async () => {
  const metadata = exampleMetadata[Math.floor(Math.random() * exampleMetadata.length)];

  const track: Track = {
    id: Date.now(),
    title: metadata.title,
    comment: metadata.comment,
    artist: {id: 0, name: metadata.artist} as any,
    album: {id: 0, name: metadata.album} as any,
    genre: {id: 0, name: metadata.genre} as any,
    label: {id: 0, name: metadata.label} as any,
    key: {id: 0, name: metadata.key} as any,
  } as any;

  const played = new PlayedTrack(new Date(), track);

  // Do not always include artwork, it is random afterall
  if (Math.random() > 0.3) {
    const imageResp = await fetch('https://picsum.photos/160/160');
    const imageBuffer = await imageResp.arrayBuffer();
    played.artwork = Buffer.from(imageBuffer);
  }

  return played;
};

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
      lastHistory = [...lastHistory, await generateEntry()].slice(-1 * cutoff);
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
