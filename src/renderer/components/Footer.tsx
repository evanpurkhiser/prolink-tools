import * as React from 'react';
import styled from '@emotion/styled';
import {Save} from 'react-feather';
import {shell} from 'electron';

import Logo from 'src/shared/components/Logo';
import ActionButton from './ActionButton';
import useRelease from 'src/utils/useLatestRelease';

const Footer = () => {
  const latestRelease = useRelease();

  const hasNewVersion =
    latestRelease &&
    process.env.RELEASE_CHANNEL === 'stable' &&
    process.env.RELEASE !== latestRelease.name;

  const newVersion = latestRelease && hasNewVersion && (
    <NewVersionButton onClick={() => shell.openExternal(latestRelease.html_url)}>
      <Save size="1rem" /> {latestRelease.name} available
    </NewVersionButton>
  );

  return (
    <Wrapper>
      <Logo size={28} />
      <div>
        <Title>prolink tools</Title>
        <Release>{process.env.RELEASE}</Release>
      </div>
      <Info>{newVersion}</Info>
    </Wrapper>
  );
};

const Info = styled('div')`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: flex-end;
`;

const NewVersionButton = styled(ActionButton)`
  background: #ef5f73;
  color: #fff;
  padding: 0.375rem 0.5rem;
  font-size: 0.75rem;
`;

const Title = styled('h2')`
  display: flex;
  align-items: center;
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
  align-items: center;
  grid-template-columns: max-content max-content 1fr;
  grid-gap: 0.5rem;
`;

export default Footer;
