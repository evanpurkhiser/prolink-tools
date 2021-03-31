import '@sentry/apm';

import * as Sentry from '@sentry/electron';

import {dsn} from './dsn';

Sentry.init({
  dsn,
  release: process.env.RELEASE,
  environment: process.env.RELEASE_CHANNEL,
  sampleRate: 1,
  tracesSampleRate: 0.25,
  autoSessionTracking: true,
});

Sentry.setTag('service', 'renderer');
