import {Radio, ZapOff} from 'react-feather';
import styled from '@emotion/styled';

type Props = {
  active: boolean;
};

const LiveHistoryIndicator = ({active}: Props) => (
  <Container showingLiveHistory={active}>
    {active ? <Radio size="1.25rem" /> : <ZapOff size="1rem" />}
    {active
      ? 'Using real-time metadata from your devices'
      : 'Showing demo metadata (Play a track to see live metadata)'}
  </Container>
);

const Container = styled('div')<{showingLiveHistory: boolean}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  top: -1rem;
  left: -1.75rem;
  height: 1.75rem;
  margin-bottom: 0.5rem;
  padding: 0 1rem;
  background: ${p => (p.showingLiveHistory ? '#ff838e' : '#4B97F8')};
  color: #fff;
  font-size: 0.675rem;
  text-transform: uppercase;
  font-weight: 700;
`;

export default LiveHistoryIndicator;
