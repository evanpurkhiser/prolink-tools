import * as React from 'react';
import {Global} from '@emotion/core';
import styled from '@emotion/styled';
import {motion, Variants} from 'framer-motion';

import {AppleLogo} from 'src/shared/components/Icons';

import globalCss from 'src/shared/globalCss';
import Title from './components/Title';
import appImage from './assets/app.png';
import appVideo from './assets/clip.webm';

const animateInfo: Variants = {
  initial: {
    opacity: 0,
    y: 30,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
};

const animateApp: Variants = {
  initial: {
    x: -40,
    opacity: 0,
    boxShadow: '0 0 80px rgba(0,0,0,0.05)',
  },
  animate: {
    x: 0,
    opacity: 1,
    boxShadow: '0 0 40px rgba(0,0,0,0.15)',
    transition: {
      scale: {
        type: 'spring',
        stiffness: 400,
        damping: 15,
        restDelta: 0,
      },
    },
  },
};

const Application = () => (
  <React.Fragment>
    <Global styles={globalCss} />

    <HeroLanding
      initial="initial"
      animate="animate"
      variants={{animate: {transition: {delayChildren: 0.2, staggerChildren: 0.2}}}}
    >
      <Intro>
        <Title variants={animateInfo} />
        <Tagline variants={animateInfo}>bring your live stream sets to life</Tagline>
        <Description variants={animateInfo}>
          built by DJs, for DJs. prolink tools is a suite of fun and useful scripts to
          enhance your live stream productions.
        </Description>

        <DownloadCta variants={animateInfo}>
          <DownloadButton>
            <AppleLogo />
            download for macos
          </DownloadButton>

          <VersionTag>
            latest version 0.1.0
            <small>06-21-2020</small>
          </VersionTag>
        </DownloadCta>
      </Intro>
      <Spotlight>
        <AppPreview variants={animateApp}>
          <video autoPlay muted playsInline loop src={appVideo} />
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
`;

const Intro = styled('div')`
  letter-spacing: -0.75px;
  max-width: 620px;
  padding: 0 4rem;
  justify-self: end;
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

const DownloadCta = styled(motion.div)``;

const DownloadButton = styled('button')`
  font-family: 'DM Mono';
  letter-spacing: -0.75px;
  font-size: 1rem;
  background: #f84b4b;
  color: #fff;
  padding: 0.5rem 0.75rem;
  display: grid;
  grid-auto-flow: column;
  grid-gap: 0.5rem;
  border: 0;
  align-items: center;
  border-radius: 2px;
  cursor: pointer;
  transition: background 200ms ease-in-out;

  &:hover {
    background: #e54949;
  }
`;

const VersionTag = styled('div')`
  font-size: 0.875rem;
  margin-top: 0.75rem;

  small {
    display: block;
    font-weight: 300;
    line-height: 2;
    color: #939393;
  }
`;

const Spotlight = styled('div')`
  position: relative;
  display: flex;
  height: 100%;
  align-items: center;

  &:before {
    content: '';
    display: block;
    position: absolute;
    background: #f6f6f6;
    top: 0;
    left: 40px;
    right: 0;
    bottom: 0;
    z-index: -1;
    transform: skewX(-5deg);
    transform-origin: 0 100%;
  }
`;

const AppPreview = styled(motion.div)`
  display: block;
  margin-left: -20px;
  width: 700px;
  height: 376px;
  border-radius: 5px;
  background-color: #fff;
  background-image: url(${appImage});
  overflow: hidden;

  video {
    height: 100%;
    clip-path: inset(31px 0 40px 0);
  }
`;

export default Application;
