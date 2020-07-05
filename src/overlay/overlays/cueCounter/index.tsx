import * as React from 'react';
import styled from '@emotion/styled';

import {OverlayDescriptor} from 'src/overlay';

type Config = {
  /**
   * Does it catch fire
   */
  showFire: boolean;
};

const Overlay: React.FC<{config: Config}> = () => {
  return <div>This is a cue counter</div>;
};

const Example: React.FC<{config?: Config}> = () => {
  return <div>This is a cue counter</div>;
};

export type CueCounter = {
  type: 'cueCounter';
  config: Config;
};

const descriptor: OverlayDescriptor<CueCounter> = {
  type: 'cueCounter',
  name: 'Cue counter',
  component: Overlay,
  example: Example,
  defaultConfig: {},
};

export default descriptor;
