import styled from '@emotion/styled';

type Props = {
  controlSize?: 'sm' | 'md';
};

const Checkbox = styled('input')<Props>`
  margin: 0;
  appearance: none;
  width: ${p => (p.controlSize === 'sm' ? 1.5 : 2.25)}rem;
  height: ${p => (p.controlSize === 'sm' ? 0.75 : 1.25)}rem;
  position: relative;

  &:before {
    content: '';
    position: absolute;
    display: block;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    border-radius: 1rem;
    border: 1px solid ${p => p.theme.control.border};
    transition: border-color 200ms ease-in-out;
  }

  &:after {
    content: '';
    position: absolute;
    display: block;
    top: ${p => (p.controlSize === 'sm' ? 0.125 : 0.25)}rem;
    left: ${p => (p.controlSize === 'sm' ? 0.125 : 0.25)}rem;
    height: ${p => (p.controlSize === 'sm' ? 0.5 : 0.75)}rem;
    width: ${p => (p.controlSize === 'sm' ? 0.5 : 0.75)}rem;
    border-radius: 100%;
    background: ${p => p.theme.control.knob};
    transition: transform 200ms ease-in-out, background 200ms ease-in-out;
  }

  &:checked:before {
    border-color: ${p => p.theme.active};
  }

  &:checked:after {
    transform: translateX(${p => (p.controlSize === 'sm' ? 0.75 : 1)}rem);
    background: ${p => p.theme.active};
  }
`;

Checkbox.defaultProps = {
  type: 'checkbox',
};

export default Checkbox;
