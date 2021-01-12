import styled from '@emotion/styled';
import {observer} from 'mobx-react';

import {AppStore} from 'src/shared/store';
import withStore from 'src/utils/withStore';

type Props = {
  store: AppStore;
  deviceId: number;
};

const BeatCounter = observer(({store, deviceId}: Props) => {
  const state = store.devices.get(deviceId)?.state;

  const beat = state?.beatInMeasure;
  const beatsUntilCue = state?.beatsUntilCue;

  return (
    <Wrapper>
      <Bar>
        {[1, 2, 3, 4].map(count => (
          <Beat key={count} active={beat === count} />
        ))}
      </Bar>
      {beatsUntilCue !== undefined && beatsUntilCue !== null && beatsUntilCue < 64 && (
        <CueCountdown important={beatsUntilCue < 17}>
          Cue in{' '}
          {beatsUntilCue === 0
            ? '0.0'
            : `${Math.floor((beatsUntilCue - 1) / 4)}.${((beatsUntilCue - 1) % 4) + 1}`}
        </CueCountdown>
      )}
    </Wrapper>
  );
});

const Beat = styled('div')<{active: boolean}>`
  border-radius: 2px;
  background: ${p => (p.active ? '#FF9417' : '#C4C4C4')};
`;

const Bar = styled('div')`
  display: grid;
  grid-template-columns: repeat(4, 25px);
  grid-gap: 12px;
  padding: 6px 8px;
  background: ${p => p.theme.backgroundBox};
`;

const Wrapper = styled('div')`
  display: grid;
  grid-auto-flow: column;
  border-radius: 3px;
  overflow: hidden;
`;

const CueCountdown = styled('div')<{important: boolean}>`
  background: ${p => (p.important ? '#FF5757' : '#ddd')};
  color: ${p => (p.important ? '#fff' : 'initial')};
  padding: 0 8px;
  display: flex;
  align-items: center;
  text-transform: uppercase;
  font-size: 11px;
  font-weight: 500;
`;

export default withStore(BeatCounter);
