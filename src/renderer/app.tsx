import 'regenerator-runtime/runtime';
import 'src/shared/sentry/web';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Global} from '@emotion/react';
import * as Sentry from '@sentry/browser';
import {when} from 'mobx';

import Application from 'app/views/Application';
import ThemeProvider from 'src/shared/components/ThemeProvider';
import globalCss, {noSelect} from 'src/shared/globalCss';
import store from 'src/shared/store';
import {registerRendererConfigIpc, registerRendererIpc} from 'src/shared/store/ipc';

// Create main element
const mainElement = document.createElement('div');
document.body.appendChild(mainElement);

const main = (
  <ThemeProvider>
    <Global styles={[globalCss, noSelect]} />
    <Application />
  </ThemeProvider>
);

ReactDOM.render(main, mainElement);

registerRendererIpc();

when(
  () => store.user !== undefined,
  () => Sentry.setUser(store.user!)
);

when(
  () => store.isInitalized,
  () => registerRendererConfigIpc()
);
