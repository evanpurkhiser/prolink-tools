import {Route, RouteComponentProps} from 'react-router-dom';
import styled from '@emotion/styled';

import {StoreContext} from 'src/shared/store/context';
import FooterLogo from 'web/components/FooterLogo';
import FooterStatus from 'web/components/FooterStatus';
import {simpleAppKeyResolver, useWebsocketStore} from 'web/hooks/websocketStore';

import {OAuthAuthorize, OAuthConnect} from './OAuth';

type Props = RouteComponentProps<{
  appKey: string;
}>;

const AppContainer = ({match}: Props) => {
  const {appKey} = match.params;

  const [store, appSocket] = useWebsocketStore(simpleAppKeyResolver(appKey));

  // Connection to the server will usually happen immediately
  if (store === null || appSocket === null) {
    return null;
  }

  return (
    <StoreContext.Provider value={store}>
      <Content>
        <Route
          path={`${match.path}/oauth/connect`}
          render={props => <OAuthConnect {...props} {...{store, appSocket}} />}
        />
        <Route
          path={`${match.path}/oauth/authorize`}
          render={props => <OAuthAuthorize {...props} {...{store, appSocket}} />}
        />
      </Content>
      <Footer>
        <FooterLogo />
        <FooterStatus />
      </Footer>
    </StoreContext.Provider>
  );
};

const Content = styled('main')`
  font-family: Ubuntu;
  display: flex;
  justify-content: center;
  flex-grow: 1;
  padding-top: 1.5rem;
`;

const Footer = styled('footer')`
  display: grid;
  grid-template-columns: 1fr max-content;
  flex-shrink: 1;
  padding: 1.5rem;
  align-items: center;
  justify-content: center;
  justify-items: center;
  padding-left: calc(1.5rem + 1.5rem);
`;

export default AppContainer;
