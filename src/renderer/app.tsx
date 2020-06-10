import * as React from 'react';
import * as ReactDOM from 'react-dom';

import Application from 'app/components/Application';
import {registerRendererIpc} from 'src/shared/store/ipc';

// Create main element
const mainElement = document.createElement('div');
document.body.appendChild(mainElement);

// Render components
ReactDOM.render(<Application />, mainElement);

registerRendererIpc();
