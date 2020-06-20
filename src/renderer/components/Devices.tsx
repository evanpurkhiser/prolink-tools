import * as React from 'react';
import {observer} from 'mobx-react';
import {DeviceType, NetworkState} from 'prolink-connect';
import styled from '@emotion/styled';

import store from 'src/shared/store';
import PlayState from 'app/components/PlayState';
import IconCdj from 'app/icons/cdj';
import BpmIndicator from './BpmIndicator';
import BeatCounter from './BeatCounter';
import DbStateIndicator from './DbStateIndicator';
import Metadata from './Metadata';
import ConnectingSplash from './ConnectingSplash';

const Devices = observer(() => (
  <React.Fragment>
    {store.networkState === NetworkState.Online && <ConnectingSplash />}
    {[...store.devices.values()]
      .filter(deviceStore => deviceStore.device.type === DeviceType.CDJ)
      .sort((a, b) => a.device.id - b.device.id)
      .map(deviceStore => {
        const {device, state} = deviceStore;

        return (
          <Device key={device.id}>
            <Indicator>
              <PlayerId onair={!!state?.isOnAir}>
                {device.id.toString().padStart(2, '0')}
              </PlayerId>
              <IconCdj />
            </Indicator>
            <Status>
              <StatusBar>
                <PlayState playState={state?.playState} />
                <BeatCounter deviceId={device.id} />
              </StatusBar>
              <StatusBar>
                <BpmIndicator pitch={state?.sliderPitch} bpm={state?.trackBPM} />
                <DbStateIndicator deviceId={device.id} />
                <Metadata deviceId={device.id} />
              </StatusBar>
            </Status>
          </Device>
        );
      })}
  </React.Fragment>
));

const Indicator = styled('div')`
  display: grid;
  grid-template-rows: 22px 48px;
  grid-gap: 0.5rem;
  padding-right: 0.5rem;
  border-right: 1px solid #eee;
  color: #3b434b;
`;

const Status = styled('div')`
  display: grid;
  grid-template-rows: 22px 48px;
  grid-gap: 0.5rem;
`;

const Device = styled('div')`
  color: #3b3b3b;
  display: grid;
  grid-template-columns: max-content 1fr;
  grid-gap: 0.5rem;
  padding: 1rem;
  border-bottom: 1px solid #eee;
`;

const StatusBar = styled('div')`
  display: inline-grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  grid-gap: 0.5rem;
`;

const PlayerId = styled('div')<{onair: boolean}>`
  font-size: 0.825rem;
  line-height: 22px;
  width: 34px;
  font-weight: 700;
  background: ${p => (p.onair ? '#ff5757' : '#3b434b')};
  text-align: center;
  align-items: center;
  color: #fff;
  border-radius: 3px;
  overflow: hidden;
`;

export default Devices;
