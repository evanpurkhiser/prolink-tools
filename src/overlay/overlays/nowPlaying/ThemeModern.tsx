import React from 'react';
import {Disc, X} from 'react-feather';
import styled from '@emotion/styled';
import {formatDistance} from 'date-fns';
import {AnimatePresence, motion} from 'framer-motion';
import {toJS} from 'mobx';
import {observer} from 'mobx-react';

import TimeTicker from 'src/shared/components/TimeTicker';
import {PlayedTrack} from 'src/shared/store';

import {Tags, tagsConfig} from './tags';
import {NowPlayingConfig, ThemeDescriptor} from '.';

const artToSrc = (d: Buffer | undefined) =>
  d && d.length > 0
    ? `data:image/jpg;base64,${window.btoa(String.fromCharCode(...d))}`
    : undefined;

type MotionDivProps = React.ComponentProps<typeof motion.div>;

type OrientedMotionDivProps = MotionDivProps & {
  alignRight?: boolean;
};

const defaultColors = {
  '--pt-np-primary-text': '#fff',
  '--pt-np-primary-bg': 'rgba(0, 0, 0, 0.25)',
  '--pt-np-empty-attrs-text': 'rgba(255, 255, 255, 0.6)',
  '--pt-np-empty-art-bg': '#28272b',
  '--pt-np-empty-art-icon': '#aaa',
};

const cssVar = (name: keyof typeof defaultColors) =>
  `var(${name}, ${defaultColors[name]})`;

const MissingArtwork = styled((p: MotionDivProps) => (
  <motion.div {...p}>
    <Disc size="50%" />
  </motion.div>
))`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${cssVar('--pt-np-empty-art-bg')};
  color: ${cssVar('--pt-np-empty-art-icon')};
  opacity: 1;
`;

type ArtworkProps = {alignRight?: boolean; animateIn: boolean} & (
  | ({src: string} & React.ComponentProps<typeof motion.img>)
  | ({src: undefined} & React.HTMLAttributes<HTMLImageElement>)
);

const BaseArtwork = ({animateIn, alignRight, ...p}: ArtworkProps) => {
  const animation = {
    initial: {
      clipPath: !animateIn
        ? 'inset(0% 0% 0% 0%)'
        : alignRight
        ? 'inset(0% 0% 0% 100%)'
        : 'inset(0% 100% 0% 0%)',
    },
    animate: {
      clipPath: 'inset(0% 0% 0% 0%)',
      transitionEnd: {zIndex: 1},
    },
    exit: {
      clipPath: 'inset(0% 0% 100% 0%)',
    },
  };

  return p.src !== undefined ? (
    <motion.img variants={animation} {...p} />
  ) : (
    <MissingArtwork variants={animation} className={p.className} />
  );
};

const Artwork = styled(BaseArtwork)<ArtworkProps & {size: string}>`
  display: flex;
  height: ${p => p.size};
  width: ${p => p.size};
  border-radius: 3px;
  flex-shrink: 0;
`;

Artwork.defaultProps = {
  className: 'track-artwork',
};

const Text = styled(motion.div)`
  background: ${cssVar('--pt-np-primary-bg')};
  padding: 0 0.28em;
  border-radius: 1px;
  display: inline-block;
  margin-left: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
`;

Text.defaultProps = {
  variants: {
    initial: {opacity: 0, x: -20},
    animate: {opacity: 1, x: 0},
    exit: {x: 0},
  },
};

const Title = styled(Text)`
  font-weight: 600;
  font-size: 1.3em;
  line-height: 1.4;
  margin-bottom: 0.2em;
`;

Title.defaultProps = {
  ...Text.defaultProps,
  className: 'metadata-title',
};

const Artist = styled(Text)`
  font-size: 1.1em;
  line-height: 1.3;
  margin-bottom: 0.2em;
`;

Artist.defaultProps = {
  ...Text.defaultProps,
  className: 'metadata-artist',
};

const Attributes = styled(({alignRight, ...p}: OrientedMotionDivProps) => {
  const animation = {
    animate: {
      x: 0,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.2,
        staggerDirection: alignRight ? -1 : 1,
      },
    },
  };
  return <motion.div variants={animation} {...p} />;
})`
  display: flex;
  font-size: 0.9em;
  line-height: 1.4;
  margin-top: 0.1em;
  // Set nowrap to fix a layout bug that occurse when the element is FLIPed in
  // pose during the animation.
  white-space: nowrap;
`;

Attributes.defaultProps = {
  className: 'metadata-attributes',
};

type IconProps = {
  icon: React.ComponentType<React.ComponentProps<typeof Disc>>;
  className?: string;
};

const Icon = styled((p: IconProps) => <p.icon className={p.className} size="1em" />)`
  margin-right: 0.25em;
  vertical-align: text-top;
`;

type AttributeProps = React.ComponentProps<typeof Text> & {
  icon: IconProps['icon'];
  text?: string;
};

const Attribute = ({icon, text, ...p}: AttributeProps) =>
  text === '' || text === undefined ? null : (
    <Text {...p}>
      <Icon icon={icon} />
      {text}
    </Text>
  );

const NoAttributes = styled(p => (
  <Attribute text="No Release Metadata" icon={X} {...p} />
))`
  color: ${cssVar('--pt-np-empty-attrs-text')};
`;

const MetadataWrapper = styled((p: OrientedMotionDivProps) => {
  const variants = {
    initial: {
      clipPath: 'inset(0% 100% 0% 0%)',
    },
    animate: {
      clipPath: 'inset(0% 0% 0% 0%)',
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.15,
      },
    },
    exit: {
      clipPath: p.alignRight ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)',
      transition: {
        duration: 0.2,
      },
    },
  };

  return <motion.div variants={variants} {...p} />;
})<{alignRight?: boolean}>`
  display: flex;
  flex: 1;
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
    <Title>{track.title}</Title>
    <Artist>{track.artist?.name}</Artist>
    <Attributes alignRight={p.alignRight}>
      {tags.map(tag => {
        const {icon, getter} = tagsConfig[tag];
        const text = getter(track);
        return <Attribute key={tag} className={`attribute-${tag}`} {...{icon, text}} />;
      })}
      {tags.map(t => tagsConfig[t].getter(track)).join('') === '' && tags.length > 0 && (
        <NoAttributes key="no-field" />
      )}
    </Attributes>
  </MetadataWrapper>
);

type BaseTrackProps = MotionDivProps & {
  played: PlayedTrack;
  alignRight?: boolean;
  hideArtwork?: boolean;
  /**
   * Enables animation of the artwork
   */
  firstPlayed?: boolean;
  /**
   * The list of tags to show on the 3rd row
   */
  tags?: Tags;
};

const FullTrack = ({played, firstPlayed, hideArtwork, ...props}: BaseTrackProps) => (
  <TrackContainer {...props}>
    {!hideArtwork && (
      <Artwork
        alignRight={props.alignRight}
        animateIn={!!firstPlayed}
        src={artToSrc(played.artwork)}
        size="80px"
      />
    )}
    <FullMetadata
      alignRight={props.alignRight}
      track={played.track}
      tags={props.tags ?? []}
    />
  </TrackContainer>
);

const TrackContainer = styled(motion.div)<{alignRight?: boolean}>`
  display: inline-grid;
  grid-gap: 0.5rem;
  color: ${cssVar('--pt-np-primary-text')};
  font-family: Ubuntu;
  justify-content: ${p => (p.alignRight ? 'right' : 'left')};
  grid-template-columns: ${p =>
    p.alignRight
      ? 'minmax(0, max-content) max-content'
      : 'max-content minmax(0, max-content)'};

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

const MiniTitle = styled(Text)`
  font-size: 0.85em;
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 0.15em;
`;

const MiniArtist = styled(Text)`
  font-size: 0.8em;
  line-height: 1.2;
  margin-bottom: 0.25em;
`;

const PlayedAt = styled(Text)`
  font-size: 0.7em;
  line-height: 1.3;
`;

const MiniTrack = ({played, hideArtwork, ...props}: BaseTrackProps) => (
  <TrackContainer {...props}>
    {!hideArtwork && (
      <Artwork
        animateIn
        alignRight={props.alignRight}
        src={artToSrc(played.artwork)}
        size="50px"
      />
    )}
    <MetadataWrapper alignRight={props.alignRight}>
      <MiniTitle>{played.track.title}</MiniTitle>
      <MiniArtist>{played.track.artist?.name}</MiniArtist>
      <PlayedAt>
        <TimeTicker randomRange={[15, 30]}>
          {() => played.playedAt && `${formatDistance(Date.now(), played.playedAt)} ago`}
        </TimeTicker>
      </PlayedAt>
    </MetadataWrapper>
  </TrackContainer>
);

type TrackProps = BaseTrackProps & {mini?: boolean};

const Track = ({mini, ...props}: TrackProps) =>
  mini ? <MiniTrack {...props} /> : <FullTrack {...props} />;

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
  config: NowPlayingConfig;
  history: PlayedTrack[];
};

const ThemeModern: React.FC<Props> = observer(({config, history}) =>
  history.length === 0 ? null : (
    <React.Fragment>
      <CurrentTrack
        style={toJS(config.colors)}
        className="track-current"
        alignRight={config.alignRight}
        hideArtwork={config.hideArtwork}
        tags={config.tags}
        firstPlayed={history.length === 1}
        played={history[0]}
      />
      {(config.historyCount ?? 0) > 0 && history.length > 1 && (
        <RecentWrapper className="track-recents" style={toJS(config.colors)}>
          <AnimatePresence>
            {history
              .slice(1, config.historyCount ? config.historyCount + 1 : 0)
              .map(track => (
                <Track
                  mini
                  layout
                  alignRight={config.alignRight}
                  hideArtwork={config.hideArtwork}
                  played={track}
                  variants={{exit: {display: 'none'}}}
                  key={`${track.playedAt}-${track.track.id}`}
                />
              ))}
          </AnimatePresence>
        </RecentWrapper>
      )}
    </React.Fragment>
  )
);

const RecentWrapper = styled('div')`
  display: flex;
  flex-direction: column;
  margin-top: 2rem;
  gap: 14px;
`;

const CurrentWrapper = styled('div')`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  > * {
    grid-column: 1;
    grid-row: 1;
  }
`;

export default {
  label: 'Track List',
  component: ThemeModern,
  colors: defaultColors,
  enabledConfigs: ['alignRight', 'hideArtwork', 'historyCount', 'tags'],
} as ThemeDescriptor;
