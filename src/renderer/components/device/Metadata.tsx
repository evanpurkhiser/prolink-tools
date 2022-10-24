import styled from '@emotion/styled';
import {motion} from 'framer-motion';
import {observer} from 'mobx-react';

import {AppStore} from 'src/shared/store';
import withStore from 'src/utils/withStore';

type Props = React.ComponentProps<typeof motion.div> & {
  store: AppStore;
  deviceId: number;
};

const formatDuration = (duration: number) =>
  `${Math.floor(duration / 60)
    .toString()
    .padStart(2, '0')}m ${(duration % 60).toString().padStart(2, '0')}s`;

const Metadata = observer(({store, deviceId, ...props}: Props) => {
  const deviceStore = store.devices.get(deviceId);

  if (!deviceStore) {
    return null;
  }

  // Track is being loaded. No need to render anything
  if (!deviceStore.track && deviceStore.state?.trackId !== 0) {
    return null;
  }

  if (!deviceStore.track) {
    return <NoTrack {...props} />;
  }

  const {track, artwork} = deviceStore;

  return (
    <Wrapper {...props}>
      {artwork && artwork.length > 0 && (
        <Artwork src={`data:image/jpg;base64,${btoa(String.fromCharCode(...artwork))}`} />
      )}
      <Info>
        <Title>{track.title}</Title>
        <Artist>{track.artist?.name}</Artist>
        <Details>
          <Filetype>{track.filePath.split('.').pop()}</Filetype>
          <div>{formatDuration(track.duration)}</div>
          <div>{track.key?.name}</div>
          <div>{track.genre?.name}</div>
        </Details>
      </Info>
    </Wrapper>
  );
});

const NoTrack = styled(motion.div)`
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 2rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  background: ${p => p.theme.backgroundBox};
  color: ${p => p.theme.subText};
  border-radius: 3px;

  &:after {
    content: 'No Track Loaded';
  }
`;

const Wrapper = styled(motion.div)`
  display: grid;
  grid-template-columns: auto auto;
  grid-gap: 0.5rem;
`;

const Info = styled('div')`
  display: grid;
  grid-auto-flow: row;
  grid-auto-rows: max-content;
  grid-gap: 0.125rem;
`;

const Details = styled('div')`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  grid-gap: 1rem;
  align-items: center;
  font-size: 0.7rem;
`;

const Filetype = styled('div')`
  font-size: 0.625rem;
  background: #3b434b;
  color: #fff;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  padding: 0 0.25rem;
  line-height: 14px;
  border-radius: 2px;
`;

const Title = styled('div')`
  font-weight: 600;
  font-size: 0.85rem;
`;

const Artist = styled('div')`
  font-size: 0.75rem;
`;

const Artwork = styled('img')`
  border-radius: 3px;
  height: 48px;
  width: 48px;
`;

export default withStore(Metadata);
