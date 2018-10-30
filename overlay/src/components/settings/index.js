import { Flex, Box } from '@rebass/grid/emotion';
import { observer } from 'mobx-react';
import styled from 'react-emotion';
import React from 'react';

import tracks from 'app/trackEvents';
import ConnectedStatus from 'app/components/settings/connectedStatus';
import AddressConfig from 'app/components/settings/addressConfig';
import ExampleButton from 'app/components/settings/exampleButton';
import HistoryConfig from 'app/components/settings/historyConfig';

let Settings = p => (
  <div {...p} ref={p.hostRef}>
    <ConnectedStatus />
    <AddressConfig />
    <HistoryConfig />

    <ExampleButton />
  </div>
);

Settings = styled(Settings)`
  font-size: 0.8em;
  width: 260px;
  padding: 14px;
  background: #fff;
  border-radius: 4px;
  opacity: 0;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.2);
  transition: opacity 400ms;
  line-height: 1.3;
  color: #737386;

  body:hover & {
    opacity: 1;
  }
`;

export default Settings;
