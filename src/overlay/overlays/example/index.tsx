import * as React from 'react';
import {observer} from 'mobx-react';

import {OverlayDescriptor} from 'src/overlay';

type Config = {
  /**
   * Should the
   */
  alginRight: boolean;
};

const Overlay: React.FC<{config: Config}> = observer(() => {
  return <div>This is a cue counter</div>;
});

const ConfigInterface: React.FC<{config: Config}> = observer(() => {
  return <div>This is the config interface</div>;
});

const Example: React.FC<{config?: Config}> = () => {
  return <div>This is an example of the </div>;
};

export type ExampleOverlay = {
  type: 'example';
  config: Config;
};

const descriptor: OverlayDescriptor<ExampleOverlay> = {
  type: 'example',
  name: 'Example Overlay Configuration',
  component: Overlay,
  configInterface: ConfigInterface,
  example: Example,
  defaultConfig: {},
};

export default descriptor;
