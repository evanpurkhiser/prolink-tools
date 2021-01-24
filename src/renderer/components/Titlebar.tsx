import React from 'react';
import {Save} from 'react-feather';
import styled from '@emotion/styled';

import useRelease from 'src/utils/useLatestRelease';

import ActionButton from './ActionButton';
import NetworkStatus from './NetworkStatus';

const Toolbar = () => {
  const latestRelease = useRelease();

  const hasNewVersion =
    latestRelease &&
    process.env.RELEASE_CHANNEL === 'stable' &&
    process.env.RELEASE !== latestRelease.name;

  return (
    <Container>
      {hasNewVersion && latestRelease && (
        <NewVersionButton onClick={() => location.assign(latestRelease.html_url)}>
          <Save size="1rem" /> {latestRelease.name} available
        </NewVersionButton>
      )}
      <Version>{process.env.RELEASE}</Version>
      <NetworkStatus />
    </Container>
  );
};

const Version = styled('div')`
  align-items: center;
  font-size: 0.7rem;
  color: ${p => p.theme.subText};
  margin-top: 4px;
`;

const Container = styled('header')`
  z-index: 1;
  height: 36px;
  padding: 0 0.5rem;
  padding-left: 75px;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  align-items: center;
  background: ${p => p.theme.backgroundSecondary};
  border-bottom: 1px solid ${p => p.theme.border};
  -webkit-app-region: drag;
`;

const NewVersionButton = styled(ActionButton)`
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  background: #ef5f73;
  color: #fff;
  padding: 0.375rem 0.5rem;
  font-size: 0.75rem;
`;

export default Toolbar;
