import * as React from 'react';
import {css} from '@emotion/react';
import styled from '@emotion/styled';

type Props = React.ComponentProps<'label'> & {
  size?: 'sm' | 'md' | 'lg' | 'fit' | 'full';
  noCenter?: boolean;
  top?: boolean;
  name?: React.ReactNode;
  description?: React.ReactNode;
};

const SIZES = {
  sm: '40px',
  md: '100px',
  lg: '250px',
  fit: 'max-content',
  full: '100%',
};

const Field = styled(
  ({
    size: _size,
    top: _top,
    noCenter: _noCenter,
    name,
    description,
    children,
    ...p
  }: Props) => (
    <label {...p}>
      {children}
      <div>
        <Label>{name}</Label>
        {description && <small>{description}</small>}
      </div>
    </label>
  )
)<Props>`
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
    !p.noCenter &&
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
    border-bottom: 1px solid ${p => p.theme.border};
  }

  p {
    margin-top: 0;
  }

  p:last-child {
    margin-bottom: 0;
  }

  small {
    display: block;
    margin-top: 0.25rem;
    color: ${p => p.theme.subText};
  }
`;

const Label = styled('div')`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export default Field;
