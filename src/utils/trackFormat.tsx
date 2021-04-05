import {Track} from 'prolink-connect/lib/types';

const formatRegex = /(\{(?<key>[a-zA-Z]+)\})/g;

const keyMapping: Record<string, (track: Track) => string> = {
  album: t => t.album?.name ?? '',
  artist: t => t.artist?.name ?? '',
  bitrate: t => t.bitrate?.toString() ?? '',
  color: t => t.color?.name ?? '',
  comment: t => t.comment,
  discNumber: t => t.discNumber?.toString() ?? '',
  duration: t => t.duration.toString(),
  genre: t => t.genre?.name ?? '',
  key: t => t.key?.name ?? '',
  label: t => t.label?.name ?? '',
  mixName: t => t.mixName ?? '',
  remixer: t => t.artist?.name ?? '',
  tempo: t => t.tempo.toString(),
  title: t => t.title,
  trackNumber: t => t.trackNumber?.toString() ?? '',
  year: t => t.year?.toString() ?? '',
};

/**
 * Accepts a templatized formatString and a Track object, producing a formatted
 * string with values from the track.
 *
 * Templates are written as `{key}`, where key is any property of a Track.
 */
export function trackFormat(formatString: string, track: Track) {
  const matcher = (value: any, ...groups: any[]) => {
    const match = groups.pop();
    const getter = keyMapping[match.key];

    if (getter === undefined) {
      return value;
    }

    return getter(track);
  };

  return formatString.replaceAll(formatRegex, matcher);
}
