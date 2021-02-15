import styled from '@emotion/styled';

type Props = {
  controlSize?: 'sm' | 'md';
};

const Radio = styled('input')<Props>`
  margin: 0;
  appearance: none;
  width: 1.25rem;
  height: 1.25rem;
  position: relative;

  &:before {
    content: '';
    position: absolute;
    display: block;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    border-radius: 50%;
    border: 1px solid ${p => p.theme.control.border};
    transition: border-color 200ms ease-in-out;
  }

  &:after {
    content: '';
    position: absolute;
    display: block;
    top: 0.375rem;
    left: 0.375rem;
    height: 0.5rem;
    width: 0.5rem;
    border-radius: 50%;
    background: ${p => p.theme.control.knobAlt};
    transition: background 200ms ease-in-out;
  }

  &:checked:before {
    border-color: ${p => p.theme.active};
  }

  &:checked:after {
    background: ${p => p.theme.active};
  }
`;

Radio.defaultProps = {
  type: 'radio',
};

export default Radio;
