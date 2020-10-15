import React from 'react';
import styled from '@emotion/styled';
import {motion} from 'framer-motion';
import {formatDistance} from 'date-fns';

import {PlayedTrack} from 'src/shared/store';
import TimeTicker from 'src/shared/components/TimeTicker';
import {Hash, Disc, X, Layers, Activity, Code} from 'react-feather';

const artToSrc = (d: Buffer | undefined) =>
  d && d.length > 0
    ? `data:image/jpg;base64,${window.btoa(String.fromCharCode(...d))}`
    : undefined;

type MotionDivProps = React.ComponentProps<typeof motion.div>;

type OrientedMotionDivProps = MotionDivProps & {
  alignRight?: boolean;
};

type TagConfig = {
  icon: React.ComponentType<React.ComponentProps<typeof Disc>>;
  getter: (track: PlayedTrack['track']) => string | undefined;
};

const makeTagConfig = <T extends {[name: string]: TagConfig}>(config: T) => config;

const tagsConfig = makeTagConfig({
  album: {icon: Disc, getter: track => track.album?.name},
  label: {icon: Layers, getter: track => track.label?.name},
  comment: {icon: Hash, getter: track => track.comment},
  tempo: {icon: Activity, getter: track => (track.tempo > 0 ? `${track.tempo} BPM` : '')},
  key: {icon: Code, getter: track => track.key?.name},
});

export type Tags = Array<keyof typeof tagsConfig>;

export const availableTags = Object.keys(tagsConfig);

const MissingArtwork = styled(
  React.forwardRef<HTMLDivElement, MotionDivProps>((p, ref) => (
    <motion.div ref={ref} {...p}>
      <Disc size="50%" />
    </motion.div>
  ))
)`
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  color: #aaa;
  opacity: 0.5;
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
      transition: {
        type: 'spring',
        stiffness: 700,
        damping: 100,
      },
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

let Text = styled(motion.div)`
  background: rgba(0, 0, 0, 0.25);
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

const Artist = styled(Text)`
  font-size: 1.1em;
  line-height: 1.3;
  margin-bottom: 0.2em;
`;

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
  color: rgba(255, 255, 255, 0.6);
`;

let MetadataWrapper = styled(motion.div)<{alignRight?: boolean}>`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: ${p => (p.alignRight ? 'flex-end' : 'flex-start')};
`;

MetadataWrapper.defaultProps = {
  variants: {
    initial: {
      clipPath: 'inset(0% 100% 0% 0%)',
    },
    animate: {
      clipPath: 'inset(0% 0% 0% 0%)',
      transition: {
        staggerChildren: 0.2,
      },
    },
    exit: {
      clipPath: 'inset(0% 100% 0% 0%)',
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 90,
      },
    },
  },
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
        return <Attribute key={tag} {...{icon, text}} />;
      })}
      {tags.map(t => tagsConfig[t].getter(track)).join('') === '' && (
        <NoAttributes key="no-field" />
      )}
    </Attributes>
  </MetadataWrapper>
);

type BaseTrackProps = MotionDivProps & {
  played: PlayedTrack;
  alignRight?: boolean;
  /**
   * Disables animation of the artwork
   */
  firstPlayed?: boolean;
  /**
   * The list of tags to show on the 3rd row
   */
  tags?: Tags;
};

const FullTrack = React.forwardRef<HTMLDivElement, BaseTrackProps>(
  ({played, firstPlayed, ...props}, ref) => (
    <TrackContainer ref={ref} {...props}>
      <Artwork
        alignRight={props.alignRight}
        animateIn={!!firstPlayed}
        src={artToSrc(played.artwork)}
        size="80px"
      />
      <FullMetadata
        alignRight={props.alignRight}
        track={played.track}
        tags={props.tags ?? []}
      />
    </TrackContainer>
  )
);

const TrackContainer = styled(motion.div)<{alignRight?: boolean}>`
  display: inline-grid;
  grid-gap: 0.5rem;
  color: #fff;
  font-family: Ubuntu;
  grid-template-columns: ${p =>
    p.alignRight ? 'minmax(0, 1fr) max-content' : 'max-content minmax(0, 1fr)'};

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

const MiniTrack = React.forwardRef<HTMLDivElement, BaseTrackProps>(
  ({played, ...props}, ref) => (
    <TrackContainer ref={ref} {...props}>
      <Artwork
        animateIn
        alignRight={props.alignRight}
        src={artToSrc(played.artwork)}
        size="50px"
      />
      <MetadataWrapper alignRight={props.alignRight}>
        <MiniTitle>{played.track.title}</MiniTitle>
        <MiniArtist>{played.track.artist?.name}</MiniArtist>
        <PlayedAt>
          <TimeTicker randomRange={[15, 30]}>
            {() =>
              played.playedAt && `${formatDistance(Date.now(), played.playedAt)} ago`
            }
          </TimeTicker>
        </PlayedAt>
      </MetadataWrapper>
    </TrackContainer>
  )
);

type TrackProps = BaseTrackProps & {mini?: boolean};

const Track = React.forwardRef<HTMLDivElement, TrackProps>(({mini, ...props}, ref) =>
  mini ? <MiniTrack ref={ref} {...props} /> : <FullTrack ref={ref} {...props} />
);

export default Track;
