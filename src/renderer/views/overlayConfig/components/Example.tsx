import styled from '@emotion/styled';

const Example = styled('div')`
  position: relative;
  padding: 1.5rem;
  border: 1px solid ${p => p.theme.border};
  border-radius: 0 0 3px 3px;
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  background-image: linear-gradient(45deg, #434343 25%, transparent 25%),
    linear-gradient(-45deg, #434343 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #434343 75%),
    linear-gradient(-45deg, #484848 75%, #434343 75%);
`;

export default Example;
