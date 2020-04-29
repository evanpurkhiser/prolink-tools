import { observer } from 'mobx-react';
import { hot } from 'react-hot-loader';
import { Global, css } from '@emotion/core';
import styled from '@emotion/styled';
import React from 'react';
import {AnimatePresence} from 'framer-motion'

import Track from 'app/components/track';
import Settings from 'app/components/settings';
import config from 'app/config';
import trackEvents from 'app/trackEvents';

const trackOutAnimation = {
  exit: { display: 'none' },
}

const RecentTracks = styled(({tracks, ...p}) => (
  <div {...p}>
    <AnimatePresence>
      {tracks.map(t => (
        <Track positionTransition mini track={t} variants={trackOutAnimation} key={t.playedAt} />
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
}

let CurrentTrack = ({ track, ...p}) => (
  <AnimatePresence>
    {track && <Track track={track} variants={trackAnimation} key={track.playedAt} {...p} />}
  </AnimatePresence>
);

CurrentTrack = styled(CurrentTrack)`
  position: absolute;
  right: 0;
`;

let TracksOverlay = observer(p => (
  <div className={p.className}>
    <CurrentTrack firstPlayed={trackEvents.played.length === 1} track={trackEvents.played[0]} /> 
    <RecentTracks
      tracks={trackEvents.played.slice(1, config.historyCutoff + 1)}
    />
  </div>));

TracksOverlay = styled(TracksOverlay)`
  margin: 20px;
  position: absolute;
  top: 0;
  right: 0;
  width: 100vw;
`;

const AppSettings = styled(Settings)`
  margin: 20px;
  position: absolute;
  top: 0;
  left: 0;
`;

const globalCss = css`
  * {
    box-sizing: border-box;
  }

  body,
  #container {
    display: flex;
    height: 100vh;
    width: 100vw;
    margin: 0;
    color: #fff;
    font-family: Ubuntu, sans-serif;
    font-size: 1em;
  }
`;

const App = () => (
  <React.Fragment>
    <Global styles={globalCss} />
    <TracksOverlay />
    <AppSettings />
  </React.Fragment>
);

export default hot(module)(App);
