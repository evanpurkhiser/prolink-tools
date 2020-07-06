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
   * The number of history items to show
   */
  historyCount: number;
  /**
   * Should the track metadata be aligned to the right of the window.
   */
  alignRight?: boolean;
  /**
   * The specific set of tags to display
   */
  tags?: string[];
};

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

type Props = {
  config: Config;
  history: PlayedTrack[];
};

const Overlay: React.FC<Props> = ({config, history}) =>
  history.length === 0 ? null : (
    <React.Fragment>
      <CurrentTrack
        alignRight={config.alignRight}
        firstPlayed={store.mixstatus.trackHistory.length === 1}
        played={history[0]}
      />
      {history.length > 1 && (
        <RecentWrapper>
          <AnimatePresence>
            {history.slice(1, config.historyCount).map(track => (
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
      )}
    </React.Fragment>
  );

const RecentWrapper = styled('div')`
  display: grid;
  grid-gap: 14px;
  margin-top: 2rem;
`;

const CurrentWrapper = styled('div')`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  > * {
    grid-column: 1;
    grid-row: 1;
  }
`;

const EmptyExample = styled('div')`
  height: 80px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;

  &:after {
    color: #aaa;
    content: 'loading exmaple demo';
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
  }
`;

const Example: React.FC<{config?: Config}> = () => {
  const history = useRandomHistory({cutoff: 1, updateInterval: 5000});
  return history.length === 0 ? (
    <EmptyExample />
  ) : (
    <Overlay config={{historyCount: 0}} history={history} />
  );
};

const ConnectedOverlay: React.FC<{config: Config}> = observer(({config}) => (
  <Overlay history={store.mixstatus.trackHistory.reverse()} config={config} />
));

const descriptor: OverlayDescriptor<TaggedNowPlaying> = {
  type: 'taggedNowPlaying',
  name: 'Now playing with tags',
  component: ConnectedOverlay,
  example: Example,
  defaultConfig: {
    historyCount: 4,
  },
};

export default descriptor;
