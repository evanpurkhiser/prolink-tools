import * as React from 'react';
import styled from '@emotion/styled';
import {AlertTriangle} from 'react-feather';

const NotFound = () => (
  <Container>
    <AlertTriangle size="3rem" />
    <p>
      The configured overlay does not exist, or has been removed, in your prolink-tools
      overlay configuration.
    </p>
  </Container>
);

const Container = styled('div')`
  flex-grow: 1;
  background: rgba(255, 0, 0, 0.5);
  color: white;
  display: grid;
  grid-template-rows: max-content max-content;
  grid-gap: 1.5rem;
  align-content: center;
  justify-content: center;
  justify-items: center;
  text-align: center;

  p {
    margin: 0;
    max-width: 400px;
  }
`;

export default NotFound;
