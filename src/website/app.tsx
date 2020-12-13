import 'regenerator-runtime/runtime';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Route, Router, Switch} from 'react-router-dom';
import {createBrowserHistory} from 'history';

import Landing from 'web/Landing';

// Create main element
const mainElement = document.createElement('div');
document.body.appendChild(mainElement);

const history = createBrowserHistory();

const Routes = () => (
  <Router history={history}>
    <Switch>
      <Route
        exact
        path={['/manual', '/manaul']}
        component={() => {
          window.location.assign(
            'https://www.notion.so/Prolink-Tools-User-Manual-1c0e5b28732b435a9804b992939ed791'
          );
          return null;
        }}
      />
      <Route component={Landing} />
    </Switch>
  </Router>
);

// Render components
ReactDOM.render(<Routes />, mainElement);
