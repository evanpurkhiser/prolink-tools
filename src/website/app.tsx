import * as React from 'react';
import * as ReactDOM from 'react-dom';

import Landing from 'web/Landing';

// Create main element
const mainElement = document.createElement('div');
document.body.appendChild(mainElement);

// Render components
ReactDOM.render(<Landing />, mainElement);
