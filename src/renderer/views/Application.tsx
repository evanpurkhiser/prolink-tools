import * as React from 'react';
import {Global} from '@emotion/core';
import styled from '@emotion/styled';
import {MemoryRouter, Switch, Route, Redirect} from 'react-router-dom';

import globalCss from 'src/shared/globalCss';
import Titlebar from 'app/components/Titlebar';
import Devices from 'app/components/Devices';
import Version from 'app/components/Version';

const Application = () => (
  <MemoryRouter>
    <Global styles={globalCss} />
    <Titlebar />
    <Frame>
      <Switch>
        <Redirect from="/" to="/status" exact />
        <Route path="/status" component={Devices} />
        <Route path="/overlays">TESTING</Route>
      </Switch>
    </Frame>
    <Version />
  </MemoryRouter>
);

const Frame = styled('div')`
  background: #fff;
  flex-grow: 1;
`;

export default Application;
