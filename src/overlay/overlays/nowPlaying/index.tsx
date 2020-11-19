import * as React from 'react';
import styled from '@emotion/styled';
import {observer} from 'mobx-react';
import {set} from 'mobx';

import store from 'src/shared/store';
import {OverlayDescriptor} from 'src/overlay';

import useRandomHistory from 'src/utils/useRandomHistory';
import Checkbox from 'app/components/form/Checkbox';
import Text from 'app/components/form/Text';
import Field from 'app/components/form/Field';
import Select from 'src/renderer/components/form/Select';
import LiveHistoryIndicator from 'src/overlay/components/liveHistoryIndicator';

import {Tags, availableTags} from './tags';
import ThemeModern from './ThemeModern';

const themes = {
  modern: {label: 'Modern', component: ThemeModern},
} as const;

type Theme = keyof typeof themes;

type TaggedNowPlaying = {
  type: 'nowPlaying';
  config: NowPlayingConfig;
};

export type NowPlayingConfig = {
  /**
   * The selected theme to use
   */
  theme: Theme;
  /**
   * The number of history items to show
   */
  historyCount?: number;
  /**
   * Should the track metadata be aligned to the right of the window
   */
  alignRight?: boolean;
  /**
   * Don't display artwork
   */
  hideArtwork?: boolean;
  /**
   * The specific set of tags to display
   */
  tags?: Tags;
};

const Example: React.FC<{config?: NowPlayingConfig}> = observer(({config}) => {
  const demoHistory = useRandomHistory({cutoff: 5, updateInterval: 5000});
  const liveHistory = store.mixstatus.trackHistory;

  const history = liveHistory.length === 0 ? demoHistory : liveHistory;

  const theme = config?.theme ?? 'modern';
  const Overlay = themes[theme].component;

  const example =
    history.length === 0 ? (
      <EmptyExample />
    ) : (
      <Overlay config={config ?? {theme: 'modern'}} history={history.slice().reverse()} />
    );

  return (
    <React.Fragment>
      <LiveHistoryIndicator active={liveHistory.length > 0} />
      {example}
    </React.Fragment>
  );
});

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

const HistoryOverlay: React.FC<{config: NowPlayingConfig}> = observer(({config}) => {
  const Overlay = themes[config.theme].component;
  const history = store.mixstatus.trackHistory.slice().reverse();

  return <Overlay {...{history, config}} />;
});

const valueTransform = <T extends readonly string[]>(t: T) =>
  t.map(v => ({label: v, value: v}));

const ConfigInterface: React.FC<{config: NowPlayingConfig}> = observer(({config}) => (
  <div>
    <Field
      noCenter
      size="lg"
      name="Overlay Theme"
      description="Choose from a variety of different look and feels for the metadata."
    >
      <Select
        value={{value: config.theme, ...themes[config.theme]}}
        options={Object.entries(themes).map(([value, theme]) => ({value, ...theme}))}
        onChange={v => set(config, {theme: (v as {value: Theme}).value})}
      />
    </Field>
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
      name="Don't show artwork"
      description="Hides the artwork. Useful if you don't maintain artwork in your library."
    >
      <Checkbox
        checked={config.hideArtwork}
        onChange={() => set(config, {hideArtwork: !config.hideArtwork})}
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
      name="Additional Tags"
      description="Select the additional tags you want to show in the metadata. Emptying the list will stop any attributes from showing"
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
  type: 'nowPlaying',
  name: 'Live now playing metadata overlay, including themes',
  component: HistoryOverlay,
  example: Example,
  configInterface: ConfigInterface,
  defaultConfig: {
    theme: 'modern',
    historyCount: 4,
    tags: ['album', 'label', 'comment'],
  },
};

export default descriptor;
