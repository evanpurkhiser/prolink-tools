import 'regenerator-runtime/runtime';

import * as ReactDOM from 'react-dom';
import {Route, Router, Switch} from 'react-router-dom';
import {ThemeProvider} from '@emotion/react';
import {createBrowserHistory} from 'history';

import theme from 'src/theme';
import Landing from 'web/Landing';

// Create main element
const mainElement = document.createElement('div');
document.body.appendChild(mainElement);

const history = createBrowserHistory();

const Routes = () => (
  <ThemeProvider theme={theme.light}>
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
  </ThemeProvider>
);

// Render components
ReactDOM.render(<Routes />, mainElement);
