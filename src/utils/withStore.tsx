import * as React from 'react';

import {AppStore} from 'src/shared/store';
import {StoreContext} from 'src/shared/store/context';

type InjectedProps = {
  store: AppStore;
};

/**
 * HoC that provides the current Application Store from context
 */
const withStore = <P extends InjectedProps>(Component: React.ComponentType<P>) => (
  props: Pick<P, Exclude<keyof P, keyof InjectedProps>>
) => (
  <StoreContext.Consumer>
    {store => <Component {...(props as P)} store={store} />}
  </StoreContext.Consumer>
);

export default withStore;
