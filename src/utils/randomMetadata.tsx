import {Track} from 'prolink-connect/lib/types';

import {AppConfig, PlayedTrack} from 'src/shared/store';
import exampleMetadata from 'src/utils/exampleMetadata';

export async function fetchRandomArtwork() {
  try {
    const imageResp = await fetch('https://picsum.photos/160/160');
    const imageBuffer = await imageResp.arrayBuffer();
    return new Uint8Array(imageBuffer);
  } catch {
    return undefined;
  }
}

type Options = {
  artwork?: boolean;
};

export async function makeRandomTrack({artwork}: Options = {}) {
  const metadata = exampleMetadata[Math.floor(Math.random() * exampleMetadata.length)];

  const track = {
    id: Date.now(),
    title: metadata.title,
    comment: metadata.comment,
    fileName: 'example.mp3',
    filePath: './example.mp3',
    duration: 120,
    artist: {id: 0, name: metadata.artist} as any,
    album: {id: 0, name: metadata.album} as any,
    genre: {id: 0, name: metadata.genre} as any,
    label: {id: 0, name: metadata.label} as any,
    key: {id: 0, name: metadata.key} as any,
  } as Track;

  const played = new PlayedTrack({playedAt: new Date(), track});

  // Do not always include artwork, it is random afterall
  if (artwork !== false && (artwork === true || Math.random() > 0.3)) {
    played.artwork = await fetchRandomArtwork();
  }

  return played;
}
