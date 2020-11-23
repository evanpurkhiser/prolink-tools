import * as React from 'react';
import styled from '@emotion/styled';
import {MemoryRouter, Switch, Route, Redirect} from 'react-router-dom';

import Titlebar from 'app/components/Titlebar';
import Footer from 'app/components/Footer';
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

const Frame = styled('div')`
  display: flex;
  flex-direction: column;
  background: #fff;
  flex-grow: 1;
`;

export default Application;
