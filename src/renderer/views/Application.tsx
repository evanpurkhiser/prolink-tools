import {MemoryRouter, Redirect, Route, Switch} from 'react-router-dom';
import styled from '@emotion/styled';

import Navigation from 'src/renderer/components/Navigation';
import Titlebar from 'ui/components/Titlebar';
import Devices from 'ui/views/devices';
import OverlayConfig from 'ui/views/overlayConfig';
import Settings from 'ui/views/settings';

const Application = () => (
  <MemoryRouter>
    <Frame>
      <Titlebar />
      <Navigation />
      <Content>
        <Switch>
          <Redirect from="/" to="/status" exact />
          <Route path="/status" component={Devices} />
          <Route path="/overlay-config" component={OverlayConfig} />
          <Route path="/settings" component={Settings} />
        </Switch>
      </Content>
    </Frame>
  </MemoryRouter>
);

const Frame = styled('div')`
  flex-grow: 1;
  height: 0;
  display: grid;
  grid-template-columns: max-content 1fr;
  grid-template-rows: max-content 1fr max-content;
  grid-template-areas:
    'header header'
    'nav main';

  > nav {
    grid-area: nav;
  }

  > header {
    grid-area: header;
  }
`;

const Content = styled('main')`
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: scroll;
`;

export default Application;
