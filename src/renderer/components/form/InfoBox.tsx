import {Bookmark} from 'react-feather';
import styled from '@emotion/styled';

const InfoBox = styled(({children, ...p}: React.HTMLProps<HTMLDivElement>) => (
  <div {...p}>
    <Bookmark size="0.8rem" />
    <div>{children}</div>
  </div>
))`
  display: grid;
  grid-template-columns: max-content 1fr;
  grid-gap: 0.5rem;
  color: ${p => p.theme.alert.info.text};
  background: ${p => p.theme.alert.info.background};

  border-top: 2px solid ${p => p.theme.alert.info.border};
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
