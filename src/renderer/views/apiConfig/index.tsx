import * as React from 'react';
import styled from '@emotion/styled';
import {observer} from 'mobx-react';

import Field from 'src/renderer/components/form/Field';
import Text from 'src/renderer/components/form/Text';
import {AppStore} from 'src/shared/store';
import {apiBaseUrl} from 'src/utils/urls';
import withStore from 'src/utils/withStore';

import ConnectionStatus from './components/ConnectionStatus';

type Props = {
  store: AppStore;
};

const ApiConfig = observer(({store}: Props) => {
  const url = `${apiBaseUrl}/now-playing/${store.appKey}`;

  return (
    <React.Fragment>
      <ConnectionStatus />
      <Section>
        <Field
          size="full"
          name="Now-Playing URL"
          description="This unique URL provides the currently playing track as a plain-text response. You may choose to use this with chat-bot services"
        >
          <Text disabled value={url} />
        </Field>
      </Section>
    </React.Fragment>
  );
});

const Section = styled('section')`
  margin: 1rem;
`;

export default withStore(ApiConfig);
