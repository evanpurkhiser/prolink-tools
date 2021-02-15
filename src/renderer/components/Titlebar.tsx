import React from 'react';
import {Radio, Save} from 'react-feather';
import styled from '@emotion/styled';

import useReleaseModal from 'src/renderer/hooks/useReleaseModal';
import Tooltip from 'src/shared/components/tooltip';
import {AppStore} from 'src/shared/store';
import useRelease from 'src/utils/useLatestRelease';
import withStore from 'src/utils/withStore';

import ActionButton from './ActionButton';
import NetworkStatus from './NetworkStatus';

type Props = {
  store: AppStore;
};

const Toolbar = ({store}: Props) => {
  const latestRelease = useRelease();
  const [notesModal, openNotesModal] = useReleaseModal({latestRelease});

  const hasNewVersion =
    latestRelease &&
    process.env.RELEASE_CHANNEL === 'stable' &&
    process.env.RELEASE !== latestRelease.name;

  // Is this their first time using this version?
  const isNewVersion =
    store.isInitalized &&
    store.config.lastUsedVersion !== process.env.RELEASE &&
    process.env.RELEASE_CHANNEL === 'stable';

  // Open the release notes modal on first run
  React.useEffect(() => {
    if (isNewVersion) {
      setTimeout(() => openNotesModal(true, {hideUnreleased: true}), 500);
    }
  }, [isNewVersion]);

  return (
    <Container>
      {latestRelease && hasNewVersion && (
        <NewVersionButton onClick={() => openNotesModal(true, {hideUnreleased: true})}>
          <Save size="1rem" /> {latestRelease.name} available
        </NewVersionButton>
      )}
      <Tooltip title="View version changelogs">
        <Version onClick={() => openNotesModal(true)}>
          {process.env.RELEASE} <Radio size="1rem" />
        </Version>
      </Tooltip>
      {notesModal}
      <NetworkStatus />
    </Container>
  );
};

const Version = styled('div')`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.7rem;
  color: ${p => p.theme.subText};
  line-height: 20px;
  padding: 0 0.25rem;
  border-radius: 2px;
  transition: background 200ms ease-in-out;
  cursor: pointer;

  &:hover {
    background: ${p => p.theme.backgroundBox};
  }
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
  background: ${p => p.theme.softCritical};
  color: #fff;
  padding: 0.375rem 0.5rem;
  font-size: 0.75rem;
`;

export default withStore(Toolbar);
