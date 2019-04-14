import { injectGlobal } from 'react-emotion';
import React from 'react';
import ReactDom from 'react-dom';
import * as Sentry from '@sentry/browser';

import App from 'app/components/app';

Sentry.init({
  dsn: 'https://f4f579e6703645e3bb3bc9cbd3f9b2fc@sentry.io/1300437',
  release: VERSION,
  environment: IS_PROD ? 'production' : 'development',
});

injectGlobal`
  * {
    box-sizing: border-box;
  }

  body, #container {
    display: flex;
    height: 100vh;
    width: 100vw;
    margin: 0;
    color: #fff;
    font-family: Ubuntu, sans-serif;
    font-size: 1em;
  }
`;

ReactDom.render(<App />, document.getElementById('container'));
