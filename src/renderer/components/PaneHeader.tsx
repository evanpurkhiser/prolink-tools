import styled from '@emotion/styled';

const Header = styled('header')`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
`;

const HeaderInfo = styled('p')`
  font-family: Ubuntu;
  flex-grow: 1;
  margin-right: 1.5rem;
  font-size: 0.8rem;
  max-width: 450px;
  margin: 0;
`;

export {Header, HeaderInfo};
