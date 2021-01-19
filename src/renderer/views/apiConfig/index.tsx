import * as React from 'react';
import {observer} from 'mobx-react';

import {apiHost} from 'src/shared/api/url';
import {AppStore} from 'src/shared/store';
import withStore from 'src/utils/withStore';

type Props = {
  store: AppStore;
};

const ApiConfig = observer(({store}: Props) => {
  const url = `${apiHost}/now-playing/${store.appKey}`;

  return (
    <React.Fragment>
      <p>
        Nowplaying URL: <a href={url}>{url}</a>
      </p>
    </React.Fragment>
  );
});

export default withStore(ApiConfig);
