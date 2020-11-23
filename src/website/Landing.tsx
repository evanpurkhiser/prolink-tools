import * as React from 'react';
import {Global} from '@emotion/core';
import styled from '@emotion/styled';
import {motion, Variants} from 'framer-motion';

import globalCss, {noSelect} from 'src/shared/globalCss';
import Application from 'src/renderer/views/Application';
import Title from './components/Title';
import DownloadCta from './components/DownloadCta';
import playingTracks from './demo/playingTracks';

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

const Landing = () => (
  <React.Fragment>
    <Global styles={globalCss} />

    <HeroLanding
      initial="initial"
      animate="animate"
      variants={{animate: {transition: {delayChildren: 0.2, staggerChildren: 0.15}}}}
      onAnimationStart={() => {
        playingTracks();
      }}
    >
      <Intro>
        <Title variants={animateInfo} />
        <Tagline variants={animateInfo}>tap into your CDJs in real-time</Tagline>
        <Description variants={animateInfo}>
          built by a DJ, for DJs. prolink tools is a hand-built collection of tools to
          hook into real-time performance data to enhance your sets.
        </Description>

        <DownloadCta variants={animateInfo} />
      </Intro>
      <Spotlight
        variants={{animate: {transition: {delayChildren: 0.8, staggerChildren: 0}}}}
      >
        <SpotlightShade />
        <Demo>
          <DemoContainer>
            <Application />
          </DemoContainer>
        </Demo>
      </Spotlight>
    </HeroLanding>
  </React.Fragment>
);

const HeroLanding = styled(motion.section)`
  display: grid;
  grid-template-columns: 0.85fr 1fr;
  grid-gap: 2rem;
  padding: var(--padding) 0;
  overflow: hidden;
  height: 100vh;
  max-height: 800px;
  align-items: center;

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

SpotlightShade.defaultProps = {
  variants: {
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
  },
};

const DemoContainer = styled('div')`
  position: relative;
  border-radius: 5px;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.15);
  background-color: #fff;
  overflow: hidden;

  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-height: 100%;

  ${noSelect};
  pointer-events: none;
  @media only screen and (max-width: 800px) {
    transform: scale(0.7);
    margin: -10% -20%;
  }
`;

const Demo = styled(motion.div)`
  display: block;
  max-width: 700px;
  max-height: 380px;
  width: 100%;
  height: 100%;
  margin-left: -20px;

  @media only screen and (max-width: 1200px) {
    margin-left: 0;
    justify-self: center;
  }
`;

Demo.defaultProps = {
  variants: {
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
  },
};

export default Landing;
