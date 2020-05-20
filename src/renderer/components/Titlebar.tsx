import * as React from 'React';
import styled from '@emotion/styled';

const Container = styled('div')`
  height: 40px;
  padding: 0 1rem;
  padding-left: 75px;
  display: flex;
  align-items: center;
  -webkit-app-region: drag;
`;

const Toolbar = () => <Container>test</Container>;

export default Toolbar;
