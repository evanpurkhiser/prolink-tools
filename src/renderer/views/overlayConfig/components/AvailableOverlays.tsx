import * as React from 'react';
import styled from '@emotion/styled';
import {motion} from 'framer-motion';
import short from 'short-uuid';
import {Layers} from 'react-feather';

import {OverlayDescriptor, registeredOverlays, OverlayInstance} from 'src/overlay';
import store from 'src/shared/store';

import Example from './Example';

type EntryProps = {
  overlay: OverlayDescriptor;
  onAdd: () => void;
};

const OverlayEntry: React.FC<EntryProps> = ({overlay, onAdd}) => (
  <EntryContainer>
    <OverlayHeader>
      {overlay.name}
      <AddButton onClick={onAdd}>
        <Layers size="0.75rem" /> Add Overlay
      </AddButton>
    </OverlayHeader>
    <Example>
      <overlay.example />
    </Example>
  </EntryContainer>
);

type ListProps = {
  onAdded: (instance: OverlayInstance) => void;
};

const AvailableOverlays: React.FC<ListProps> = ({onAdded}) => (
  <Container>
    {registeredOverlays.map(overlay => (
      <OverlayEntry
        key={overlay.type}
        overlay={overlay}
        onAdd={() => {
          const instance: OverlayInstance = {
            type: overlay.type,
            key: short().new(),
            config: overlay.defaultConfig,
          };
          store.config.overlays.push(instance);
          onAdded(instance);
        }}
      />
    ))}
  </Container>
);

const EntryContainer = styled('div')`
  margin: 0 1.5rem;
`;

const OverlayHeader = styled('div')`
  font-size: 0.75rem;
  padding: 0.5rem;
  padding-left: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #eee;
  border-bottom: none;
  border-radius: 3px 3px 0 0;
  background: #fafafa;
`;

const AddButton = styled('button')`
  display: grid;
  grid-template-columns: max-content max-content;
  grid-gap: 0.5rem;
  align-items: center;
  color: #fff;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border: none;
  background: #767b82;
  border-radius: 3px;

  &:hover {
    background: #4b98f8;
  }
`;

const Container = styled(motion.div)`
  background: #fff;
  z-index: 2;
  display: grid;
  grid-auto-flow: row;
  grid-auto-rows: max-content;
  grid-gap: 1.5rem;
  padding: 1.5rem 1.5rem;
  margin: 0 -1.5rem;
  z-index: 20;
`;

Container.defaultProps = {
  initial: {opacity: 0, scale: 0.95},
  animate: {opacity: 1, scale: 1},
  exit: {opacity: 0, scale: 1.05},
  transition: {duration: 0.2},
};

export default AvailableOverlays;
