import styled from '@emotion/styled';
import {AnimatePresence, motion} from 'framer-motion';
import {groupBy} from 'lodash';
import {observer} from 'mobx-react';
import {DeviceType, NetworkState} from 'prolink-connect/lib/types';

import ConnectingSplash from 'app/components/ConnectingSplash';
import BeatCounter from 'app/components/device/BeatCounter';
import BpmIndicator from 'app/components/device/BpmIndicator';
import DbStateIndicator from 'app/components/device/DbStateIndicator';
import DeviceInfo from 'app/components/device/DeviceInfo';
import Metadata from 'app/components/device/Metadata';
import PlayState from 'app/components/device/PlayState';
import IconCdj from 'app/icons/cdj';
import IconDjm from 'app/icons/djm';
import IconRekordbox from 'app/icons/rekordbox';
import ConnectionError from 'src/renderer/components/ConnectionError';
import store, {DeviceStore} from 'src/shared/store';

const sortById = (a: DeviceStore, b: DeviceStore) => a.device.id - b.device.id;

const Devices = observer(() => {
  const deviceList = [...store.devices.values()];
  const deviceMap = groupBy(deviceList, d => d.device.type);
  const otherDevices = [
    ...(deviceMap[DeviceType.Mixer] ?? []),
    ...(deviceMap[DeviceType.Rekordbox] ?? []),
  ];

  return (
    <AnimatePresence initial={false}>
      {(store.networkState === NetworkState.Online ||
        (store.networkState === NetworkState.Connected && deviceList.length === 0)) && (
        <ConnectingSplash key="splash" />
      )}
      {store.networkState === NetworkState.Failed && <ConnectionError key="error" />}
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
      <SmallDeviceList key="smallDevices">
        <AnimatePresence initial={false}>
          {otherDevices.map(({device}) => (
            <SmallDevice key={device.id}>
              {device.type === DeviceType.Mixer && <IconDjm />}
              {device.type === DeviceType.Rekordbox && <IconRekordbox />}
              <ConnectedTag>Connected</ConnectedTag>
              <DeviceInfo device={device} />
            </SmallDevice>
          ))}
        </AnimatePresence>
      </SmallDeviceList>
    </AnimatePresence>
  );
});

const Device = styled(motion.div)`
  display: grid;
  grid-template-columns: max-content 1fr;
  grid-gap: 0.5rem;
  padding: 1rem;
  border-bottom: 1px solid ${p => p.theme.border};
`;

Device.defaultProps = {
  layout: true,
  transition: {duration: 0.2},
  initial: {y: 10, opacity: 0},
  animate: {y: 0, opacity: 1},
  exit: {opacity: 0},
};

const Indicator = styled('div')`
  display: grid;
  grid-template-rows: 22px 48px;
  grid-gap: 0.5rem;
  padding-right: 0.5rem;
  border-right: 1px solid ${p => p.theme.border};
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

const SmallDeviceList = styled('div')`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  grid-gap: 2rem;
  padding: 1rem;
  border-bottom: 1px solid ${p => p.theme.border};

  &:empty {
    display: none;
  }
`;

const SmallDevice = styled(motion.div)`
  display: grid;
  grid-gap: 0.25rem 0.5rem;
  grid-template: 1fr max-content / repeat(2, max-content);
  align-items: center;

  > svg:first-of-type {
    grid-row: 1 / span 2;
  }
`;

SmallDevice.defaultProps = {
  transition: {duration: 0.2},
  initial: {x: 10, opacity: 0},
  animate: {x: 0, opacity: 1},
  exit: {opacity: 0},
};

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
