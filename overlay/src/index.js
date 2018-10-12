import React from 'react';
import ReactDom from 'react-dom';
import { injectGlobal } from 'react-emotion';

import App from 'app/components/app';

injectGlobal`
  * {
    box-sizing: border-box;
  }

  body, #container {
    display: flex;
    height: 100vh;
    width: 100vw;
    margin: 0;
    color: #fff;
    font-family: Ubuntu, sans-serif;
    font-size: 1em;
    background: ${window.location.hash === '#debug' ? '#511' : 'none'}
  }
`;

ReactDom.render(<App />, document.getElementById('container'));
