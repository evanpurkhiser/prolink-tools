import * as Sentry from '@sentry/electron';
import '@sentry/apm';

import publicIp from 'public-ip';

async function setupSentry() {
  Sentry.init({
    dsn: 'https://cda4b79937384c42bb3562e185dd0bb8@o126623.ingest.sentry.io/5262611',
  });
  Sentry.setUser({ip_address: await publicIp.v4()});
}

setupSentry();
