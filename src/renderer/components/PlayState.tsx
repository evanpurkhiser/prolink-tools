import * as React from 'react';

import {CDJStatus} from 'prolink-connect';
import styled from '@emotion/styled';
import {css} from '@emotion/core';

type Props = React.HTMLAttributes<HTMLDivElement> & {
  playState?: CDJStatus.PlayState;
};

const colors: Record<CDJStatus.PlayState, {bg: string; stroke?: string}> = {
  [CDJStatus.PlayState.Empty]: {bg: '#fff', stroke: '#E3E3E3'},
  [CDJStatus.PlayState.Loading]: {bg: '#E9E9E9'},
  [CDJStatus.PlayState.Playing]: {bg: '#81F14C'},
  [CDJStatus.PlayState.Looping]: {bg: '#FFD466'},
  [CDJStatus.PlayState.Paused]: {bg: '#78DFFF'},
  [CDJStatus.PlayState.Cued]: {bg: '#FF9466'},
  [CDJStatus.PlayState.Cuing]: {bg: '#FF9466'},
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
  ${p =>
    colors[p.playState ?? CDJStatus.PlayState.Empty]?.stroke &&
    css`
      border: 2px solid ${colors[p.playState ?? CDJStatus.PlayState.Empty]?.stroke};
      padding: calc(0.25rem - 6px) calc(0.5rem - 4px);
    `};
  font-size: 12px;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  display: inline-block;
  text-transform: uppercase;
  border-radius: 3px;
`;

export default PlayState;
