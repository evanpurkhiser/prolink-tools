import React from 'react';
import ReactDom from 'react-dom';
import * as Sentry from '@sentry/browser';

import App from 'app/components/app';

Sentry.init({
  dsn: 'https://f4f579e6703645e3bb3bc9cbd3f9b2fc@sentry.io/1300437',
  release: VERSION,
  environment: IS_PROD ? 'production' : 'development',
});

console.log('testing');
ReactDom.render(<App />, document.getElementById('container'));
