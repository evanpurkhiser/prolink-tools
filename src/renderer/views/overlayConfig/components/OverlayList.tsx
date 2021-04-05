import {Copy, Delete} from 'react-feather';
import {css} from '@emotion/react';
import styled from '@emotion/styled';
import {action} from 'mobx';
import {observer} from 'mobx-react';

import {OverlayInstance, registeredOverlays} from 'src/overlay';
import {AppStore} from 'src/shared/store';
import {overlayBaseUrl, webBaseUrl} from 'src/utils/urls';
import withStore from 'src/utils/withStore';

import EmptyState from './EmptyState';
import Example from './Example';

type Props = {
  store: AppStore;
};

const OverlayList = observer(({store}: Props) =>
  store.config.overlays.length === 0 ? (
    <EmptyContainer>
      <EmptyState />
    </EmptyContainer>
  ) : (
    <Container>
      {store.config.overlays.map((instance, i) => (
        <OverlayEntry store={store} index={i} key={instance.key} />
      ))}
    </Container>
  )
);

type EntryProps = {
  store: AppStore;
  index: number;
};

const OverlayEntry = observer(({store, index}: EntryProps) => {
  const instance = store.config.overlays[index];

  const descriptor = registeredOverlays.find(overlay => overlay.type === instance?.type);

  if (descriptor === undefined) {
    return null;
  }

  return (
    <div key={instance.key}>
      <Actions>
        <OverlayUrl cloudEnabled={store.config.cloudTools.enabled} instance={instance} />
        <Remove onClick={action(() => store.config.overlays.remove(instance))}>
          <Delete size="1rem" />
        </Remove>
      </Actions>
      <Settings>
        <descriptor.configInterface config={instance.config} />
      </Settings>
      <Example>
        <descriptor.example config={instance.config} />
      </Example>
    </div>
  );
});

type UrlProps = {
  instance: OverlayInstance;
  cloudEnabled: boolean;
};

const OverlayUrl = ({instance, cloudEnabled}: UrlProps) => {
  const url = cloudEnabled
    ? `${webBaseUrl}/overlay/${instance.key}`
    : `${overlayBaseUrl}/${instance.key}`;

  return (
    <UrlWrapper>
      <Url href={url}>{url}</Url>
      <CopyButton onClick={() => navigator.clipboard.writeText(url)}>
        <Copy size="0.875rem" />
      </CopyButton>
    </UrlWrapper>
  );
};

const Actions = styled('div')`
  padding: 0.5rem;
  padding-right: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid ${p => p.theme.border};
  border-bottom: none;
  border-radius: 3px 3px 0 0;
  background: ${p => p.theme.backgroundSecondary};
`;

const UrlWrapper = styled('div')`
  display: grid;
  align-items: center;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  grid-gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
`;

const Url = styled('a')`
  user-select: all;
  font-size: 0.75rem;
`;

const buttonStyle = (color: string) => css`
  color: ${color};
  background: none;
  border: none;
  display: flex;
  align-items: center;
  padding: 0.25rem;
  border-radius: 3px;

  &:hover {
    color: #fff;
    background: ${color};
  }
`;

const Remove = styled('button')`
  ${p => buttonStyle(p.theme.critical)};
  padding-right: 0.375rem;
`;

const CopyButton = styled('button')`
  ${buttonStyle('#4b98f8')};
`;

const Settings = styled('div')`
  border: 1px solid ${p => p.theme.border};
  border-bottom: none;
`;

const Container = styled('div')`
  user-select: text;
  display: grid;
  grid-auto-flow: row;
  grid-auto-rows: max-content;
  grid-gap: 1.5rem;
  padding: 1.5rem;
`;

const EmptyContainer = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default withStore(OverlayList);
