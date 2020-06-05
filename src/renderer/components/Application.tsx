import * as React from 'react';
import {Global, css} from '@emotion/core';
import styled from '@emotion/styled';

import globalCss from 'app/globalCss';
import Titlebar from 'app/components/Titlebar';
import Devices from 'app/components/Devices';
import Version from 'app/components/Version';

const Application = () => (
  <React.Fragment>
    <Global styles={globalCss} />
    <Titlebar />
    <Frame>
      <Devices />
    </Frame>
    <Version />
  </React.Fragment>
);

const Frame = styled('div')`
  background: #fff;
  flex-grow: 1;
`;

export default Application;
