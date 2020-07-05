import * as React from 'react';
import {Track} from 'prolink-connect';

import {PlayedTrack} from 'src/shared/store';
import exampleMetadata from './exampleMetadata';

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

  const generatePlayed = async () => {
    const imageResp = await fetch('https://source.unsplash.com/random/160x160');
    const imageBuffer = await imageResp.arrayBuffer();

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
      played.artwork = Buffer.from(imageBuffer);
    }

    return played;
  };

  const updateHistory = async () =>
    setHistory([await generatePlayed(), ...history].slice(0, cutoff));

  React.useEffect(() => {
    updateHistory();
    const interval = setInterval(updateHistory, updateInterval);
    return () => clearTimeout(interval);
  }, [cutoff]);

  return history;
};

export default useRandomHistory;
