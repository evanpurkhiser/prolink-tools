import * as React from 'react';
import styled from '@emotion/styled';
import {AnimatePresence} from 'framer-motion';
import {observer} from 'mobx-react';
import {set} from 'mobx';

import store, {PlayedTrack} from 'src/shared/store';
import {OverlayDescriptor} from 'src/overlay';

import Track, {Tags, availableTags} from './Track';
import useRandomHistory from 'src/utils/useRandomHistory';
import Checkbox from 'app/components/form/Checkbox';
import Text from 'app/components/form/Text';
import Field from 'app/components/form/Field';
import Select from 'src/renderer/components/form/Select';

type TaggedNowPlaying = {
  type: 'taggedNowPlaying';
  config: Config;
};

type Config = {
  /**
   * The number of history items to show
   */
  historyCount: number;
  /**
   * Should the track metadata be aligned to the right of the window.
   */
  alignRight?: boolean;
  /**
   * The specific set of tags to display
   */
  tags?: Tags;
};

const CurrentTrack = ({played, ...p}: React.ComponentProps<typeof Track>) => (
  <CurrentWrapper>
    <AnimatePresence>
      {played && <Track played={played} key={played.playedAt.toString()} {...p} />}
    </AnimatePresence>
  </CurrentWrapper>
);

CurrentTrack.defaultProps = {
  variants: {
    enter: {
      x: 0,
      transition: {
        when: 'beforeChildren',
        delay: 0.3,
      },
    },
  },
};

type Props = {
  config: Config;
  history: PlayedTrack[];
};

const Overlay: React.FC<Props> = observer(({config, history}) => {
  console.log(history);
  return history.length === 0 ? null : (
    <React.Fragment>
      <CurrentTrack
        alignRight={config.alignRight}
        tags={config.tags}
        firstPlayed={store.mixstatus.trackHistory.length === 1}
        played={history[0]}
      />
      {config.historyCount > 0 && history.length > 1 && (
        <RecentWrapper>
          <AnimatePresence>
            {history.slice(1, config.historyCount + 1).map(track => (
              <Track
                mini
                positionTransition
                alignRight={config.alignRight}
                played={track}
                variants={{exit: {display: 'none'}}}
                key={`${track.playedAt}-${track.track.id}`}
              />
            ))}
          </AnimatePresence>
        </RecentWrapper>
      )}
    </React.Fragment>
  );
});

const RecentWrapper = styled('div')`
  display: grid;
  grid-gap: 14px;
  margin-top: 2rem;
`;

const CurrentWrapper = styled('div')`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  > * {
    grid-column: 1;
    grid-row: 1;
  }
`;

const EmptyExample = styled('div')`
  height: 80px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;

  &:after {
    color: #aaa;
    content: 'loading exmaple demo';
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
  }
`;

const Example: React.FC<{config?: Config}> = ({config}) => {
  const history = useRandomHistory({cutoff: 5, updateInterval: 5000});

  console.log(history);

  return history.length === 0 ? (
    <EmptyExample />
  ) : (
    <Overlay config={config ?? {historyCount: 0}} history={history.slice().reverse()} />
  );
};

const HistoryOverlay: React.FC<{config: Config}> = observer(({config}) => (
  <Overlay history={store.mixstatus.trackHistory.slice().reverse()} config={config} />
));

const valueTransform = <T extends string[]>(t: T) => t.map(v => ({label: v, value: v}));

const ConfigInterface: React.FC<{config: Config}> = observer(({config}) => (
  <div>
    <Field
      size="sm"
      name="Align to right side"
      description="Display the history and now playing details aligned towards the right of the screen."
    >
      <Checkbox
        checked={config.alignRight}
        onChange={() => set(config, {alignRight: !config.alignRight})}
      />
    </Field>
    <Field
      size="sm"
      name="History items shown"
      description="Number of history items to show below the now playing metadata. You can set this to 0 to completely disable displaying history."
    >
      <Text
        type="number"
        style={{textAlign: 'center', appearance: 'textfield'}}
        value={config.historyCount}
        onChange={e => set(config, {historyCount: Math.max(0, Number(e.target.value))})}
      />
    </Field>
    <Field
      size="full"
      description="Select the tags you want to show on the bottom row of the now playing detail"
    >
      <Select
        isMulti
        placeholder="Add metadata items to display..."
        options={valueTransform(availableTags)}
        value={valueTransform(config.tags ?? [])}
        onChange={values => set(config, {tags: values?.map((v: any) => v.value) ?? []})}
      />
    </Field>
  </div>
));

const descriptor: OverlayDescriptor<TaggedNowPlaying> = {
  type: 'taggedNowPlaying',
  name: 'Now playing with tags',
  component: HistoryOverlay,
  example: Example,
  configInterface: ConfigInterface,
  defaultConfig: {
    historyCount: 4,
    tags: ['album', 'label', 'comment'],
  },
};

export default descriptor;
