import * as React from 'react';
import styled from '@emotion/styled';

import Logo from 'src/shared/components/Logo';

const Version = () => (
  <Wrapper>
    <Logo size={28} />
    <div>
      <Title>prolink tools</Title>
      <Release>{process.env.RELEASE}</Release>
    </div>
  </Wrapper>
);

const Title = styled('h2')`
  font-size: 0.8rem;
  margin: 0;
`;

const Release = styled('div')`
  font-size: 0.7rem;
  color: #777a7b;
`;

const Wrapper = styled('div')`
  padding: 0.5rem;
  display: grid;
  grid-template-columns: max-content max-content;
  grid-gap: 0.5rem;
`;

export default Version;
