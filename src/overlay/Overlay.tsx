import * as React from 'react';
import {observer} from 'mobx-react';
import {Global} from '@emotion/core';

import globalCss from 'src/shared/globalCss';
import store, {PlayedTrack} from 'src/shared/store';
import Track from 'src/overlay/Track';
import styled from '@emotion/styled';
import {AnimatePresence} from 'framer-motion';

const trackOutAnimation = {
  exit: {display: 'none'},
};

type RecentTrackProps = React.HTMLProps<HTMLDivElement> & {
  history: PlayedTrack[];
};

const RecentTracks = styled(({history, ...p}: RecentTrackProps) => (
  <div {...p}>
    <AnimatePresence>
      {history.map(track => (
        <Track
          positionTransition
          mini
          played={track}
          variants={trackOutAnimation}
          key={track.playedAt.toString()}
        />
      ))}
    </AnimatePresence>
  </div>
))`
  display: grid;
  grid-gap: 14px;
  position: absolute;
  right: 0;
  top: 125px;
`;

const trackAnimation = {
  enter: {
    x: 0, // Set to a value so we can delay our children
    transition: {
      when: 'beforeChildren',
      delay: 0.3,
    },
  },
};

const CurrentTrack = styled(({played, ...p}: React.ComponentProps<typeof Track>) => (
  <AnimatePresence>
    {played && (
      <Track
        played={played}
        variants={trackAnimation}
        key={played.playedAt.toString()}
        {...p}
      />
    )}
  </AnimatePresence>
))`
  position: absolute;
  right: 0;
`;

const TracksOverlay = styled('div')`
  margin: 20px;
  position: absolute;
  top: 0;
  right: 0;
  width: 100vw;
`;

const Overlay = observer(() => {
  const history = store.mixstatus.trackHistory.reverse();

  if (history.length === 0) {
    return null;
  }

  return (
    <div>
      <Global styles={globalCss} />
      <TracksOverlay>
        <CurrentTrack
          firstPlayed={store.mixstatus.trackHistory.length === 1}
          played={history[0]}
        />
        <RecentTracks history={history.slice(1, 4)} />
      </TracksOverlay>
    </div>
  );
});

export default Overlay;
