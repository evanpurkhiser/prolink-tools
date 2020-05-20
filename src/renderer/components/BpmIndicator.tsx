
import * as React from 'react';

import {CDJStatus} from 'prolink-connect';
import styled from '@emotion/styled';

type Props = React.HTMLAttributes<HTMLDivElement> & {
  bpm?: number;
  pitch?: number
};


const BpmIndicator = styled(({bpm, pitch, ...p}: Props) => (
  <div {...p}>
    <div>{bpm ? (bpm + (bpm * (pitch ?? 0) / 100)).toFixed(1) : <Blank />}</div>
    <div>{pitch?.toFixed(2) ?? <Blank />}</div>
  </div>
))`
  display: inline-grid;
  grid-template-columns: auto auto;
  grid-gap: 0.25rem;
  font-size: 1.125rem;
  font-weight: 700;
  border: 1px solid #E2E2E2;
  border-radius: 3px;

  > div {
    display: grid;
    grid-template-rows: max-content max-content;
    grid-gap: 0.125rem;
    padding: 0.375rem;
    padding-bottom: 0.25rem;

    &:first-child {
      border-right: 1px solid #E2E2E2;
      padding-right: 0.575rem;
    }

    &:after {
      content: '';
      font-size: 10px;
      color: #666666;
      text-transform: uppercase;
      font-weight: normal;
    }

    &:nth-child(1):after {
      content: 'bpm';
    }

    &:nth-child(2):after {
      content: 'pitch adjust';
    }
  }
`;

const Blank = styled(p => <span {...p}>—</span>)`
  color: #555;
`;

export default BpmIndicator;
