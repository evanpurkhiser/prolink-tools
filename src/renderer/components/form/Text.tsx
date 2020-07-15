import styled from '@emotion/styled';

const Text = styled('input')`
  position: relative;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-size: 0.75rem;
  transition: border-color 200ms ease-in-out;
  padding: 0.25rem 0.5rem;
  width: 100%;
  font-family: 'DM Mono';

  &:focus {
    border-color: #aaa;
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
