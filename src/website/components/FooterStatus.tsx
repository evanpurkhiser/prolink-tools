import {Activity} from 'react-feather';
import styled from '@emotion/styled';
import {observer} from 'mobx-react';

import {ConnectionState} from 'src/api/types';
import Tooltip from 'src/shared/components/tooltip';
import {AppStore} from 'src/shared/store';
import withStore from 'src/utils/withStore';

type Props = {store: AppStore};

const messages = {
  [ConnectionState.Offline]: 'Prolink Tools is not running',
  [ConnectionState.Connecting]: 'Establishing connection...',
  [ConnectionState.Connected]:
    'Connection established to an active Prolink Tools application.',
  [ConnectionState.Errored]:
    'Failed to connect to the Prolink tools application for an uknown reason',
  [ConnectionState.Outdated]:
    'The version of Prolink Tools is not supported by the API server. Upgrade to fix this.',
  [ConnectionState.Degraded]:
    'The version of Prolink Tools is not fully supported by the API server. Upgrade to access new API features!',
};

const FooterStatus = observer(({store}: Props) => (
  <Tooltip title={messages[store.cloudApiState.connectionState]}>
    <Indicator status={store.cloudApiState.connectionState}>
      <Activity size="12px" />
    </Indicator>
  </Tooltip>
));

const Indicator = styled('div')<{status: ConnectionState}>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 1.5rem;
  width: 1.5rem;
  border-radius: 50%;
  color: #fff;
  background: ${p => p.theme.apiState[p.status]};
  transition: background 200ms ease-in-out;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
`;

export default withStore(FooterStatus);
