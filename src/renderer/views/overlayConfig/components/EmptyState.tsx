import * as React from 'react';
import styled from '@emotion/styled';
import {Layers} from 'react-feather';

const EmptyState = () => (
  <Wrapper>
    <Layers size="2rem" />
    <p>No overlays are configured yet!</p>
  </Wrapper>
);

const Wrapper = styled('div')`
  display: grid;
  grid-template-rows: max-content max-content;
  grid-gap: 0.25rem;
  font-size: 0.875rem;
  justify-content: center;
  justify-items: center;
`;

export default EmptyState;
