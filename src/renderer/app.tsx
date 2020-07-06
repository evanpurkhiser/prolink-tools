import 'regenerator-runtime/runtime';
import 'src/shared/sentry/web';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import Application from 'app/views/Application';
import {registerRendererIpc, registerRendererConfigIpc} from 'src/shared/store/ipc';

// Create main element
const mainElement = document.createElement('div');
document.body.appendChild(mainElement);

// Render components
ReactDOM.render(<Application />, mainElement);

registerRendererIpc();

// Wait to listen on the config object, when we hydrate the local store it will
// be overwritten.
setTimeout(() => registerRendererConfigIpc(), 100);
