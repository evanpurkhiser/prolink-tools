import * as React from 'react';
import * as ReactDOM from 'react-dom';
import socketIOClient from 'socket.io-client';

import Overlay from 'overlay/overlay';
import {registerClientWebsocket} from 'src/shared/store/ipc';

// Create main element
const mainElement = document.createElement('div');
document.body.appendChild(mainElement);

// Render components
ReactDOM.render(<Overlay />, mainElement);

registerClientWebsocket(socketIOClient());
