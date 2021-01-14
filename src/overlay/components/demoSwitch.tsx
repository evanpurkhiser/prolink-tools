import {ThemeProvider} from '@emotion/react';
import styled from '@emotion/styled';
import {set} from 'mobx';
import {observer} from 'mobx-react';

import Checkbox from 'ui/components/form/Checkbox';

type Props = {
  config: {demoMode?: boolean};
};

const DemoSwitch = observer(({config}: Props) => (
  <ThemeProvider theme={{active: '#fff'}}>
    <Container enabled={!!config.demoMode}>
      Show demo data on live overlay
      <Checkbox
        controlSize="sm"
        checked={!!config.demoMode}
        onChange={() => set(config, {demoMode: !config.demoMode})}
      />
    </Container>
  </ThemeProvider>
));

export default DemoSwitch;

const Container = styled('label')<{enabled: boolean}>`
  position: absolute;
  top: 0.5rem;
  right: 0rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.675rem;
  font-weight: 700;
  text-transform: uppercase;
  background: ${p => (p.enabled ? '#f95757' : '#30343a')};
  padding: 0.5rem;
  padding-left: 0.75rem;
  color: #fff;
  transition: background 200ms ease-in-out;
`;
