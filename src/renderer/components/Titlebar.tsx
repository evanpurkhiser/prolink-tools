import styled from '@emotion/styled';

import Navigation from './Navigation';
import NetworkStatus from './NetworkStatus';

const Toolbar = () => (
  <Container>
    <Navigation />
    <NetworkStatus />
  </Container>
);

const Container = styled('header')`
  position: sticky;
  z-index: 1;
  top: 0;
  height: 36px;
  padding: 0 0.5rem;
  padding-left: 75px;
  display: grid;
  justify-content: end;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  grid-gap: 0.5rem;
  align-items: center;
  background: ${p => p.theme.backgroundSecondary};
  transition: background 300ms;
  border-bottom: 1px solid ${p => p.theme.border};
  -webkit-app-region: drag;
`;

export default Toolbar;
