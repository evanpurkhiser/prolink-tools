import {css} from '@emotion/core';
import styled from '@emotion/styled';

const primary = css`
  background: #28272b;
  color: #fff;

  &:hover {
    background: #000;
  }
`;

const muted = css`
  background: #eee;

  &:hover {
    background: #e5e5e5;
  }
`;

const ActionButton = styled('button')<{muted?: boolean}>`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  grid-gap: 0.5rem;
  align-items: center;
  border: none;
  padding: 0.5rem 1rem;
  font-weight: bold;
  border-radius: 3px;
  ${p => (p.muted ? muted : primary)}
`;

export default ActionButton;
