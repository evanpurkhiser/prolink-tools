import 'regenerator-runtime/runtime';
import 'src/shared/sentry/web';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {io} from 'socket.io-client';

import Router from 'overlay/Router';
import {createStore} from 'src/shared/store';
import {registerWebsocketListener} from 'src/shared/store/client';
import {StoreContext} from 'src/shared/store/context';

const overlaysStore = createStore();

const mainElement = document.createElement('div');
document.body.appendChild(mainElement);

const main = (
  <StoreContext.Provider value={overlaysStore}>
    <Router />
  </StoreContext.Provider>
);

ReactDOM.render(main, mainElement);

registerWebsocketListener(overlaysStore, io());
