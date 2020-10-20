import * as React from 'react';
import styled from '@emotion/styled';

import {Bookmark} from 'react-feather';

const InfoBox = styled(({children, ...p}: React.HTMLProps<HTMLDivElement>) => (
  <div {...p}>
    <Bookmark size="0.8rem" />
    <div>{children}</div>
  </div>
))`
  display: grid;
  grid-template-columns: max-content 1fr;
  grid-gap: 0.5rem;
  color: #1a4275;
  background: #f1f7ff;

  border-top: 2px solid #4b97f8;
  border-radius: 0 0 4px 4px;
  padding: 0.5rem;
  margin-top: 0.75rem;

  svg {
    margin-top: 1px;
  }

  p {
    margin: 0;
    margin-bottom: 0.5rem;
  }

  p:last-child {
    margin: 0;
  }
`;

export default InfoBox;
