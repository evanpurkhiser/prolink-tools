import * as React from 'react';
import styled from '@emotion/styled';
import {CDJStatus} from 'prolink-connect/lib/types';

type Props = React.HTMLAttributes<HTMLDivElement> & {
  playState?: CDJStatus.PlayState;
};

const text = Object.fromEntries(
  Object.entries(CDJStatus.PlayState).map(([k, v]) => [v, k])
);

const PlayState = styled(({playState, ...p}: Props) => (
  <div {...p}>{text[playState ?? CDJStatus.PlayState.Empty] ?? 'unknown'}</div>
))`
  background: ${p =>
    p.theme.playStates[p.playState ?? CDJStatus.PlayState.Empty]?.bg ??
    p.theme.backgroundBox};
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
