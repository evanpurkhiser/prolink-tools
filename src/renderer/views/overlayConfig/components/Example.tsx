import styled from '@emotion/styled';

const Example = styled('div')`
  position: relative;
  padding: 1.5rem;
  border: 1px solid #eee;
  border-radius: 0 0 3px 3px;
  background-size: 2rem 2rem;
  background-position: 0 0, 1rem 1rem;
  background-image: linear-gradient(
      45deg,
      #f2f2f2 25%,
      transparent 25%,
      transparent 75%,
      #f2f2f2 75%,
      #f2f2f2
    ),
    linear-gradient(
      45deg,
      #f2f2f2 25%,
      transparent 25%,
      transparent 75%,
      #f2f2f2 75%,
      #f2f2f2
    );
`;

export default Example;
