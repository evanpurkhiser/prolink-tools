import {Disc, Layers, Hash, Activity, Code} from 'react-feather';

import {PlayedTrack} from 'src/shared/store';

/**
 * Tags that can be shown on any of the now playing themes
 */
export const availableTags = ['album', 'label', 'comment', 'tempo', 'key'] as const;

export type Tags = Array<typeof availableTags[number]>;

export type TagConfig = {
  icon: React.ComponentType<React.ComponentProps<typeof Disc>>;
  getter: (track: PlayedTrack['track']) => string | undefined;
};

const makeTagConfig = <T extends {[name: string]: TagConfig}>(config: T) => config;

export const tagsConfig = makeTagConfig({
  album: {icon: Disc, getter: track => track.album?.name},
  label: {icon: Layers, getter: track => track.label?.name},
  comment: {icon: Hash, getter: track => track.comment},
  tempo: {icon: Activity, getter: track => (track.tempo > 0 ? `${track.tempo} BPM` : '')},
  key: {icon: Code, getter: track => track.key?.name},
});
