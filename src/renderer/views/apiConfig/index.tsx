import * as React from 'react';
import styled from '@emotion/styled';
import {observer} from 'mobx-react';

import Field from 'src/renderer/components/form/Field';
import Text from 'src/renderer/components/form/Text';
import {apiHost} from 'src/shared/api/url';
import {AppStore} from 'src/shared/store';
import withStore from 'src/utils/withStore';

type Props = {
  store: AppStore;
};

const ApiConfig = observer(({store}: Props) => {
  const url = `${apiHost}/now-playing/${store.appKey}`;

  return (
    <Section>
      <State>
        <div>Connection State: {store.cloudApiState.connectionState}</div>
        <div>API Version: {store.cloudApiState.version}</div>
      </State>
      <Field
        size="full"
        name="Now-Playing URL"
        description="This unique URL provides the currently playing track as a plain-text response. You may choose to use this with chat-bot services"
      >
        <Text disabled value={url} />
      </Field>
    </Section>
  );
});

const Section = styled('section')`
  margin: 1rem;
`;

const State = styled('section')`
  font-family: Ubuntu;
`;

export default withStore(ApiConfig);
