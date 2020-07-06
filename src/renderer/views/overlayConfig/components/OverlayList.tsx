import * as React from 'react';
import {observer} from 'mobx-react';
import styled from '@emotion/styled';
import {Delete, Copy, Link} from 'react-feather';
import {css} from '@emotion/core';

import store from 'src/shared/store';
import {registeredOverlays, OverlayInstance} from 'src/overlay';
import {WEBSERVER_PORT} from 'src/shared/constants';

import Example from './Example';
import EmptyState from './EmptyState';

const OverlayList = observer(() => (
  <Container>
    {store.config.overlays.length === 0 && <EmptyState />}
    {store.config.overlays.map(instance => {
      const descriptor = registeredOverlays.find(
        overlay => overlay.type === instance?.type
      );

      if (descriptor === undefined) {
        return null;
      }

      return (
        <div key={instance.key}>
          <Actions>
            <OverlayUrl instance={instance} />
            <Remove onClick={() => store.config.overlays.remove(instance)}>
              <Delete size="1rem" />
            </Remove>
          </Actions>
          <Example>
            <descriptor.example config={instance.config} />
          </Example>
        </div>
      );
    })}
  </Container>
));

const OverlayUrl = ({instance}: {instance: OverlayInstance}) => {
  const url = `http://127.0.0.1:${WEBSERVER_PORT}/${instance.key}`;

  return (
    <UrlWrapper>
      <Url
        onClick={e => {
          const range = document.createRange();
          range.selectNodeContents(e.currentTarget);
          const sel = window.getSelection()!;
          sel.removeAllRanges();
          sel.addRange(range);
        }}
      >
        {url}
      </Url>
      <OpenLink href={url}>
        <Link size="0.875rem" />
      </OpenLink>
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
  border: 1px solid #eee;
  border-bottom: none;
  border-radius: 3px 3px 0 0;
  background: #fafafa;
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

const Url = styled('div')`
  user-select: unset;
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
  ${buttonStyle('#f84b4b')};
  padding-right: 0.375rem;
`;

const CopyButton = styled('button')`
  ${buttonStyle('#28272B')};
`;

const OpenLink = styled('a')`
  ${buttonStyle('#28272B')};
`;

const Container = styled('div')`
  user-select: text;
  display: grid;
  grid-auto-flow: row;
  grid-auto-rows: max-content;
  grid-gap: 1.5rem;
  padding: 1.5rem;
`;

export default OverlayList;
