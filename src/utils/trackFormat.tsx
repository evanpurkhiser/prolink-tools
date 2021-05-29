import {Track} from 'prolink-connect/lib/types';

import trackToObject from './trackToObject';

const formatRegex = /(\{(?<key>[a-zA-Z]+)\})/g;

/**
 * Accepts a templatized formatString and a Track object, producing a formatted
 * string with values from the track.
 *
 * Templates are written as `{key}`, where key is any property of a Track.
 */
function trackFormat(track: Track, formatString: string) {
  const trackObject = trackToObject(track);

  return formatString.replaceAll(
    formatRegex,
    (value: any, ...groups: any[]) => trackObject[groups.pop().key] ?? value
  );
}

export default trackFormat;
