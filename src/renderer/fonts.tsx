import {css} from '@emotion/core';

import dmMonoRegular from 'src/fonts/DMMono-Regular.ttf';
import dmMonoMedium from 'src/fonts/DMMono-Medium.ttf';
import dmMonoLight from 'src/fonts/DMMono-Light.ttf';

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
`;
