import styled from '@emotion/styled';
import React from 'react';

import tracks from 'app/trackEvents';

const ExampleButton = styled(p => (
  <button onClick={_ => tracks.addExample()} {...p}>
    Add Example Track
  </button>
))`
  margin-top: 14px;
  display: block;
  text-align: center;
  width: 100%;
  border: 1px solid #d6d7dc;
  border-radius: 3px;
  padding: 6px 0;
  color: #5f5f75;
  transition: all 300ms;
  cursor: pointer;

  &:focus {
    outline: none;
  }

  &: hover {
    border-color: #a5aab9;
    color: #323348;
  }
`;

export default ExampleButton;
