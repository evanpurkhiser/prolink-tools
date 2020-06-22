import * as React from 'react';
import styled from '@emotion/styled';
import Logo from 'src/shared/components/Logo';
import {motion} from 'framer-motion';

const Title = (props: React.ComponentProps<typeof motion.div>) => (
  <Container {...props}>
    <Logo size={64} />
    <Wordmark>prolink tools</Wordmark>
    <AlphaTag>Alpha</AlphaTag>
  </Container>
);

const Container = styled(motion.div)`
  position: relative;
  display: inline-grid;
  grid-template-columns: max-content max-content;
  align-items: center;
  grid-gap: 1.25rem;
`;

const Wordmark = styled('h1')`
  background: #2d2d2d;
  color: #fff;
  font-size: 1.75rem;
  font-weight: 400;
  padding: 0.5rem 1rem;
  margin: 0;
`;

const AlphaTag = styled('div')`
  background: #ff8038;
  text-transform: uppercase;
  padding: 0.125rem 0.5rem;
  color: #fff;
  position: absolute;
  bottom: -8px;
  right: -22px;
`;

export default Title;
