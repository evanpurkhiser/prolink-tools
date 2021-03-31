import styled from '@emotion/styled';
import {observer} from 'mobx-react';

import {ConnectionState} from 'src/api/types';
import {AppStore} from 'src/shared/store';
import withStore from 'src/utils/withStore';

type Props = {
  store: AppStore;
};

const ConnectionStatus = withStore(
  observer(({store}: Props) => (
    <Container>
      <div>Connection State: {store.cloudApiState.connectionState}</div>
      <div>API Version: {store.cloudApiState.version}</div>
      <div>Latency: {store.cloudApiState.latency.toFixed(1)}ms</div>
    </Container>
  ))
);

const colors = {
  [ConnectionState.Offline]: 'red',
  [ConnectionState.Connecting]: 'red',
  [ConnectionState.Connected]: 'red',
  [ConnectionState.Errored]: 'red',
  [ConnectionState.Degraded]: 'red',
  [ConnectionState.Outdated]: 'red',
};

const Container = styled('section')`
  font-family: Ubuntu;
  padding: 1rem 2rem;
  background: #eee;
`;

export default ConnectionStatus;
