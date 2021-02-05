import * as React from 'react';
import {HelpCircle} from 'react-feather';
import styled from '@emotion/styled';

import LogoBig from 'src/shared/components/LogoBig';
import useModal from 'src/utils/useModal';

import ActionButton from './ActionButton';

const HelpButton = () => {
  const [modal, toggleModal] = useModal(
    <React.Fragment>
      <LogoBig />
      <p>
        Built by a DJ, for DJs. prolink tools is a hand-built collection of tools to hook
        into real-time performance data to enhance your sets. This software is 100% free,
        the source code is{' '}
        <a href="https://github.com/evanpurkhiser/prolink-tools">available on GitHub</a>.
      </p>
      <p>
        Prolink Tools was created by{' '}
        <a href="https://evanpurkhiser.com">Evan Purkhiser</a>.
      </p>
      <hr />
      <p>
        Need help? <a href="https://prolink.tools/manual">Read the Manual</a> and{' '}
        <a href="http://discord.gg/3eyzdgXJuY">Join the Discord server</a>!
      </p>
      <small>
        Like this software? Want to help support development?{' '}
        <a href="https://ko-fi.com/evanpurkhiser">You can buy me a coffee</a> ❤️
      </small>
    </React.Fragment>
  );

  return (
    <React.Fragment>
      <Button onClick={() => toggleModal(true)}>
        <HelpCircle size="1rem" />
      </Button>
      {modal}
    </React.Fragment>
  );
};

export default HelpButton;

const Button = styled(ActionButton)`
  background: ${p => p.theme.backgroundSecondary};
  color: ${p => p.theme.subText};
  border-radius: 50%;
  padding: 0.25rem;
  transition: background 150ms ease-in-out, color 150ms ease-in-out;

  &:hover {
    background: ${p => p.theme.backgroundBox};
    color: ${p => p.theme.primaryText};
  }
`;
