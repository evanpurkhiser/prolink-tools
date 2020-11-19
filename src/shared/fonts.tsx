import {css} from '@emotion/core';

import dmMonoRegular from 'src/fonts/DMMono-Regular.ttf';
import dmMonoMedium from 'src/fonts/DMMono-Medium.ttf';
import dmMonoLight from 'src/fonts/DMMono-Light.ttf';

import ubuntuRegular from 'src/fonts/Ubuntu-Regular.ttf';
import ubuntuMedium from 'src/fonts/Ubuntu-Medium.ttf';
import ubuntuBold from 'src/fonts/Ubuntu-Bold.ttf';

import proximaNovaRegular from 'src/fonts/ProximaNova-Regular.ttf';
import proximaNovaRegularIt from 'src/fonts/ProximaNova-Regular.ttf';
import proximaNovaSemibold from 'src/fonts/ProximaNova-Semibold.ttf';
import proximaNovaSemiboldIt from 'src/fonts/ProximaNova-SemiboldIt.ttf';
import proximaNovaBold from 'src/fonts/ProximaNova-Bold.ttf';
import proximaNovaBoldIt from 'src/fonts/ProximaNova-BoldIt.ttf';

export default css`
  /* DM Mono */
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

  /* Ubuntu */
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

  /* ProximaNova */
  @font-face {
    font-family: 'Proxmia Nova';
    src: url(${proximaNovaRegular}) format('truetype');
    font-weight: 400;
  }
  @font-face {
    font-family: 'Proxmia Nova';
    src: url(${proximaNovaRegularIt}) format('truetype');
    font-weight: 400;
    font-style: italic;
  }
  @font-face {
    font-family: 'Proxmia Nova';
    src: url(${proximaNovaSemibold}) format('truetype');
    font-weight: 500;
  }
  @font-face {
    font-family: 'Proxmia Nova';
    src: url(${proximaNovaSemiboldIt}) format('truetype');
    font-weight: 500;
    font-style: italic;
  }
  @font-face {
    font-family: 'Proxmia Nova';
    src: url(${proximaNovaBold}) format('truetype');
    font-weight: 600;
  }
  @font-face {
    font-family: 'Proxmia Nova';
    src: url(${proximaNovaBoldIt}) format('truetype');
    font-weight: 600;
    font-style: italic;
  }
`;
