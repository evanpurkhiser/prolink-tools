import '@sentry/apm';

import * as Sentry from '@sentry/browser';
import {User} from '@sentry/browser';

import {dsn} from './dsn';

Sentry.init({
  dsn,
  release: process.env.RELEASE,
  environment: process.env.RELEASE_CHANNEL,
  sampleRate: 1,
  tracesSampleRate: 1,
  autoSessionTracking: true,
});
