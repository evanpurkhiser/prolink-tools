import 'regenerator-runtime/runtime';
import 'src/shared/sentry/web';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import socketIOClient from 'socket.io-client';

import Router from 'overlay/Router';
import {registerClientWebsocket} from 'src/shared/store/ipc';

// Create main element
const mainElement = document.createElement('div');
document.body.appendChild(mainElement);

// Render components
ReactDOM.render(<Router />, mainElement);

registerClientWebsocket(socketIOClient());
