import * as React from 'react';
import styled from '@emotion/styled';

type Props = React.HTMLAttributes<HTMLDivElement> & {
  bpm?: number | null;
  pitch?: number;
};

const BpmIndicator = styled(({bpm, pitch, ...p}: Props) => (
  <div {...p}>
    <div>
      {bpm !== null && bpm !== undefined ? (
        (bpm + (bpm * (pitch ?? 0)) / 100).toFixed(1)
      ) : (
        <Blank />
      )}
    </div>
    <div>{pitch?.toFixed(2) ?? <Blank />}</div>
  </div>
))`
  display: grid;
  grid-template-columns: auto auto;
  grid-gap: 0.25rem;
  font-size: 1.125rem;
  font-weight: 700;
  border: 1px solid #e2e2e2;
  border-radius: 3px;

  > div {
    padding: 0.375rem;
    padding-bottom: 0.25rem;

    &:first-of-type {
      border-right: 1px solid #e2e2e2;
      padding-right: 0.575rem;
    }

    &:after {
      display: block;
      content: '';
      font-size: 10px;
      color: #666666;
      text-transform: uppercase;
      font-weight: normal;
      margin-top: 0.125rem;
    }

    &:nth-of-type(1):after {
      content: 'bpm';
    }

    &:nth-of-type(2):after {
      content: 'pitch adjust';
    }
  }
`;

const Blank = styled('span')`
  color: #555;
`;

Blank.defaultProps = {
  children: '-',
};

export default BpmIndicator;
