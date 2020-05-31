import * as React from 'react';

import styled from '@emotion/styled';

type Props = {
  beat?: number;
  beatsUntilCue?: number | null;
};

const BeatCounter = ({beat, beatsUntilCue}: Props) => (
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

const Beat = styled('div')<{active: boolean}>`
  border-radius: 2px;
  background: ${p => (p.active ? '#FF9417' : '#C4C4C4')};
`;

const Bar = styled('div')`
  display: grid;
  grid-template-columns: repeat(4, 25px);
  grid-gap: 12px;
  padding: 6px 8px;
  background: #efefef;
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
  font-weight: bold;
`;

export default BeatCounter;
