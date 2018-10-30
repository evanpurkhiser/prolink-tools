import { Flex, Box } from '@rebass/grid/emotion';
import { observer } from 'mobx-react';
import styled from 'react-emotion';
import React from 'react';
import Slider from 'react-rangeslider';

import config from 'app/config';
import Label from 'app/components/settings/label';

const HistorySlider = styled(Slider)`
  display: flex;
  align-items: center;
  background: #dcdcdc;
  height: 3px;
  border-radius: 2px;
  margin: 14px 0 24px 0;
  position: relative;

  .rangeslider__fill {
    position: absolute;
    top: 0;
    height: 100%;
    background: #a5aab9;
  }

  .rangeslider__handle {
    position: relative;
    display: block;
    height: 16px;
    width: 8px;
    background: #f9f9f9;
    border: 1px solid #d6d7dc;
    border-radius: 2px;

    &:focus {
      outline: none;
    }
  }
`;

const CutoffLabel = styled('div')`
  font-weight: bold;
  margin-top: 14px;
`;

const HistoryConfig = p => (
  <React.Fragment>
    <Flex justifyContent="space-between">
      <Label>History Items Shown</Label>
      <CutoffLabel>{config.historyCutoff} tracks</CutoffLabel>
    </Flex>
    <HistorySlider
      min={0}
      max={10}
      tooltip={false}
      value={config.historyCutoff}
      onChange={value => (config.historyCutoff = value)}
    />
  </React.Fragment>
);

export default observer(HistoryConfig);
