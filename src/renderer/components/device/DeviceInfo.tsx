import * as React from 'react';
import styled from '@emotion/styled';
import {Device} from 'prolink-connect';

type Props = {
  device: Device;
  className?: string;
};

const DeviceInfo = ({device, className}: Props) => (
  <div className={className}>
    <DeviceName>{device.name}</DeviceName>
    <IPAddr>{device.ip.address}</IPAddr>
  </div>
);

const DeviceName = styled('div')`
  font-size: 0.6rem;
  font-weight: 600;
`;

const IPAddr = styled('div')`
  font-size: 0.55rem;
  color: #888;
`;

export default DeviceInfo;
