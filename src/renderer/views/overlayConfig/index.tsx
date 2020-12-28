import * as React from 'react';
import {ArrowLeft, Plus} from 'react-feather';
import styled from '@emotion/styled';
import {AnimatePresence} from 'framer-motion';
import {observer} from 'mobx-react';

import ActionButton from 'src/renderer/components/ActionButton';
import {Header, HeaderInfo} from 'src/renderer/components/PaneHeader';

import AvailableOverlays from './components/AvailableOverlays';
import OverlayList from './components/OverlayList';

const OverlayConfig = observer(() => {
  const [addNewOpen, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <Header>
        <HeaderInfo>
          Overlays are small websites that you can embed into a livestream using the{' '}
          <a href="https://obsproject.com/wiki/Sources-Guide#browsersource">
            OBS Browser Source
          </a>{' '}
          (or similar). Each instance of an overlay has it&apos;s own configuration.
        </HeaderInfo>
        {addNewOpen ? (
          <ActionButton muted onClick={() => setOpen(!addNewOpen)}>
            <ArrowLeft size="1rem" /> Back
          </ActionButton>
        ) : (
          <ActionButton onClick={() => setOpen(!addNewOpen)}>
            <Plus size="1rem" shapeRendering="crispEdges" /> Add Overlay
          </ActionButton>
        )}
      </Header>
      <Container>
        <AnimatePresence>
          {addNewOpen && (
            <AvailableOverlays
              key={addNewOpen.toString()}
              onAdded={() => setOpen(false)}
            />
          )}
        </AnimatePresence>
        <OverlayList />
      </Container>
    </React.Fragment>
  );
});

const Container = styled('div')`
  position: relative;
  flex-grow: 1;

  > * {
    overflow-y: scroll;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }
`;

export default OverlayConfig;
