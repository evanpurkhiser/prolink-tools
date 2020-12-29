import * as React from 'react';
import {BrowserRouter, Route, RouteComponentProps} from 'react-router-dom';
import {Global} from '@emotion/react';
import {observer} from 'mobx-react';

import globalCss from 'src/shared/globalCss';
import store from 'src/shared/store';

import NotFound from './components/NotFound';
import {ensureNoOBSDefaultStyles} from './utils/obsFixes';
import {registeredOverlays} from '.';

type Props = RouteComponentProps<{overlayKey: string}>;

const MapOverlay: React.FC<Props> = observer(props => {
  if (!store.isInitalized) {
    return null;
  }

  const overlayKey = props.match.params.overlayKey;
  const instance = store.config.overlays.find(i => i.key === overlayKey);
  const descriptor = registeredOverlays?.find(overlay => overlay.type === instance?.type);

  if (instance === undefined || descriptor === undefined) {
    return <NotFound />;
  }

  return <descriptor.component config={instance.config} />;
});

const Router = () => {
  React.useEffect(ensureNoOBSDefaultStyles, []);

  return (
    <BrowserRouter>
      <Global styles={globalCss} />
      <Route path="/:overlayKey" component={MapOverlay} />
    </BrowserRouter>
  );
};

export default Router;
