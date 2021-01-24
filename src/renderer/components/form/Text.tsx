import styled from '@emotion/styled';

const Text = styled('input')`
  position: relative;
  border: 1px solid ${p => p.theme.control.border};
  color: ${p => p.theme.primaryText};
  border-radius: 3px;
  font-size: 0.75rem;
  transition: border-color 200ms ease-in-out;
  padding: 0.25rem 0.5rem;
  font-family: 'DM Mono';
  background: none;
  height: 34px;

  &:focus {
    border-color: ${p => p.theme.control.borderFocus};
  }

  &[type='number']::-webkit-inner-spin-button,
  &[type='number']::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

Text.defaultProps = {
  type: 'text',
};

export default Text;
