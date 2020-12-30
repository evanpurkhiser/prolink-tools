import {css, Theme} from '@emotion/react';
import styled from '@emotion/styled';

const colors = (buttonTheme: Theme['button']['primary']) => css`
  background: ${buttonTheme.background};
  color: ${buttonTheme.color};

  &:hover {
    background: ${buttonTheme.backgroundHover};
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
  ${p => (p.muted ? colors(p.theme.button.muted) : colors(p.theme.button.primary))}
`;

export default ActionButton;
