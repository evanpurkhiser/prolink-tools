import * as React from 'react';
import {Global} from '@emotion/core';
import {Route, BrowserRouter, RouteComponentProps} from 'react-router-dom';
import {observer} from 'mobx-react';

import store from 'src/shared/store';
import globalCss from 'src/shared/globalCss';
import NotFound from './components/NotFound';
import {registeredOverlays} from '.';

type Props = RouteComponentProps<{overlayKey: string}>;

const MapOverlay: React.FC<Props> = observer(props => {
  const overlayKey = props.match.params.overlayKey;
  const instance = store.config.overlays.find(i => i.key === overlayKey);
  const descriptor = registeredOverlays?.find(overlay => overlay.type === instance?.type);

  if (instance === undefined || descriptor === undefined) {
    return <NotFound />;
  }

  return <descriptor.component config={instance.config} />;
});

const Router = () => (
  <BrowserRouter>
    <Global styles={globalCss} />
    <Route path="/:overlayKey" component={MapOverlay} />
  </BrowserRouter>
);

export default Router;
