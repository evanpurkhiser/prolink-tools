import { Flex } from '@rebass/grid/emotion';
import { formatDistance } from 'date-fns';
import styled, { css } from 'react-emotion';
import posed from 'react-pose';
import React from 'react';

import * as icons from './icons';
import TimeTicker from './timeTicker';

const MissingArtwork = styled(p => (
  <Flex alignItems="center" justifyContent="center" innerRef={p.hostRef} {...p}>
    <icons.Disc size="50%" />
  </Flex>
))`
  background: #000;
  color: #aaa;
  opacity: 0.5;
`;

let Artwork = ({ hostRef, animateIn, ...p }) =>
  p.src ? (
    <img ref={hostRef} {...p} />
  ) : (
    <MissingArtwork hostRef={hostRef} className={p.className} />
  );

Artwork = styled(Artwork)`
  display: flex;
  height: ${p => p.size};
  width: ${p => p.size};
  border-radius: 3px;
  flex-shrink: 0;
`;

Artwork = posed(Artwork)({
  start: {
    clipPath: ({ animateIn }) =>
      animateIn
        ? 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)'
        : 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
  },
  enter: {
    clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
  },
  exit: {
    applyAtStart: { zIndex: 10 }, // Above the next artwork
    clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
    transition: {
      type: 'spring',
      stiffness: 700,
      damping: 100,
    },
  },
});

let Text = styled('div')`
  background: rgba(0, 0, 0, 0.25);
  padding: 0 0.28em;
  border-radius: 1px;
  display: flex;
  align-items: center;
  margin-left: 4px;
`;

Text = posed(Text)({
  start: {
    opacity: 0,
    x: '-20px',
  },
  enter: {
    opacity: 1,
    x: 0,
  },
  exit: { x: 0 },
});

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

let Attributes = styled('div')`
  display: flex;
  font-size: 0.9em;
  line-height: 1.4;
  margin-top: 0.1em;

  // Set nowrap to fix a layout bug that occurse when the element is FLIPed in
  // pose during the animation.
  white-space: nowrap;
`;

Attributes = posed(Attributes)({
  exit: { x: 0 },
  enter: {
    x: 0,
    beforeChildren: true,
    staggerChildren: 200,
    staggerDirection: -1,
  },
});

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

let MetadataWrapper = p => (
  <Flex {...p} flex={1} alignItems="flex-end" flexDirection="column" />
);

MetadataWrapper = posed(MetadataWrapper)({
  start: {
    clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
  },
  enter: {
    staggerChildren: 200,
    clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
  },
  exit: {
    clipPath: 'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)',
    transition: {
      type: 'spring',
      stiffness: 700,
      damping: 90,
    },
  },
});

const FullMetadata = ({ track, ...p }) => (
  <MetadataWrapper {...p}>
    <Title>{track.title}</Title>
    <Artist>{track.artist}</Artist>
    <Attributes>
      <Attribute icon={icons.Disc} text={track.album} />
      <Attribute icon={icons.Layers} text={track.label} />
      <Attribute icon={icons.Hash} text={track.comment} />
      {[track.comment, track.label, track.album].join('') === '' && (
        <NoAttributes />
      )}
    </Attributes>
  </MetadataWrapper>
);

const FullTrack = ({ track, hostRef, ...props }) => (
  <Flex innerRef={hostRef} {...props}>
    <FullMetadata track={track} mr={2} />
    <Artwork src={track.artwork} size="80px" />
  </Flex>
);

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

const MiniTrack = ({ track, hostRef, ...props }) => (
  <Flex innerRef={hostRef} {...props}>
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
    <Artwork src={track.artwork} size="50px" />
  </Flex>
);

const Track = ({ mini, ...props }) =>
  mini ? <MiniTrack {...props} /> : <FullTrack {...props} />;

const getMutedStyles = p =>
  p.muteStopped &&
  !p.track.playing &&
  css`
    opacity: 0.7;
  `;

const StyledTrack = styled(Track)`
  transition: opacity 2s ease-in-out;
  ${getMutedStyles};
`;

export default StyledTrack;
