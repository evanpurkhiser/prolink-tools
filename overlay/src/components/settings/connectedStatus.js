import { Flex } from '@rebass/grid/emotion';
import { observer } from 'mobx-react';
import styled from 'react-emotion';
import React from 'react';

import { Activity, AlertCircle } from 'app/components/icons';
import { connected } from 'app/receiver';

const StatusIcon = styled(
  p => (connected.get() ? <Activity {...p} /> : <AlertCircle {...p} />)
)`
  margin-right: 0.6em;
`;

const ConnectionWarning = styled(p => (
  <div className={p.className}>
    Check that your prolink-server address is configured correctly and that
    you're prolink-server is running, and is accessible by the computer viewing
    this page.
  </div>
))`
  margin: 0 -14px;
  font-size: 0.9em;
  padding: 14px;
  color: #695b37;
  background: #ffdd59;
`;

const colorMap = {
  [null]: '#ffdd59',
  [true]: '#56c534',
  [false]: '#ff4949',
};

const messages = {
  [null]: 'Establishing connection...',
  [true]: 'Prolink Server Connected',
  [false]: 'Prolink Server Connection Failed',
};

const StatusIndicator = styled('div')`
  color: #fff;
  margin: -14px -14px 0;
  padding: 14px;
  background: ${p => colorMap[connected.get()]};
  display: flex;
  align-items: center;
  font-weight: bold;
  border-radius: 4px 4px 0 0;
`;

const ConnectedStatus = p => (
  <div>
    <StatusIndicator>
      <StatusIcon size="1.4em" />
      {messages[connected.get()]}
    </StatusIndicator>
    {connected.get() === false && <ConnectionWarning />}
  </div>
);

export default observer(ConnectedStatus);
