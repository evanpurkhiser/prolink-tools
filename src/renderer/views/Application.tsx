import {MemoryRouter, Redirect, Route, Switch} from 'react-router-dom';
import styled from '@emotion/styled';

import Footer from 'app/components/Footer';
import Titlebar from 'app/components/Titlebar';
import Devices from 'app/views/devices';
import OverlayConfig from 'app/views/overlayConfig';
import Settings from 'app/views/settings';

const Application = () => (
  <MemoryRouter>
    <Titlebar />
    <Frame>
      <Switch>
        <Redirect from="/" to="/status" exact />
        <Route path="/status" component={Devices} />
        <Route path="/overlay-config" component={OverlayConfig} />
        <Route path="/settings" component={Settings} />
      </Switch>
    </Frame>
    <Footer />
  </MemoryRouter>
);

const Frame = styled('main')`
  display: flex;
  flex-direction: column;
  background: #fff;
  flex-grow: 1;
`;

export default Application;
