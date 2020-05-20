import * as React from 'react';

import {CDJStatus} from 'prolink-connect';
import styled from '@emotion/styled';

type Props = {
  beat?: number
  beatsUntilCue?: number
};


const Beat = styled('div')<{active: boolean}>`
  border-radius: 2px;
  background: ${p => p.active ? '#FF9417' : '#C4C4C4'};
`;

const Bar = styled('div')`
  display: grid;
  grid-template-columns: repeat(4, 25px);
  grid-gap: 12px;
  padding: 6px 8px;
  background: #EFEFEF;
` ;




const BeatCounter = ({beat, beatsUntilCue}: Props) => (
  <Bar>
    {[1, 2, 3, 4].map(count => <Beat key={count} active={beat === count} />)}
  </Bar>
)

export default BeatCounter;
