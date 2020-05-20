import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {AppContainer} from 'react-hot-loader';

import Application from 'app/components/Application';
import {connectRenderer} from 'src/shared/store';

// Create main element
const mainElement = document.createElement('div');
document.body.appendChild(mainElement);

connectRenderer();

// Render components
ReactDOM.render(
  <AppContainer>
    <Application />
  </AppContainer>,
  mainElement
);
