import { observer } from 'mobx-react';
import { formatDistance } from 'date-fns';
import styled from '@emotion/styled';
import posed, { PoseGroup } from 'react-pose';
import React from 'react';
import {motion, AnimatePresence} from 'framer-motion'

import * as icons from 'app/components/icons';
import config from 'app/config';
import TimeTicker from 'app/components/timeTicker';

const attributeIcons = {
  album: icons.Disc,
  label: icons.Layers,
  comment: icons.Hash,
  key: icons.Music,
  genre: icons.Star,
};

const MissingArtwork = styled(
  React.forwardRef((p, ref) => (
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

const artworkAnimation = animateIn => ({
  init: {
    clipPath: animateIn
        ? 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)'
        : 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
  },
  enter: {
    clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
    transitionEnd: { zIndex: 10 }
  },
  exit: {
    clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
    transition: {
      type: 'spring',
      stiffness: 700,
      damping: 100,
    },
  }
});

let Artwork = React.forwardRef(({ animateIn, ...p }, ref) =>
  p.src ? (
    <motion.img variants={artworkAnimation(animateIn)} ref={ref} {...p} />
  ) : (
    <MissingArtwork variants={artworkAnimation(animateIn)} ref={ref} className={p.className} />
  )
);

Artwork = styled(Artwork)`
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
  exit: { x: 0 },
};

let Text = styled(p => <motion.div variants={textAnimations} {...p} />)`
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
    }
  },
};

let Attributes = styled(p => <motion.div variants={attributeAnimations} {...p} />)`
  display: flex;
  font-size: 0.9em;
  line-height: 1.4;
  margin-top: 0.1em;

  // Set nowrap to fix a layout bug that occurse when the element is FLIPed in
  // pose during the animation.
  white-space: nowrap;
`;

const Icon = styled(p => <p.icon className={p.className} size="1em" />)`
  margin-right: 0.25em;
`;

let Attribute = ({ icon, text, ...p }) =>
  text === '' ? null : (
    <Text ml={1} {...p}>
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

let MetadataWrapper = styled(p => <motion.div variants={metadataAnimations} {...p} />)`
  display: flex;
  flex: 1;
  align-items: flex-end;
  flex-direction: column;
`;

const FullMetadata = observer(({ track, ...p }) => (
  <MetadataWrapper {...p}>
    <Title>{track.title}</Title>
    <Artist>{track.artist}</Artist>
    <Attributes>
        {config.detailItems.map(f => (
          <Attribute icon={attributeIcons[f]} text={track[f]} key={f} />
        ))}
        {config.detailItems.map(f => track[f]).join('') === '' && (
          <NoAttributes key="no-field" />
        )}
    </Attributes>
  </MetadataWrapper>
));

const FullTrack = React.forwardRef(({ track, firstPlayed, ...props }, ref) => (
  <TrackContainer ref={ref} {...props}>
    <FullMetadata track={track} />
    <Artwork animateIn={firstPlayed} src={track.artwork} size="80px" />
  </TrackContainer>
));

const TrackContainer = styled(p => <motion.div {...p} animate="enter" initial="init" exit="exit" />)`
  display: grid;
  grid-template-columns: auto max-content;
  grid-gap: 8px;
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

const MiniTrack = React.forwardRef(({ track, ...props }, ref) => (
  <TrackContainer ref={ref} {...props}>
    <MetadataWrapper mr={1}>
      <MiniTitle>{track.title}</MiniTitle>
      <MiniArtist>{track.artist}</MiniArtist>
      <PlayedAt>
        <TimeTicker
          playedAt={track.playedAt}
          randomRange={[15, 30]}
          render={_ => `${formatDistance(Date.now(), track.playedAt)} ago`}
        />
      </PlayedAt>
    </MetadataWrapper>
    <Artwork animateIn src={track.artwork} size="50px" />
  </TrackContainer>
));

const Track = React.forwardRef(({ mini, ...props }, ref) =>
  mini ? <MiniTrack ref={ref} {...props} /> : <FullTrack ref={ref} {...props} />
);

export default Track;
