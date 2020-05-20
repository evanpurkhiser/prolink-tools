import * as React from 'react';

import {CDJStatus} from 'prolink-connect';
import styled from '@emotion/styled';

type Props = React.HTMLAttributes<HTMLDivElement> & {
  playState?: CDJStatus.PlayState;
};

const colors: Record<CDJStatus.PlayState, {bg: string; stroke?: string}> = {
  [CDJStatus.PlayState.Empty]: {bg: '#f1f1f1'},
  [CDJStatus.PlayState.Loading]: {bg: '#E9E9E9'},
  [CDJStatus.PlayState.Playing]: {bg: '#81F14C'},
  [CDJStatus.PlayState.Looping]: {bg: '#FFD466'},
  [CDJStatus.PlayState.Paused]: {bg: '#78DFFF'},
  [CDJStatus.PlayState.Cued]: {bg: '#FFC266'},
  [CDJStatus.PlayState.Cuing]: {bg: '#FF9466'},
  [CDJStatus.PlayState.PlatterHeld]: {bg: '#DDFFB2'},
  [CDJStatus.PlayState.Searching]: {bg: '#B378FF'},
  [CDJStatus.PlayState.SpunDown]: {bg: '#FB75A5'},
  [CDJStatus.PlayState.Ended]: {bg: '#FF6666'},
};

const text = Object.fromEntries(
  Object.entries(CDJStatus.PlayState).map(([k, v]) => [v, k])
);

const PlayState = styled(({playState, ...p}: Props) => (
  <div {...p}>{text[playState ?? CDJStatus.PlayState.Empty]}</div>
))`
  background: ${p => colors[p.playState ?? CDJStatus.PlayState.Empty].bg};
  min-width: 74px;
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0 0.5rem;
  text-align: center;
  line-height: 22px;
  text-transform: uppercase;
  border-radius: 3px;
`;

export default PlayState;
