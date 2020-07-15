import * as React from 'react';
import {observer} from 'mobx-react';
import styled from '@emotion/styled';
import {Plus, ArrowLeft} from 'react-feather';
import {css} from '@emotion/core';
import {AnimatePresence} from 'framer-motion';

import AvailableOverlays from './components/AvailableOverlays';
import OverlayList from './components/OverlayList';

const OverlayConfig = observer(() => {
  const [addNewOpen, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <Header>
        <Help>
          Overlays are small websites that you can embed into a livestream using the{' '}
          <a href="https://obsproject.com/wiki/Sources-Guide#browsersource">
            OBS Browser Source
          </a>{' '}
          (or similar). Each instance of an overlay has it's own configuration.
        </Help>
        {addNewOpen ? (
          <BackButton onClick={() => setOpen(!addNewOpen)}>
            <ArrowLeft size="1rem" /> Back
          </BackButton>
        ) : (
          <AddButton onClick={() => setOpen(!addNewOpen)}>
            <React.Fragment>
              <Plus size="1rem" shapeRendering="crispEdges" /> Add Overlay
            </React.Fragment>
          </AddButton>
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

const Header = styled('header')`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
`;

const Help = styled('p')`
  flex-grow: 1;
  margin-right: 1.5rem;
  font-size: 0.75rem;
  max-width: 450px;
  margin: 0;
`;

const actionButtonCss = css`
  display: grid;
  grid-template-columns: max-content max-content;
  grid-gap: 0.5rem;
  align-items: center;
  border: none;
  padding: 0.5rem 1rem;
  font-weight: bold;
  border-radius: 3px;
`;

const AddButton = styled('button')`
  ${actionButtonCss};
  background: #28272b;
  color: #fff;

  &:hover {
    background: #000;
  }
`;

const BackButton = styled('button')`
  ${actionButtonCss};
  background: #eee;

  &:hover {
    background: #e5e5e5;
  }
`;

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
