import * as React from 'react';
import {Global} from '@emotion/core';
import styled from '@emotion/styled';
import {motion, Variants} from 'framer-motion';

import globalCss from 'src/shared/globalCss';
import Title from './components/Title';
import DownloadCta from './components/DownloadCta';
import appImage from './assets/app.png';
import appVideo from './assets/clip.webm';
import {GITHUB_REPO_URL} from './constants';

const animateInfo: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
};

const animateApp: Variants = {
  initial: {
    x: -80,
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 18,
    },
  },
};

const animateShade: Variants = {
  initial: {
    x: 120,
    opacity: 0,
    skewX: '0deg',
  },
  animate: {
    x: 0,
    opacity: 1,
    skewX: '-5deg',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 18,
    },
  },
};

const Application = () => (
  <React.Fragment>
    <Global styles={globalCss} />

    <HeroLanding
      initial="initial"
      animate="animate"
      variants={{animate: {transition: {delayChildren: 0.2, staggerChildren: 0.15}}}}
    >
      <Intro>
        <Title variants={animateInfo} />
        <Tagline variants={animateInfo}>bring your live stream sets to life</Tagline>
        <Description variants={animateInfo}>
          built by DJs, for DJs. prolink tools is a suite of fun and useful scripts to
          enhance your live stream productions.
        </Description>

        <DownloadCta variants={animateInfo} />
      </Intro>
      <Spotlight
        variants={{animate: {transition: {delayChildren: 0.8, staggerChildren: 0}}}}
      >
        <SpotlightShade variants={animateShade} />
        <AppPreview variants={animateApp}>
          <PreviewContainer>
            <video autoPlay muted playsInline loop src={appVideo} />
          </PreviewContainer>
        </AppPreview>
      </Spotlight>
    </HeroLanding>
  </React.Fragment>
);

const HeroLanding = styled(motion.div)`
  height: 100vh;
  max-height: 800px;
  display: grid;
  align-items: center;
  grid-template-columns: 0.85fr 1fr;
  grid-gap: 2rem;

  --padding: 4rem;

  @media only screen and (max-width: 1200px) {
    grid-template: 1fr 1fr /1fr;
    --padding: 2rem;
  }
`;

const Intro = styled('div')`
  letter-spacing: -0.75px;
  max-width: 620px;
  padding: 0 var(--padding);
  justify-self: end;

  @media only screen and (max-width: 1200px) {
    justify-self: center;
    max-width: calc(700px + var(--padding) * 2);
  }
`;

const Tagline = styled(motion.h2)`
  font-size: 1.5rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
  margin-top: 1.75rem;
`;

const Description = styled(motion.p)`
  margin-bottom: 3rem;
`;

const Spotlight = styled(motion.div)`
  position: relative;
  display: flex;
  height: 100%;
  align-items: center;

  @media only screen and (max-width: 1200px) {
    justify-content: center;
    padding: 0 var(--padding);
  }
`;

const SpotlightShade = styled(motion.div)`
  display: block;
  position: absolute;
  background: #f6f6f6;
  top: 0;
  left: 40px;
  right: 0;
  bottom: 0;
  z-index: -1;
  transform-origin: 0 100%;
  margin: 60px;
  margin-right: 0;

  @media only screen and (max-width: 1200px) {
    right: calc(-1 * var(--padding));
  }
`;

const PreviewContainer = styled('div')`
  position: relative;
  padding-top: calc(376 / 700 * 100%);
  border-radius: 5px;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.15);
  background-color: #fff;
  background-image: url(${appImage});
  background-size: contain;
  overflow: hidden;

  video {
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0;
    clip-path: inset(12% 0 12% 0);
  }
`;

const AppPreview = styled(motion.div)`
  display: block;
  max-width: 700px;
  width: 100%;
  margin-left: -20px;

  @media only screen and (max-width: 1200px) {
    margin-left: 0;
    justify-self: center;
  }
`;

export default Application;
