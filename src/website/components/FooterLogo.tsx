import styled from '@emotion/styled';

import Logo from 'src/shared/components/Logo';

const FooterLogo = () => (
  <Link href="https://prolink.tools">
    <PoweredBy>Powered by</PoweredBy>
    <Logo size={24} />
    <Wordmark>Prolink Tools</Wordmark>
  </Link>
);

const Link = styled('a')`
  color: ${p => p.theme.primaryText};
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 3px;
  transition: background 200ms ease-in-out;
  text-decoration: none;

  &:hover {
    color: ${p => p.theme.primaryText};
    background: ${p => p.theme.backgroundBox};
  }
`;

const PoweredBy = styled('span')`
  font-size: 0.75rem;
`;

const Wordmark = styled('span')`
  background: #2d2d2d;
  font-size: 0.75rem;
  color: #fff;
  font-weight: 400;
  padding: 0.125rem 0.375rem;
  margin: 0;
`;

export default FooterLogo;
