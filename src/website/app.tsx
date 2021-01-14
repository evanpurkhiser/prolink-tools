import 'regenerator-runtime/runtime';

import * as ReactDOM from 'react-dom';
import {Route, Router, Switch} from 'react-router-dom';
import {Global} from '@emotion/react';
import {ThemeProvider} from '@emotion/react';
import {createBrowserHistory} from 'history';
import {set} from 'mobx';
import {Observer} from 'mobx-react';
import {deserialize} from 'serializr';
import {io} from 'socket.io-client';

import {createApiStore} from 'src/api/apiStore';
import ThemeModern from 'src/overlay/overlays/nowPlaying/ThemeModern';
import globalCss from 'src/shared/globalCss';
import {AppConfig} from 'src/shared/store';
import {applyChanges, SerializedChange} from 'src/shared/store/ipc';
import theme from 'src/theme';
import Landing from 'web/Landing';

// Create main element
const mainElement = document.createElement('div');
document.body.appendChild(mainElement);

const history = createBrowserHistory();

const webApiStore = createApiStore();

const Routes = () => (
  <ThemeProvider theme={theme.light}>
    <Router history={history}>
      <Switch>
        <Route exact path="/" component={Landing} />
        <Route exact path="/global-now-playing">
          <Global styles={globalCss} />
          <Observer>
            {() => {
              const NowPlaying = ThemeModern.component;

              return (
                <div>
                  <h1>Number of clients: {webApiStore.clientCount}</h1>

                  <h3>Last track played anywhere</h3>
                  <NowPlaying
                    history={[webApiStore.lastPlayedTrack!].filter(v => v !== null)}
                    appConfig={new AppConfig()}
                    config={{theme: 'tracklist'}}
                  />
                </div>
              );
            }}
          </Observer>
        </Route>
      </Switch>
    </Router>
  </ThemeProvider>
);

const ws = io('https://api.prolink.tools/');

ws.on('api-store-update', (change: SerializedChange) =>
  applyChanges(webApiStore, change)
);
ws.on('api-store-init', (data: any) =>
  set(webApiStore, deserialize(webApiStore.constructor as any, data))
);

// Render components
ReactDOM.render(<Routes />, mainElement);
