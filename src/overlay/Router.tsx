import {useEffect} from 'react';
import {BrowserRouter, Route, RouteComponentProps} from 'react-router-dom';
import {Global} from '@emotion/react';

import globalCss from 'src/shared/globalCss';
import {AppStore} from 'src/shared/store';
import withStore from 'src/utils/withStore';

import MapOverlay from './components/MapOverlay';
import {ensureNoOBSDefaultStyles} from './utils/obsFixes';

type Props = RouteComponentProps<{overlayKey: string}> & {
  store: AppStore;
};

const OverlayMapper: React.FC<Props> = ({match, store}) => (
  <MapOverlay store={store} overlayKey={match.params.overlayKey} />
);

const Router = () => {
  useEffect(ensureNoOBSDefaultStyles, []);

  return (
    <BrowserRouter>
      <Global styles={globalCss} />
      <Route path="/:overlayKey" component={withStore(OverlayMapper)} />
    </BrowserRouter>
  );
};

export default Router;
