import * as React from 'react';
import {observer} from 'mobx-react';
import styled from '@emotion/styled';
import {groupBy} from 'lodash';
import {DeviceType, NetworkState} from 'prolink-connect/lib/types';

import store, {DeviceStore} from 'src/shared/store';
import IconCdj from 'app/icons/cdj';
import IconDjm from 'app/icons/djm';
import IconRekordbox from 'app/icons/rekordbox';
import PlayState from 'app/components/device/PlayState';
import BpmIndicator from 'app/components/device/BpmIndicator';
import BeatCounter from 'app/components/device/BeatCounter';
import DbStateIndicator from 'app/components/device/DbStateIndicator';
import Metadata from 'app/components/device/Metadata';
import ConnectingSplash from 'app/components/ConnectingSplash';
import ConnectionError from 'src/renderer/components/ConnectionError';
import DeviceInfo from 'app/components/device/DeviceInfo';

const sortById = (a: DeviceStore, b: DeviceStore) => a.device.id - b.device.id;

const Devices = observer(() => {
  const deviceMap = groupBy([...store.devices.values()], d => d.device.type);
  const otherDevices = [
    ...(deviceMap[DeviceType.Mixer] ?? []),
    ...(deviceMap[DeviceType.Rekordbox] ?? []),
  ];

  return (
    <React.Fragment>
      {store.networkState === NetworkState.Online && <ConnectingSplash />}
      {store.networkState === NetworkState.Failed && <ConnectionError />}
      {deviceMap[DeviceType.CDJ]?.sort(sortById).map(deviceStore => {
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
              <TopBar>
                <StatusBar>
                  <PlayState playState={state?.playState} />
                  <BeatCounter deviceId={device.id} />
                </StatusBar>
                <DeviceInfo device={device} />
              </TopBar>
              <StatusBar>
                <BpmIndicator pitch={state?.sliderPitch} bpm={state?.trackBPM} />
                <DbStateIndicator deviceId={device.id} />
                <Metadata deviceId={device.id} />
              </StatusBar>
            </Status>
          </Device>
        );
      })}
      <SmallDeviceList>
        {otherDevices.map(({device}) => (
          <SmallDevice key={device.id}>
            {device.type === DeviceType.Mixer && <IconDjm />}
            {device.type === DeviceType.Rekordbox && <IconRekordbox />}
            <ConnectedTag>Connected</ConnectedTag>
            <DeviceInfo device={device} />
          </SmallDevice>
        ))}
      </SmallDeviceList>
    </React.Fragment>
  );
});

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

const TopBar = styled('div')`
  display: grid;
  grid-template-columns: 1fr max-content;
  grid-gap: 0.5rem;
`;

const StatusBar = styled('div')`
  display: inline-grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
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

const SmallDeviceList = styled('div')`
  color: #3b3b3b;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  grid-gap: 2rem;
  padding: 1rem;
  border-bottom: 1px solid #eee;

  &:empty {
    display: none;
  }
`;

const SmallDevice = styled('div')`
  display: grid;
  grid-gap: 0.25rem 0.5rem;
  grid-template: 1fr max-content / repeat(2, max-content);
  align-items: center;

  > svg:first-of-type {
    grid-row: 1 / span 2;
  }
`;

const ConnectedTag = styled('div')`
  text-transform: uppercase;
  font-size: 0.7rem;
  font-weight: 600;
  display: grid;
  grid-template-columns: max-content 1fr;
  grid-gap: 0.25rem;
  align-items: center;

  &:before {
    content: '';
    display: block;
    height: 0.5rem;
    width: 0.5rem;
    border-radius: 50%;
    background: #f84b4b;
  }
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
