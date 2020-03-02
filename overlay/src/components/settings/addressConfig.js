import { Flex, Box } from '@rebass/grid/emotion';
import { observer } from 'mobx-react';
import styled from '@emotion/styled';
import React from 'react';

import config from 'app/config';
import Label from 'app/components/settings/label';

const Input = styled('input')`
  display: block;
  width: 100%;
  background: #f9f9f9;
  color: #737386;
  border: 1px solid #d6d7dc;
  border-radius: 4px;
  padding: 10px 12px;
  font-weight: bold;
  font-size: 0.9em;
  transition: all 300ms;

  &:focus,
  &:hover {
    outline: none;
    color: #5c5a71;
    border-color: #a5aab9;
  }
`;

const AddressConfig = p => (
  <React.Fragment>
    <Label htmlFor="config_server_address">Prolink Server Address</Label>
    <Input
      type="text"
      id="config_server_address"
      value={config.serverAddress}
      onChange={e => (config.serverAddress = e.target.value)}
    />
  </React.Fragment>
);

export default observer(AddressConfig);
