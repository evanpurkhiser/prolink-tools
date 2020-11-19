import * as React from 'react';
import styled from '@emotion/styled';
import {css} from '@emotion/core';

type Props = React.HTMLAttributes<HTMLLabelElement> & {
  size?: 'sm' | 'md' | 'lg' | 'fit' | 'full';
  top?: boolean;
  name?: string;
  description?: React.ReactNode;
};

const SIZES = {
  sm: '40px',
  md: '100px',
  lg: '250px',
  fit: 'max-content',
  full: '100%',
};

const Field = styled(({size, name, description, children, ...p}: Props) => (
  <label {...p}>
    {children}
    <div>
      {name}
      {description && <small>{description}</small>}
    </div>
  </label>
))<Props>`
  font-family: Ubuntu;
  line-height: 1.4;
  display: grid;
  align-items: ${p => (p.top ? 'start' : 'center')};
  grid-template-columns: ${p => SIZES[p.size ?? 'md']} ${p =>
      p.size !== 'full' && 'minmax(0, 1fr)'};
  grid-gap: 0.5rem 1rem;

  font-size: 0.85rem;
  padding: 1rem 1.5rem;

  ${p =>
    p.size !== 'full' &&
    css`
      > *:first-child {
        justify-self: center;
      }
    `}

  ${p =>
    p.size === 'full' &&
    css`
      > *:first-child {
        grid-area: 2;
      }
      > &:last-child {
        grid-area: 1;
      }
    `}

  &:not(:last-child) {
    border-bottom: 1px solid #eee;
  }

  small {
    display: block;
    margin-top: 0.25rem;
    color: #888;
  }
`;

export default Field;
