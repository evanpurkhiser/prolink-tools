import * as React from 'react';
import {observer} from 'mobx-react';
import styled from '@emotion/styled';
import store from 'src/shared/store';

const OverlayList = observer(() => (
  <Container>
    {store.config.overlays.map(overlay => (
      <div key={overlay.key}>
        <input value={overlay.key} />
        <button onClick={() => store.config.overlays.remove(overlay)}>REMOVE</button>
      </div>
    ))}
  </Container>
));

const Container = styled('div')`
  user-select: text;
  display: grid;
  grid-auto-flow: row;
  grid-auto-rows: max-content;
  grid-gap: 1.5rem;
  padding: 1.5rem;
`;

export default OverlayList;
