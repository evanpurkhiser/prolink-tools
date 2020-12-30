import styled from '@emotion/styled';

const Checkbox = styled('input')`
  margin: 0;
  appearance: none;
  width: 2.25rem;
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
    border-radius: 1rem;
    border: 1px solid ${p => p.theme.control.border};
    transition: border-color 200ms ease-in-out;
  }

  &:after {
    content: '';
    position: absolute;
    display: block;
    top: 0.25rem;
    left: 0.25rem;
    height: 0.75rem;
    width: 0.75rem;
    border-radius: 100%;
    background: ${p => p.theme.control.knob};
    transition: transform 200ms ease-in-out, background 200ms ease-in-out;
  }

  &:checked:before {
    border-color: #72d145;
  }

  &:checked:after {
    transform: translateX(1rem);
    background: #72d145;
  }
`;

Checkbox.defaultProps = {
  type: 'checkbox',
};

export default Checkbox;
