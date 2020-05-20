import * as React from 'react';
import {hot} from 'react-hot-loader/root';
import {Global, css} from '@emotion/core';

import Titlebar from 'app/components/titlebar';
import Devices from 'app/components/Devices';

const globalCss = css`
  html,
  body {
    margin: 0;
    padding: 0;
  }

  * {
    box-sizing: border-box;
  }

  :root {
    font-size: 16px;
    font-family: 'SF Mono';
  }
`;

const Application = () => (
  <div>
    <Global styles={globalCss} />
    <Titlebar />
    <Devices />
  </div>
);

export default hot(Application);
