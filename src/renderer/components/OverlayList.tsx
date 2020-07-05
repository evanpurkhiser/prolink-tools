import * as React from 'react';
import {observer} from 'mobx-react';
import styled from '@emotion/styled';
import store from 'src/shared/store';

const OverlayList = observer(() => (
  <Container>
    {store.config.overlays.map(overlay => (
      <input key={overlay.key} value={overlay.key} />
    ))}
  </Container>
));

const Container = styled('div')`
  user-select: text;
`;

export default OverlayList;
