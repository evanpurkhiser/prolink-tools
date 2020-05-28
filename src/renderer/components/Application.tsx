import * as React from 'react';
import {Global, css} from '@emotion/core';

import Titlebar from 'app/components/titlebar';
import Devices from 'app/components/Devices';
import styled from '@emotion/styled';

const globalCss = css`
  html,
  body,
  body > div {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    min-height: 100%;
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

  :not(input):not(textarea),
  :not(input):not(textarea)::after,
  :not(input):not(textarea)::before {
    -webkit-user-select: none;
    user-select: none;
    cursor: default;
  }
  input,
  button,
  textarea,
  :focus {
    outline: none; // You should add some other style for :focus to help UX/a11y
  }
`;

const Application = () => (
  <React.Fragment>
    <Global styles={globalCss} />
    <Titlebar />
    <Frame>
      <Devices />
    </Frame>
  </React.Fragment>
);

const Frame = styled('div')`
  background: #fff;
  flex-grow: 1;
`;

export default Application;
