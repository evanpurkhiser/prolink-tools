import * as React from 'react';
import {RouteComponentProps} from 'react-router-dom';
import {Observer} from 'mobx-react';
import {io} from 'socket.io-client';

import MapOverlay from 'src/overlay/components/MapOverlay';
import {connectToAppStore} from 'src/shared/api/client';
import {apiHost} from 'src/shared/api/url';
import {AppStore} from 'src/shared/store';

type Props = RouteComponentProps<{overlayKey: string}>;

const ApiOverlay = ({match}: Props) => {
  const {overlayKey} = match.params;
  const [store, setStore] = React.useState<AppStore | null>(null);

  const connectStore = async () => {
    const ws = io(apiHost);

    const appKey = await new Promise<string>(resolve =>
      ws.emit('appKey:by-overlay-key', overlayKey, resolve)
    );
    setStore(connectToAppStore(appKey));
  };

  React.useEffect(() => {
    connectStore();
  }, []);

  if (store === null) {
    return null;
  }

  return <Observer>{() => store && <MapOverlay {...{store, overlayKey}} />}</Observer>;
};

export default ApiOverlay;
