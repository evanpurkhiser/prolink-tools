import styled from '@emotion/styled';

type Props = {
  priority?: 'good' | 'ok' | 'critical';
};

const Tag = styled('div')<Props>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.65rem;
  font-weight: bold;
  text-transform: uppercase;
  padding: 0.125rem 0.25rem;
  border-radius: 2px;
  color: #fff;
  background: ${p =>
    p.priority === 'good'
      ? p.theme.active
      : p.priority === 'critical'
      ? p.theme.critical
      : p.priority === 'ok'
      ? p.theme.activeAlt
      : p.theme.activeAlt};
`;

export default Tag;
