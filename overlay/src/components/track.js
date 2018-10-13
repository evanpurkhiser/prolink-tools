import { Flex } from '@rebass/grid/emotion';
import { formatDistance } from 'date-fns';
import styled, { css } from 'react-emotion';
import posed from 'react-pose';
import React from 'react';

import * as icons from './icons';
import TimeTicker from './timeTicker';

const MissingArtwork = styled(p => (
  <Flex alignItems="center" justifyContent="center" {...p}>
    <icons.Disc size="50%" />
  </Flex>
))`
  background: #000;
  color: #aaa;
  opacity: 0.5;
`;

const Artwork = styled(
  p => (p.src ? <img {...p} /> : <MissingArtwork className={p.className} />)
)`
  display: flex;
  height: ${p => p.size};
  width: ${p => p.size};
  border-radius: 3px;
  flex-shrink: 0;
`;

const Text = styled('div')`
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

const Attributes = styled(Flex)`
  font-size: 0.9em;
  line-height: 1.4;
  margin-top: 0.1em;
`;

const Icon = styled(p => <p.icon className={p.className} size="1em" />)`
  margin-right: 0.25em;
`;

const Attribute = ({ icon, text, ...p }) =>
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

const MetadataWrapper = p => (
  <Flex {...p} flex={1} alignItems="flex-end" flexDirection="column" />
);

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
