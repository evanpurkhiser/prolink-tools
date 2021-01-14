import 'regenerator-runtime/runtime';
import 'src/shared/sentry/web';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Global} from '@emotion/react';
import * as Sentry from '@sentry/browser';
import {when} from 'mobx';

import ThemeProvider from 'src/shared/components/ThemeProvider';
import globalCss, {noSelect} from 'src/shared/globalCss';
import {createStore} from 'src/shared/store';
import {registerRendererConfigIpc, registerRendererIpc} from 'src/shared/store/client';
import {StoreContext} from 'src/shared/store/context';
import Application from 'ui/views/Application';

const mainElement = document.createElement('div');
document.body.appendChild(mainElement);

const rendererStore = createStore();

const main = (
  <StoreContext.Provider value={rendererStore}>
    <ThemeProvider>
      <Global styles={[globalCss, noSelect]} />
      <Application />
    </ThemeProvider>
  </StoreContext.Provider>
);

ReactDOM.render(main, mainElement);

registerRendererIpc(rendererStore);

when(
  () => rendererStore.user !== undefined,
  () => Sentry.setUser(rendererStore.user!)
);

when(
  () => rendererStore.isInitalized,
  () => registerRendererConfigIpc(rendererStore)
);
