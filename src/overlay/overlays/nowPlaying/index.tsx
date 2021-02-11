import * as React from 'react';
import {Link} from 'react-router-dom';
import styled from '@emotion/styled';
import {action, set} from 'mobx';
import {observer} from 'mobx-react';

import {OverlayDescriptor} from 'src/overlay';
import DemoSwitch from 'src/overlay/components/demoSwitch';
import LiveHistoryIndicator from 'src/overlay/components/liveHistoryIndicator';
import Select from 'src/renderer/components/form/Select';
import {AppConfig, AppStore, PlayedTrack} from 'src/shared/store';
import useRandomHistory from 'src/utils/useRandomHistory';
import withStore from 'src/utils/withStore';
import Checkbox from 'ui/components/form/Checkbox';
import Field from 'ui/components/form/Field';
import Text from 'ui/components/form/Text';

import ColorConfig from './ColorConfig';
import {availableTags, Tags} from './tags';
import themeAsot from './ThemeAsot';
import themeModern from './ThemeModern';

const themes = {
  tracklist: themeModern,
  asot: themeAsot,
} as const;

type Theme = keyof typeof themes;

type TaggedNowPlaying = {
  type: 'nowPlaying';
  config: NowPlayingConfig;
};

export type ThemeComponentProps = {
  appConfig: AppConfig;
  config: NowPlayingConfig;
  history: PlayedTrack[];
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
  /**
   * Customized theme colors
   */
  colors?: Record<string, string>;
  /**
   * Indicates that ID tracks should be hidden
   */
  maskId?: boolean;
  /**
   * When demo mode is enabled, the live overlay will _always_ show demo data
   */
  demoMode?: boolean;
};

export type ThemeDescriptor = {
  /**
   * The display name of the theme
   */
  label: string;
  /**
   * The component used to render the 'now playing' indicator
   */
  component: React.ComponentType<ThemeComponentProps>;
  /**
   * Defaults for CSS variables to allow for color customization
   */
  colors: Record<string, string>;
  /**
   * Enabled settings for this theme
   */
  enabledConfigs: Exclude<keyof NowPlayingConfig, 'theme'>[];
};

type ExampleProps = {
  store: AppStore;
  config?: NowPlayingConfig;
  hideControls?: boolean;
};

const Example: React.FC<ExampleProps> = observer(({store, config, hideControls}) => {
  const liveHistory = store.mixstatus.trackHistory;
  const isLive = liveHistory.length > 0;

  const demoHistory = useRandomHistory({
    enabled: !isLive,
    cutoff: 5,
    updateInterval: 5000,
  });

  const history = isLive ? liveHistory : demoHistory;

  const theme = config?.theme ?? 'tracklist';
  const Overlay = themes[theme].component;

  const example =
    history.length === 0 ? (
      <EmptyExample />
    ) : (
      <Overlay
        appConfig={store.config}
        config={config ?? {theme: 'tracklist'}}
        history={history.slice().reverse()}
      />
    );

  return hideControls ? (
    example
  ) : (
    <React.Fragment>
      {config && !isLive && <DemoSwitch config={config} />}
      <LiveHistoryIndicator active={isLive} />
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

type OverlayProps = {
  config: NowPlayingConfig;
  store: AppStore;
};

const NowPlayingOverlay: React.FC<OverlayProps> = observer(({store, config}) => {
  const Overlay = themes[config.theme].component;
  const history = store.mixstatus.trackHistory.slice().reverse();

  return config.demoMode ? (
    <Example store={store} config={config} hideControls />
  ) : (
    <Overlay appConfig={store.config} {...{history, config}} />
  );
});

const valueTransform = <T extends readonly string[]>(t: T) =>
  t.map(v => ({label: v, value: v}));

const ConfigInterface: React.FC<{config: NowPlayingConfig}> = observer(({config}) => {
  const {enabledConfigs, colors} = themes[config.theme];

  return (
    <div>
      <Field
        noCenter
        size="lg"
        name="Overlay Theme"
        description="Choose from various different looks and feels."
      >
        <Select
          value={{value: config.theme, ...themes[config.theme]}}
          options={Object.entries(themes).map(([value, theme]) => ({value, ...theme}))}
          onChange={action((v: any) => set(config, {theme: v.value}))}
        />
      </Field>
      {enabledConfigs.includes('alignRight') && (
        <Field
          size="sm"
          name="Align to right side"
          description="Display the history and now playing details aligned towards the right of the screen."
        >
          <Checkbox
            checked={config.alignRight}
            onChange={action(() => set(config, {alignRight: !config.alignRight}))}
          />
        </Field>
      )}
      {enabledConfigs.includes('hideArtwork') && (
        <Field
          size="sm"
          name="Don't show artwork"
          description="Hides the artwork. Useful if you don't maintain artwork in your library."
        >
          <Checkbox
            checked={config.hideArtwork}
            onChange={action(() => set(config, {hideArtwork: !config.hideArtwork}))}
          />
        </Field>
      )}
      {enabledConfigs.includes('maskId') && (
        <Field
          size="sm"
          name="Mask IDs"
          description={
            <React.Fragment>
              Do not display metadata for tracks marked as IDs. Configure track ID
              detection in <Link to="/settings">the settings panel</Link>.
            </React.Fragment>
          }
        >
          <Checkbox
            checked={config.maskId}
            onChange={action(() => set(config, {maskId: !config.maskId}))}
          />
        </Field>
      )}
      {enabledConfigs.includes('historyCount') && (
        <Field
          size="sm"
          name="History items shown"
          description="Number of history items to show below the now playing metadata. You can set this to 0 to completely disable displaying history."
          noCenter
        >
          <Text
            type="number"
            style={{textAlign: 'center', appearance: 'textfield'}}
            value={config.historyCount}
            onChange={action((e: React.ChangeEvent<HTMLInputElement>) =>
              set(config, {historyCount: Math.max(0, Number(e.target.value))})
            )}
          />
        </Field>
      )}
      {enabledConfigs.includes('tags') && (
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
            onChange={action((values: any) =>
              set(config, {tags: values?.map((v: any) => v.value) ?? []})
            )}
          />
        </Field>
      )}
      {enabledConfigs.includes('colors') && Object.keys(colors).length > 0 && (
        <Field
          size="full"
          name="Theme Colors"
          htmlFor="none"
          description="Customize the colors of this now playing theme"
        >
          <ColorConfig trimPrefix="--pt-np-" config={config} defaultColors={colors} />
        </Field>
      )}
    </div>
  );
});

const descriptor: OverlayDescriptor<TaggedNowPlaying> = {
  type: 'nowPlaying',
  name: 'Live now playing metadata overlay, including themes',
  component: withStore(NowPlayingOverlay),
  example: withStore(Example),
  configInterface: ConfigInterface,
  defaultConfig: {
    theme: 'tracklist',
    historyCount: 4,
    maskId: true,
    tags: ['album', 'label', 'comment'],
  },
};

export default descriptor;
