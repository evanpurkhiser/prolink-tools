import {RouteComponentProps} from 'react-router-dom';
import styled from '@emotion/styled';

import {StoreContext} from 'src/shared/store/context';
import FooterLogo from 'web/components/FooterLogo';
import FooterStatus from 'web/components/FooterStatus';
import {simpleAppKeyResolver, useWebsocketStore} from 'web/hooks/websocketStore';

type Props = React.PropsWithChildren<Record<string, never>> &
  RouteComponentProps<{
    appKey: string;
  }>;

const AppContainer = ({match, children}: Props) => {
  const {appKey} = match.params;

  const [store] = useWebsocketStore(simpleAppKeyResolver(appKey));

  if (store === null) {
    return <div> TODO Connecting logo ..... </div>;
  }

  return (
    <StoreContext.Provider value={store}>
      <Content>{children}</Content>
      <Footer>
        <FooterLogo />
        <FooterStatus />
      </Footer>
    </StoreContext.Provider>
  );
};

const Content = styled('div')`
  display: flex;
  flex-grow: 1;
  padding-top: 1.5rem;
`;

const Footer = styled('div')`
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
