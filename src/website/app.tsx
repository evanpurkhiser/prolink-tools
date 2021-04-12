import 'regenerator-runtime/runtime';

import * as ReactDOM from 'react-dom';
import {Route, Router, Switch} from 'react-router-dom';
import {Global} from '@emotion/react';
import {ThemeProvider} from '@emotion/react';
import {createBrowserHistory} from 'history';

import globalCss from 'src/shared/globalCss';
import theme from 'src/theme';

import ApiOverlay from './views/ApiOverlay';
import AppContainer from './views/AppContainer';
import Landing from './views/Landing';
import OAuthCallback from './views/OAuthCallback';

// Create main element
const mainElement = document.createElement('div');
document.body.appendChild(mainElement);

const history = createBrowserHistory();

const Routes = () => (
  <ThemeProvider theme={theme.light}>
    <Global styles={globalCss} />
    <Router history={history}>
      <Switch>
        <Route exact path="/" component={Landing} />
        <Route exact path="/overlay/:overlayKey" component={ApiOverlay} />
        <Route path="/app/:appKey" component={AppContainer} />
        <Route path="/oauth-callback" component={OAuthCallback} />
      </Switch>
    </Router>
  </ThemeProvider>
);

// Render components
ReactDOM.render(<Routes />, mainElement);
