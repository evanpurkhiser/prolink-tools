import * as React from 'react';
import {observer} from 'mobx-react';
import {DeviceType} from 'prolink-connect';
import styled from '@emotion/styled';

import {devices, states, localdbState} from 'src/shared/store';
import PlayState from 'app/components/PlayState';
import IconCdj from 'app/icons/cdj';

const Devices = observer(() => (
  <React.Fragment>
    {[...devices.values()]
      .filter(device => device.type === DeviceType.CDJ)
      .map(device => {
        const state = states.get(device.id);
        const fetching = localdbState.fetchProgress.get(device.id);

        return (
          <Device key={device.id}>
            <IconCdj />
            <StatusBar>
              <PlayerId>{device.id}</PlayerId>
              <PlayState playState={state?.playState} />
              <progress value={fetching?.read} max={fetching?.total} />
            </StatusBar>
          </Device>
        );
      })}
  </React.Fragment>
));

const Device = styled('div')`
  display: grid;
  grid-template-columns: max-content 1fr;
  grid-gap: 1rem;
  margin: 1rem;
`;

const StatusBar = styled('div')`
  display: inline-grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  grid-gap: 0.75rem;
  max-height: 22px;
`;

const PlayerId = styled('div')`
  font-size: 12px;
  font-weight: 700;
  background: #333;
  text-transform: uppercase;
  text-align: center;
  display: inline-grid;
  grid-template-columns: 1fr 22px;
  align-items: center;
  color: #fff;
  border-radius: 3px;
  overflow: hidden;

  &:before {
    content: 'player';
    display: block;
    background: #ebebeb;
    color: #333;
    padding: 0.25rem 0.5rem;
    border-radius: 3px 0 0 3px;
  }
`;

export default Devices;
