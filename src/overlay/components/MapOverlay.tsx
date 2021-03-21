import * as React from 'react';
import styled from '@emotion/styled';
import {observer} from 'mobx-react';

import {registeredOverlays} from 'overlay';
import NotFound from 'overlay/components/NotFound';
import {AppStore} from 'src/shared/store';

type Props = {
  store: AppStore;
  overlayKey: string;
};

const MapOverlay: React.FC<Props> = observer(({store, overlayKey}) => {
  if (!store.isInitalized) {
    return null;
  }

  const instance = store.config.overlays.find(i => i.key === overlayKey);
  const descriptor = registeredOverlays?.find(overlay => overlay.type === instance?.type);

  if (instance === undefined || descriptor === undefined) {
    return <NotFound />;
  }

  return (
    <Container>
      <descriptor.component config={instance.config} />
    </Container>
  );
});

const Container = styled('div')`
  overflow: hidden;
`;

export default MapOverlay;
