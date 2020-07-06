import 'regenerator-runtime/runtime';
import 'src/shared/sentry/web';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {when} from 'mobx';

import Application from 'app/views/Application';
import {registerRendererIpc, registerRendererConfigIpc} from 'src/shared/store/ipc';
import store from 'src/shared/store';

// Create main element
const mainElement = document.createElement('div');
document.body.appendChild(mainElement);

// Render components
ReactDOM.render(<Application />, mainElement);

registerRendererIpc();

when(
  () => store.isInitalized,
  () => registerRendererConfigIpc()
);
