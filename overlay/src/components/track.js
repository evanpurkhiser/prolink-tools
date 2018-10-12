import { Flex, Box } from '@rebass/grid/emotion';
import styled, { css } from 'react-emotion';
import posed, { PoseGroup } from 'react-pose';
import React from 'react';
import * as Icons from 'react-feather';

const MissingArtwork = styled(p => (
  <Flex alignItems="center" justifyContent="center" {...p}>
    <Icons.Image size="50%" />
  </Flex>
))`
  background: #000;
  color: #eee;
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

const Text = styled(Box)`
  background: rgba(0, 0, 0, 0.25);
  padding: 0 0.3em;
  border-radius: 1px;
  display: flex;
  align-items: center;
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
  <Attribute text="No Release Metadata" icon={Icons.X} {...p} />
))`
  color: rgba(255, 255, 255, 0.6);
`;

const TextMetadata = ({ track, ...p }) => (
  <Flex {...p} flex={1} alignItems="flex-end" flexDirection="column">
    <Title>{track.title}</Title>
    <Artist>{track.artist}</Artist>
    <Attributes>
      <Attribute icon={Icons.Disc} text={track.album} />
      <Attribute icon={Icons.Layers} text={track.label} />
      <Attribute icon={Icons.Hash} text={track.comment} />
      {[track.comment, track.label, track.album].join('') === '' && (
        <NoAttributes />
      )}
    </Attributes>
  </Flex>
);

const Track = ({ track, hostRef, ...props }) => (
  <Flex innerRef={hostRef} {...props}>
    <TextMetadata track={track} mr={2} />
    <Artwork src={track.artwork} size="80px" />
  </Flex>
);

export default Track;
