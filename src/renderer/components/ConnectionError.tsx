import * as React from 'react';
import {AlertCircle} from 'react-feather';
import styled from '@emotion/styled';

const ConnectionError = () => (
  <Container>
    <Text>
      <AlertCircle /> Unable to connect to PROLINK network
    </Text>
    <Help>
      <p>
        Cannot open a connection to the PROLINK network. <br />
        This is likely because...
      </p>
      <ul>
        <li>
          You are <strong>running Rekordbox on this computer</strong>. Due to inherit
          limitations in how the PROLINK network operates, this software and rekordbox my
          not run on the same computer.
        </li>
        <li>
          Another piece of software on your computer is using any ports between 50000 and
          50002.
        </li>
      </ul>
    </Help>
  </Container>
);

const Container = styled('div')`
  display: flex;
  align-self: center;
  justify-content: center;
  padding: 2rem;
  flex-grow: 1;
  flex-direction: column;
  max-width: 500px;
`;

const Text = styled('div')`
  display: flex;
  gap: 1rem;
  align-items: center;
  font-size: 0.8rem;
  text-transform: uppercase;
  font-weight: 500;
  padding: 0.5rem 0.75rem;
  border-radius: 3px;
  border: 1px solid #f95757;
  color: #f95757;
`;

const Help = styled('div')`
  font-family: Ubuntu;
  font-size: 0.8rem;
  color: #444;
  line-height: 1.4;
  margin-top: 1rem;
`;

export default ConnectionError;
