import {observer} from 'mobx-react';

import {OverlayDescriptor} from 'src/overlay';

type Config = {
  /**
   * Should the overlay do something
   */
  someOption: boolean;
};

const Overlay: React.FC<{config: Config}> = observer(() => (
  <div>This is an example overaly for reference</div>
));

const ConfigInterface: React.FC<{config: Config}> = observer(() => (
  <div>This is the config interface</div>
));

const Example: React.FC<{config?: Config}> = () => (
  <div>This is an example of the overlay</div>
);

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
