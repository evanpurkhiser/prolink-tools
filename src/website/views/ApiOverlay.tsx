import * as React from 'react';
import {RouteComponentProps} from 'react-router-dom';

import MapOverlay from 'src/overlay/components/MapOverlay';
import {StoreContext} from 'src/shared/store/context';

import {overlayAppKeyResolver, useWebsocketStore} from '../hooks/websocketStore';

type Props = RouteComponentProps<{overlayKey: string}>;

const ApiOverlay = ({match}: Props) => {
  const {overlayKey} = match.params;
  const store = useWebsocketStore(overlayAppKeyResolver(overlayKey));

  if (store === null) {
    return null;
  }

  return (
    <StoreContext.Provider value={store}>
      <MapOverlay {...{store, overlayKey}} />
    </StoreContext.Provider>
  );
};

export default ApiOverlay;
