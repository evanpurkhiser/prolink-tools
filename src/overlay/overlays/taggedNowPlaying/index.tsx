import * as React from 'react';
import styled from '@emotion/styled';
import {AnimatePresence} from 'framer-motion';
import {observer} from 'mobx-react';

import store, {PlayedTrack} from 'src/shared/store';
import {OverlayDescriptor} from 'src/overlay';

import Track from './Track';
import useRandomHistory from 'src/utils/useRandomHistory';

type TaggedNowPlaying = {
  type: 'taggedNowPlaying';
  config: Config;
};

type Config = {
  /**
   * Should the track metadata be aligned to the right of the window.
   */
  alignRight: boolean;
  /**
   * The number of history items to show
   */
  historyCount: number;
  /**
   * The specific set of tags to display
   */
  tags: string[];
};

type RecentTrackProps = {
  history: PlayedTrack[];
};

const RecentTracks = ({history}: RecentTrackProps) => (
  <RecentWrapper>
    <AnimatePresence>
      {history.map(track => (
        <Track
          mini
          animate
          played={track}
          variants={{exit: {display: 'none'}}}
          key={track.playedAt.toString()}
        />
      ))}
    </AnimatePresence>
  </RecentWrapper>
);

const CurrentTrack = ({played, ...p}: React.ComponentProps<typeof Track>) => (
  <CurrentWrapper>
    <AnimatePresence>
      {played && <Track played={played} key={played.playedAt.toString()} {...p} />}
    </AnimatePresence>
  </CurrentWrapper>
);

CurrentTrack.defaultProps = {
  variants: {
    enter: {
      x: 0,
      transition: {
        when: 'beforeChildren',
        delay: 0.3,
      },
    },
  },
};

const Overlay: React.FC<{config: Config}> = observer(({config}) => {
  const history = store.mixstatus.trackHistory.reverse();

  if (history.length === 0) {
    return null;
  }

  return (
    <TracksOverlay>
      <CurrentTrack
        alignRight={config.alignRight}
        firstPlayed={store.mixstatus.trackHistory.length === 1}
        played={history[0]}
      />
      <RecentTracks history={history.slice(1, config.historyCount)} />
    </TracksOverlay>
  );
});

const RecentWrapper = styled('div')`
  display: grid;
  grid-gap: 14px;
  position: absolute;
  right: 0;
  top: 125px;
`;

const CurrentWrapper = styled('div')`
  display: grid;
  > * {
    grid-column: 1;
    grid-row: 1;
  }
`;

const TracksOverlay = styled('div')`
  margin: 20px;
  position: absolute;
  top: 0;
  right: 0;
  width: 100vw;
`;

const Example = () => {
  const history = useRandomHistory({cutoff: 1, updateInterval: 5000});

  console.log(history);

  return history.length === 0 ? null : <CurrentTrack firstPlayed played={history[0]} />;
};

const descriptor: OverlayDescriptor<TaggedNowPlaying> = {
  type: 'taggedNowPlaying',
  name: 'Now playing with tags',
  component: Overlay,
  example: Example,
  defaultConfig: {},
};

export default descriptor;
