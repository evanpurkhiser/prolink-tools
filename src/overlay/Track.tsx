import {formatDistance} from 'date-fns';
import styled from '@emotion/styled';
import React from 'react';
import {motion} from 'framer-motion';

import * as icons from 'src/shared/components/Icons';
import TimeTicker from 'src/overlay/TimeTicker';
import {PlayedTrack} from 'src/shared/store';

const artToSrc = (d: Buffer | undefined) =>
  d && d.length > 0
    ? `data:image/jpg;base64,${window.btoa(String.fromCharCode(...d))}`
    : undefined;

type MotionDivProps = React.ComponentProps<typeof motion.div>;

const MissingArtwork = styled(
  React.forwardRef<HTMLDivElement, MotionDivProps>((p, ref) => (
    <motion.div ref={ref} {...p}>
      <icons.Disc size="50%" />
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

const artworkAnimation = (animateIn: boolean) => ({
  init: {
    clipPath: animateIn
      ? 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)'
      : 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
  },
  enter: {
    clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
    transitionEnd: {zIndex: 10},
  },
  exit: {
    clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
    transition: {
      type: 'spring',
      stiffness: 700,
      damping: 100,
    },
  },
});

type ArtworkProps = {animateIn: boolean} & (
  | ({src: string} & React.ComponentProps<typeof motion.img>)
  | ({src: undefined} & React.HTMLAttributes<HTMLImageElement>)
);

const BaseArtwork = ({animateIn, ...p}: ArtworkProps) =>
  p.src !== undefined ? (
    <motion.img variants={artworkAnimation(animateIn)} {...p} />
  ) : (
    <MissingArtwork variants={artworkAnimation(animateIn)} className={p.className} />
  );

const Artwork = styled(BaseArtwork)<ArtworkProps & {size: string}>`
  display: flex;
  height: ${p => p.size};
  width: ${p => p.size};
  border-radius: 3px;
  flex-shrink: 0;
`;

const textAnimations = {
  init: {
    opacity: 0,
    x: -20,
  },
  enter: {
    opacity: 1,
    x: 0,
  },
  exit: {x: 0},
};

let Text = styled((p: MotionDivProps) => <motion.div variants={textAnimations} {...p} />)`
  background: rgba(0, 0, 0, 0.25);
  padding: 0 0.28em;
  border-radius: 1px;
  display: flex;
  align-items: center;
  margin-left: 4px;
`;

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

const attributeAnimations = {
  enter: {
    x: 0,
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.2,
      staggerDirection: -1,
    },
  },
};

const Attributes = styled((p: MotionDivProps) => (
  <motion.div variants={attributeAnimations} {...p} />
))`
  display: flex;
  font-size: 0.9em;
  line-height: 1.4;
  margin-top: 0.1em;
  // Set nowrap to fix a layout bug that occurse when the element is FLIPed in
  // pose during the animation.
  white-space: nowrap;
`;

type IconProps = {
  icon: typeof icons.Hash;
  className?: string;
};

const Icon = styled((p: IconProps) => <p.icon className={p.className} size="1em" />)`
  margin-right: 0.25em;
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
  <Attribute text="No Release Metadata" icon={icons.X} {...p} />
))`
  color: rgba(255, 255, 255, 0.6);
`;

const metadataAnimations = {
  init: {
    clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
  },
  enter: {
    clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
    transition: {
      staggerChildren: 0.2,
    },
  },
  exit: {
    clipPath: 'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)',
    transition: {
      type: 'spring',
      stiffness: 700,
      damping: 90,
    },
  },
};

let MetadataWrapper = styled((p: MotionDivProps) => (
  <motion.div variants={metadataAnimations} {...p} />
))`
  display: flex;
  flex: 1;
  align-items: flex-end;
  flex-direction: column;
`;

type FullMetadataProps = MotionDivProps & {
  track: PlayedTrack['track'];
};

const FullMetadata = ({track, ...p}: FullMetadataProps) => (
  <MetadataWrapper {...p}>
    <Title>{track.title}</Title>
    <Artist>{track.artist?.name}</Artist>
    <Attributes>
      <Attribute icon={icons.Disc} text={track.album?.name} />
      <Attribute icon={icons.Layers} text={track.label?.name} />
      <Attribute icon={icons.Hash} text={track.comment} />
      {!(track.comment || track.label || track.album) && <NoAttributes key="no-field" />}
    </Attributes>
  </MetadataWrapper>
);

type BaseTrackProps = MotionDivProps & {
  played: PlayedTrack;
  /**
   * Disables animation of the artwork
   */
  firstPlayed?: boolean;
};

const FullTrack = React.forwardRef<HTMLDivElement, BaseTrackProps>(
  ({played, firstPlayed, ...props}, ref) => (
    <TrackContainer ref={ref} {...props}>
      <FullMetadata track={played.track} />
      <Artwork animateIn={!!firstPlayed} src={artToSrc(played.artwork)} size="80px" />
    </TrackContainer>
  )
);

const TrackContainer = styled(p => (
  <motion.div {...p} animate="enter" initial="init" exit="exit" />
))`
  display: grid;
  grid-template-columns: auto max-content;
  grid-gap: 8px;
  color: #fff;
  font-family: Ubuntu;
`;

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
      <MetadataWrapper>
        <MiniTitle>{played.track.title}</MiniTitle>
        <MiniArtist>{played.track.artist?.name}</MiniArtist>
        <PlayedAt>
          <TimeTicker randomRange={[15, 30]}>
            {() => {
              // TODO: FIX THIS
              console.log(played.playedAt);
              return (
                played.playedAt && `${formatDistance(Date.now(), played.playedAt)} ago`
              );
            }}
          </TimeTicker>
        </PlayedAt>
      </MetadataWrapper>
      <Artwork animateIn src={artToSrc(played.artwork)} size="50px" />
    </TrackContainer>
  )
);

type TrackProps = BaseTrackProps & {mini?: boolean};

const Track = React.forwardRef<HTMLDivElement, TrackProps>(({mini, ...props}, ref) =>
  mini ? <MiniTrack ref={ref} {...props} /> : <FullTrack ref={ref} {...props} />
);

export default Track;
