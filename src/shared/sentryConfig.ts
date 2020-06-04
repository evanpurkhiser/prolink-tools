import * as Sentry from '@sentry/node';
import '@sentry/apm';

import os from 'os';
import publicIp from 'public-ip';

const dsn = 'https://cda4b79937384c42bb3562e185dd0bb8@o126623.ingest.sentry.io/5262611';

async function setupSentry() {
  Sentry.init({
    dsn,
    release: process.env.RELEASE,
    environment: process.env.RELEASE_CHANNEL,
    sampleRate: 1,
    tracesSampleRate: 1,
  });

  Sentry.setUser({
    username: os.userInfo().username,
    ip_address: await publicIp.v4(),
  });
}

setupSentry();
