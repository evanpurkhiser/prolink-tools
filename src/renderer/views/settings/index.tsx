import * as React from 'react';
import styled from '@emotion/styled';
import {set} from 'mobx';
import {observer} from 'mobx-react';

import Text from 'app/components/form/Text';
import Checkbox from 'src/renderer/components/form/Checkbox';
import Field from 'src/renderer/components/form/Field';
import InfoBox from 'src/renderer/components/form/InfoBox';
import store from 'src/shared/store';

const Settings = observer(() => {
  const config = store.config;

  return (
    <React.Fragment>
      <Heading>General</Heading>
      <Section>
        <Field
          size="md"
          name="ID Marker"
          description="Tracks containing this text anywhere in the metadata (title, artist, comment, etc) will be marked as 'IDs'. Additional configurations may be needed in tools for tracks marked as IDs. This value is case insensitive."
        >
          <Text
            type="text"
            style={{appearance: 'textfield'}}
            value={config.idMarker}
            onChange={e => set(config, {idMarker: e.target.value})}
          />
        </Field>
      </Section>

      <Heading>Debugging / Development</Heading>
      <Section>
        <Field
          top
          size="sm"
          name="Collect track events"
          description={
            <React.Fragment>
              Enables collecting <em>all</em> events reported by PROLINK devices on the
              network. Events are anonymized, and do not include track names or other
              private metadata.
              <InfoBox>
                Collecting track events is incredibly helpful when looking into issues
                where tracks were not marked as now-playing, or were marked as now-playing
                at the wrong time. You may want to turn this on if you run into frequent
                issues and can include that you&apos;ve enabled collecting track events
                when reporting bugs.
              </InfoBox>
            </React.Fragment>
          }
        >
          <Checkbox
            checked={config.reportDebugEvents}
            onChange={e => set(store.config, {reportDebugEvents: e.target.checked})}
          />
        </Field>
      </Section>
    </React.Fragment>
  );
});

const Heading = styled(({children, ...p}: React.HTMLProps<HTMLHeadingElement>) => (
  <h2 {...p}>{children}</h2>
))`
  font-size: 0.85rem;
  text-transform: uppercase;
  margin: 0;
  padding: 1.25rem 1rem;
  border-bottom: 1px solid #eee;
  font-weight: 500;
`;

const Section = styled('section')`
  padding: 0.5rem 0;
  margin-left: 1.25rem;
  border-left: 1px solid #eee;
`;

export default Settings;
