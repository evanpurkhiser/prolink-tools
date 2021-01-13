import {css} from '@emotion/react';

import dmMonoLight from 'src/assets/fonts/DMMono-Light.ttf';
import dmMonoMedium from 'src/assets/fonts/DMMono-Medium.ttf';
import dmMonoRegular from 'src/assets/fonts/DMMono-Regular.ttf';
import proximaNovaBold from 'src/assets/fonts/ProximaNova-Bold.ttf';
import proximaNovaBoldIt from 'src/assets/fonts/ProximaNova-BoldIt.ttf';
import proximaNovaRegular from 'src/assets/fonts/ProximaNova-Regular.ttf';
import proximaNovaRegularIt from 'src/assets/fonts/ProximaNova-RegularIt.ttf';
import proximaNovaSemibold from 'src/assets/fonts/ProximaNova-Semibold.ttf';
import proximaNovaSemiboldIt from 'src/assets/fonts/ProximaNova-SemiboldIt.ttf';
import ubuntuBold from 'src/assets/fonts/Ubuntu-Bold.ttf';
import ubuntuMedium from 'src/assets/fonts/Ubuntu-Medium.ttf';
import ubuntuRegular from 'src/assets/fonts/Ubuntu-Regular.ttf';

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
