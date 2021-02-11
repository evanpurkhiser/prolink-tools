import * as React from 'react';
import styled from '@emotion/styled';
import {action, set} from 'mobx';
import {observer} from 'mobx-react';

import Select from 'src/renderer/components/form/Select';
import Tag from 'src/shared/components/Tag';
import {AppStore} from 'src/shared/store';
import withStore from 'src/utils/withStore';
import Checkbox from 'ui/components/form/Checkbox';
import Field from 'ui/components/form/Field';
import InfoBox from 'ui/components/form/InfoBox';
import Text from 'ui/components/form/Text';

type Props = {
  store: AppStore;
};

const uiThemes = [
  {value: 'system', label: 'System'},
  {value: 'light', label: 'Light'},
  {value: 'dark', label: 'Dark'},
];

const Settings = observer(({store}: Props) => {
  const config = store.config;

  return (
    <React.Fragment>
      <Heading>General</Heading>
      <Section>
        <Field
          noCenter
          size="md"
          name="UI Theme"
          description="Prolink Tools comes with light and dark UI themes. Select 'System' to match your operating systems theme."
        >
          <Select
            isSearchable={false}
            options={uiThemes}
            value={uiThemes.find(t => t.value === config.theme)}
            onChange={action((value: any) => set(config, {theme: value?.value}))}
          />
        </Field>
        <Field
          noCenter
          size="md"
          name="ID Marker"
          description="Tracks containing this text anywhere in the metadata (title, artist, comment, etc) will be marked as 'IDs'. Additional configurations may be needed in tools for tracks marked as IDs. This value is case insensitive."
        >
          <Text
            type="text"
            value={config.idMarker}
            onChange={action((e: React.ChangeEvent<HTMLInputElement>) =>
              set(config, {idMarker: e.target.value})
            )}
          />
        </Field>
        {process.env.RELEASE_CHANNEL !== 'stable' && (
          <Field
            top
            size="sm"
            name="Enable cloud-based tools"
            description={
              <React.Fragment>
                Enabling this connects your Prolink Tools instance to the prolink.tools
                web service and will publish real-time event data. Some tools may only be
                used when this is enabled.
                <InfoBox>
                  <p>
                    This feature is still under <strong>heavy development</strong> and may{' '}
                    <strong>not be stable</strong>!
                  </p>
                  <p>
                    <strong>Important:</strong> Enabling this functionality publishes
                    events from your device to an internet service. This service does{' '}
                    <em>not</em> collect or persist any identifying data other than an
                    opaque string identifying your prolink tools instance.
                  </p>
                </InfoBox>
              </React.Fragment>
            }
          >
            <Checkbox
              checked={config.enableCloudApi}
              onChange={action((e: React.ChangeEvent<HTMLInputElement>) =>
                set(config, {enableCloudApi: e.target.checked})
              )}
            />
          </Field>
        )}
      </Section>

      <Heading>Now Playing Triggering</Heading>
      <Section>
        <Field
          noCenter
          top
          size="sm"
          name="Smart timing beat count"
          description={
            <React.Fragment>
              The number of beats that must pass before the track is reported as now
              playing. A general rule of thumb is to consider how many phrases of intro
              the genre of music you play typically has. For example, if you cut over the
              baseline of a track after 2 phrases of intro and want the new track to show
              as now playing, that would equate to 128 beats (4 beats per bar, 16 bars in
              a phrase, 2 phrases).
            </React.Fragment>
          }
        >
          <Text
            type="number"
            style={{appearance: 'textfield'}}
            value={config.mixstatusConfig.beatsUntilReported}
            onChange={action((e: React.ChangeEvent<HTMLInputElement>) =>
              set(config.mixstatusConfig, {beatsUntilReported: Number(e.target.value)})
            )}
          />
        </Field>
        <Field
          noCenter
          top
          size="sm"
          name="Allowed beats during interrupts"
          description={
            <React.Fragment>
              <p>
                An &quot;Interrupt&quot; is when you pause (or cut the fader when{' '}
                <em>use on-air status</em> is enabled) the current now-playing track, but
                you don&apos;t want the incoming track to be reported as on-air. You may
                be doing this as a performance trick, for example to solo a 1 bar fill on
                the incoming track.
              </p>
              <p>
                This counter stops tracks from being reported until after the configured
                number of beats has passed when being &quot;interrupted&quot;. Once you
                start the track again (or bring it back on-air) the counter is reset and
                the track is not reported. The longer you set the value, the longer you
                will have to wait before an outgoing track is seen as “complete” when you
                pause or take the fader down with the real intent of that track being
                complete (you may want to instead get in the habit of cueing the outgoing
                track)
              </p>
            </React.Fragment>
          }
        >
          <Text
            type="number"
            style={{appearance: 'textfield'}}
            value={config.mixstatusConfig.allowedInterruptBeats}
            onChange={action((e: React.ChangeEvent<HTMLInputElement>) =>
              set(config.mixstatusConfig, {allowedInterruptBeats: Number(e.target.value)})
            )}
          />
        </Field>
        <Field
          top
          size="sm"
          name="Only report after last track ends"
          description={
            <React.Fragment>
              When enable, the upcoming track will not be reported until the previous
              track has been cued or paused (it must be paused for longer than the{' '}
              <strong>allowed beats during interrupt</strong> timer). You may want to
              enable this if your equipment does not support reporting decks as On-Air
              otherwise your tracks may be reported as now playing much to early. Enabling
              this <strong>disables smart timing</strong>.
            </React.Fragment>
          }
        >
          <Checkbox
            checked={config.mixstatusConfig.reportRequresSilence}
            onChange={action((e: React.ChangeEvent<HTMLInputElement>) =>
              set(config.mixstatusConfig, {reportRequresSilence: e.target.checked})
            )}
          />
        </Field>
        <Field
          top
          size="sm"
          name={
            <React.Fragment>
              Use On-Air status
              {!store.hasOnAirSupport && (
                <Tag priority="critical">Needs compatible DJM / CDJ</Tag>
              )}
            </React.Fragment>
          }
          description={
            <React.Fragment>
              When enabled (and your mixer supports indicating on-air status) the incoming
              track <strong>must be on-air</strong> (red ring on the CDJ platter) in order
              to be reported as live.
            </React.Fragment>
          }
        >
          <Checkbox
            style={{filter: store.hasOnAirSupport ? 'none' : 'grayscale(1)'}}
            checked={config.mixstatusConfig.hasOnAirCapabilities}
            onChange={action((e: React.ChangeEvent<HTMLInputElement>) =>
              set(config.mixstatusConfig, {hasOnAirCapabilities: e.target.checked})
            )}
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
              Enables collecting <em>all</em> events reported by PRO DJ LINK devices on
              the network. Events are anonymized, and do not include track names or other
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
            onChange={action((e: React.ChangeEvent<HTMLInputElement>) =>
              set(config, {reportDebugEvents: e.target.checked})
            )}
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
  border-bottom: 1px solid ${p => p.theme.border};
  font-weight: 500;
`;

const Section = styled('section')`
  padding: 0.5rem 0;
  margin-left: 1.25rem;
  border-left: 1px solid ${p => p.theme.border};
`;

export default withStore(Settings);
