import {css} from '@emotion/core';

import dmMonoRegular from 'src/fonts/DMMono-Regular.ttf';
import dmMonoMedium from 'src/fonts/DMMono-Medium.ttf';
import dmMonoLight from 'src/fonts/DMMono-Light.ttf';

import ubuntuRegular from 'src/fonts/Ubuntu-Regular.ttf';
import ubuntuMedium from 'src/fonts/Ubuntu-Medium.ttf';
import ubuntuBold from 'src/fonts/Ubuntu-Bold.ttf';

export default css`
  @font-face {
    font-family: 'DM Mono';
    src: url(${dmMonoLight}) format('truetype');
    font-weight: 300;
  }
  @font-face {
    font-family: 'DM Mono';
    src: url(${dmMonoRegular}) format('truetype');
    font-weight: 400;
  }
  @font-face {
    font-family: 'DM Mono';
    src: url(${dmMonoMedium}) format('truetype');
    font-weight: 500;
  }

  @font-face {
    font-family: 'Ubuntu';
    src: url(${ubuntuRegular}) format('truetype');
    font-weight: 400;
  }
  @font-face {
    font-family: 'Ubuntu';
    src: url(${ubuntuMedium}) format('truetype');
    font-weight: 500;
  }
  @font-face {
    font-family: 'Ubuntu';
    src: url(${ubuntuBold}) format('truetype');
    font-weight: 600;
  }
`;
