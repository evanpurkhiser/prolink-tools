import {Track} from 'prolink-connect/lib/types';

const propertiesToCheck = [
  'title',
  'artist',
  'album',
  'comment',
  'label',
  'genre',
] as const;

const isId = (track: Track, marker: string) =>
  propertiesToCheck.some(property => {
    const prop = track[property];
    const value = typeof prop === 'string' ? prop.toLowerCase() : prop?.name ?? '';

    return value.toLowerCase().includes(marker.toLowerCase());
  });

export default isId;
