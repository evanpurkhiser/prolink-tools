import { observer } from 'mobx-react';
import { format } from 'date-fns';
import { Flex, Box } from '@rebass/grid/emotion';
import { hot } from 'react-hot-loader';
import styled, { injectGlobal, css } from 'react-emotion';
import posed, { PoseGroup } from 'react-pose';
import React from 'react';
import * as Icons from 'react-feather';

import trackEvents from 'app/trackEvents';
import Track from './track';

const RecentPlayedHeading = styled(p => <Box {...p}>Recently Played</Box>)`
  font-size: 0.8em;
  text-transform: uppercase;
  line-height: 2;
  background: #fff;
  color: #000;
  text-align: right;
  padding: 0 1em;
`;

const RecentTracks = observer(p => {
  const played = trackEvents.played;
  const currentTrack = played[0];

  const nowPlaying = currentTrack && <Track track={currentTrack} />;

  return (
    <Flex flexDirection="column" className={p.className}>
      {nowPlaying}
    </Flex>
  );
});

const StyledRecentTracks = styled(RecentTracks)`
  margin: 20px;
  position: absolute;
  top: 0;
  right: 0;
`;

const App = p => (
  <React.Fragment>
    <StyledRecentTracks />
  </React.Fragment>
);

export default hot(module)(App);
