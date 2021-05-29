import {Track} from 'prolink-connect/lib/types';

const keyMapping: Record<string, (track: Track) => string> = {
  album: t => t.album?.name ?? '',
  artist: t => t.artist?.name ?? '',
  bitrate: t => t.bitrate?.toString() ?? '',
  color: t => t.color?.name ?? '',
  comment: t => t.comment,
  duration: t => t.duration?.toString(),
  genre: t => t.genre?.name ?? '',
  key: t => t.key?.name ?? '',
  label: t => t.label?.name ?? '',
  mixName: t => t.mixName ?? '',
  remixer: t => t.artist?.name ?? '',
  tempo: t => t.tempo?.toString(),
  title: t => t.title,
  discNumber: t => t.discNumber?.toString() ?? '',
  discTrackNumber: t => t.trackNumber?.toString() ?? '',
  year: t => t.year?.toString() ?? '',
};

const trackToObject = (track: Track) =>
  Object.fromEntries(Object.entries(keyMapping).map(([key, fn]) => [key, fn(track)]));

export default trackToObject;
