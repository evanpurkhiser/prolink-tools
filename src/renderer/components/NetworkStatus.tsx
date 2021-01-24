import styled from '@emotion/styled';
import {observer} from 'mobx-react';
import {NetworkState} from 'prolink-connect/lib/types';

import {AppStore} from 'src/shared/store';
import withStore from 'src/utils/withStore';

const status = {
  [NetworkState.Offline]: {label: 'offline'},
  [NetworkState.Online]: {label: 'connecting...'},
  [NetworkState.Connected]: {label: 'connected'},
  [NetworkState.Failed]: {label: 'connection error'},
};

type Props = {
  store: AppStore;
};

const NetworkStatus = observer(({store}: Props) => (
  <StatusIndicator state={store.networkState}>
    {status[store.networkState].label}
  </StatusIndicator>
));

const StatusIndicator = styled('div')<{state: NetworkState}>`
  background: ${p => p.theme.networkState[p.state].bg};
  color: ${p => p.theme.networkState[p.state].text ?? p.theme.darkText};
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  font-size: 0.625rem;
  text-transform: uppercase;
  border-radius: 4px;
`;

export default withStore(NetworkStatus);
