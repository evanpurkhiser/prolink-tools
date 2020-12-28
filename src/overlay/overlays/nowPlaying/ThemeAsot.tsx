import React from 'react';
import styled from '@emotion/styled';
import {AnimatePresence, motion} from 'framer-motion';
import {toJS} from 'mobx';
import {observer} from 'mobx-react';

import {PlayedTrack} from 'src/shared/store';

import {Tags, tagsConfig} from './tags';
import {NowPlayingConfig, ThemeDescriptor} from '.';

type MotionDivProps = React.ComponentProps<typeof motion.div>;

type OrientedMotionDivProps = MotionDivProps & {
  alignRight?: boolean;
};

const defaultColors = {
  '--pt-np-primary-text': '#fff',
  '--pt-np-indicator-highlight': '#f00',
  '--pt-np-indicator-text': '#fff',
};

const cssVar = (name: keyof typeof defaultColors) =>
  `var(${name}, ${defaultColors[name]})`;

const Text = styled(motion.div)`
  display: block;
  line-height: 1.1;
`;

Text.defaultProps = {
  variants: {
    initial: {opacity: 0},
    animate: {opacity: 1},
  },
};

const Artist = styled(Text)`
  font-weight: 600;
`;

Artist.defaultProps = {
  ...Text.defaultProps,
  className: 'metadata-artist',
};

const Title = styled(Text)``;

Title.defaultProps = {
  ...Text.defaultProps,
  className: 'metadata-title',
};

type AttributeProps = React.ComponentProps<typeof Text> & {
  text?: string;
};

const Attribute = styled(({text, ...p}: AttributeProps) =>
  text === '' || text === undefined ? null : <Text {...p}>[{text}]</Text>
)`
  font-size: 0.9em;
  font-style: italic;
  line-height: 1.2;
`;

const NowPlayingLabel = styled(motion.div)`
  position: relative;
  background: #fff;
  color: #000;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
  line-height: 0.8;

  clip-path: inset(0% var(--expose-back) 0% 0%);

  &,
  &:after {
    padding: 0.5rem 0.5rem 0.375rem;
  }

  &:after {
    content: 'Now Playing';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    color: ${cssVar('--pt-np-indicator-text')};
    background: ${cssVar('--pt-np-indicator-highlight')};
    position: absolute;
    clip-path: inset(0% var(--expose-front) 0% 0%);
  }
`;

NowPlayingLabel.defaultProps = {
  children: <React.Fragment>Now Playing</React.Fragment>,
  variants: {
    initial: {
      '--expose-back': '100%',
      '--expose-front': '100%',
    } as any,
    animate: {
      '--expose-back': '0%',
      '--expose-front': '0%',
      transition: {
        '--expose-back': {
          type: 'tween',
          ease: [0, 1.07, 0.38, 0.98],
          duration: 1,
        },
        '--expose-front': {
          type: 'tween',
          ease: [0, 1.07, 0.5, 0.98],
          duration: 2,
        },
      },
    } as any,
    exit: {opacity: 0},
  },
};

const MetadataWrapper = styled((p: OrientedMotionDivProps) => {
  const variants = {
    initial: {
      opacity: 1,
    },
    animate: {
      transition: {
        delayChildren: 1,
        staggerChildren: 0.05,
        duration: 0,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.25,
      },
    },
  };

  return <motion.div variants={variants} {...p} />;
})<{alignRight?: boolean}>`
  display: flex;
  flex-direction: column;
  align-items: ${p => (p.alignRight ? 'flex-end' : 'flex-start')};
`;

MetadataWrapper.defaultProps = {
  className: 'track-metadata',
};

type FullMetadataProps = OrientedMotionDivProps & {
  track: PlayedTrack['track'];
  tags: Tags;
};

const FullMetadata = ({track, tags, ...p}: FullMetadataProps) => (
  <MetadataWrapper {...p}>
    <NowPlayingLabel />
    <Artist>{track.artist?.name}</Artist>
    <Title>{track.title}</Title>
    {tags.map(tag => {
      const {getter} = tagsConfig[tag];
      const text = getter(track);
      return <Attribute key={tag} className={`attribute-${tag}`} text={text} />;
    })}
  </MetadataWrapper>
);

type TrackProps = MotionDivProps & {
  played: PlayedTrack;
  alignRight?: boolean;
  /**
   * The list of tags to show on the 3rd row
   */
  tags?: Tags;
};

const Track = ({played, ...props}: TrackProps) => (
  <TrackContainer {...props}>
    <FullMetadata
      alignRight={props.alignRight}
      track={played.track}
      tags={props.tags ?? []}
    />
  </TrackContainer>
);

const TrackContainer = styled(motion.div)<{alignRight?: boolean}>`
  display: flex;
  flex-direction: column;
  grid-gap: 0.5rem;
  color: ${cssVar('--pt-np-primary-text')};
  font-family: 'Proxmia Nova';
  font-size: 2rem;
  text-rendering: optimizeLegibility;

  text-align: ${p => (p.alignRight ? 'right' : 'left')};
  justify-content: ${p => (p.alignRight ? 'end' : 'start')};

  > *:nth-child(1) {
    grid-row: 1;
    grid-column: ${p => (p.alignRight ? 2 : 1)};
  }
  > *:nth-child(2) {
    grid-row: 1;
    grid-column: ${p => (p.alignRight ? 1 : 2)};
  }
`;

TrackContainer.defaultProps = {
  animate: 'animate',
  initial: 'initial',
  exit: 'exit',
};

const CurrentTrack = ({played, ...p}: React.ComponentProps<typeof Track>) => (
  <CurrentWrapper>
    <AnimatePresence exitBeforeEnter>
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
  config: NowPlayingConfig;
  history: PlayedTrack[];
};

const ThemeAsot: React.FC<Props> = observer(({config, history}) =>
  history.length === 0 ? null : (
    <CurrentTrack
      style={toJS(config.colors)}
      className="track-current"
      alignRight={config.alignRight}
      tags={config.tags}
      played={history[0]}
    />
  )
);

const CurrentWrapper = styled('div')`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  > * {
    grid-column: 1;
    grid-row: 1;
  }
`;

export default {
  label: 'A State of Overlays',
  component: ThemeAsot,
  colors: defaultColors,
  enabledConfigs: ['alignRight', 'tags', 'idMarker', 'colors'],
} as ThemeDescriptor;
