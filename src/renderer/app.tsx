import 'regenerator-runtime/runtime';

import {render} from 'react-dom';
import {Global} from '@emotion/react';
import * as Sentry from '@sentry/electron';
import {Mutex} from 'async-mutex';
import {when} from 'mobx';

import ThemeProvider from 'src/shared/components/ThemeProvider';
import globalCss, {background, noSelect} from 'src/shared/globalCss';
import {createAppStore} from 'src/shared/store';
import {registerRendererConfigIpc, registerRendererIpc} from 'src/shared/store/client';
import {StoreContext} from 'src/shared/store/context';
import Application from 'ui/views/Application';

const mainElement = document.createElement('div');
document.body.appendChild(mainElement);

const rendererStore = createAppStore();

const main = (
  <StoreContext.Provider value={rendererStore}>
    <ThemeProvider>
      <Global styles={[globalCss, noSelect, background]} />
      <Application />
    </ThemeProvider>
  </StoreContext.Provider>
);

render(main, mainElement);

const configLock = new Mutex();
registerRendererIpc(rendererStore, configLock);

when(
  () => rendererStore.user !== undefined,
  () => Sentry.setUser(rendererStore.user!)
);

when(
  () => rendererStore.isInitalized,
  () => registerRendererConfigIpc(rendererStore, configLock)
);
