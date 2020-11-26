import * as React from 'react';
import styled from '@emotion/styled';
import {motion} from 'framer-motion';

import useStoreActivity from 'src/utils/useStoreActivity';

type Props = React.ComponentProps<typeof motion.div>;

const ActivityLink = (props: Props) => {
  const [blip] = useStoreActivity({
    targetTest: path => path === 'mixstatus/trackHistory',
    blipTime: 1000,
  });

  const makeAnimate = (baseColor: string) =>
    blip
      ? {color: '#F84B4B', transition: {duration: 0.1}}
      : {color: baseColor, transition: {duration: 3}};

  return (
    <Container {...props}>
      <motion.div
        style={{clipPath: 'inset(0 0 60px 0)'}}
        animate={makeAnimate('#71696C')}
      >
        <Graphic />
      </motion.div>
      <motion.div
        style={{clipPath: 'inset(152px 0 0 0)'}}
        animate={makeAnimate('#E5E1E2')}
      >
        <Graphic />
      </motion.div>
    </Container>
  );
};

export default ActivityLink;

const Graphic = (p: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="1268"
    height="212"
    viewBox="0 0 1268 212"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...p}
  >
    <circle cx="109" cy="205" r="6" stroke="currentColor" strokeWidth="2" />
    <path
      d="M918 18V87.7579C918 98.8036 909.049 107.758 898.004 107.758C896.051 107.758 893.965 107.758 891.751 107.758C770.542 107.758 265.307 107.758 134.199 107.758C132.394 107.758 130.66 107.758 128.999 107.758C117.954 107.758 109 116.719 109 127.764C109 164.411 109 192 109 192"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      strokeDasharray="5 3"
    />
    <circle cx="918" cy="7" r="6" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const Container = styled(motion.div)`
  height: 212px;
  display: grid;
  justify-content: center;
  margin-top: -180px;
  margin-bottom: -60px;
  position: relative;

  @media only screen and (max-width: 1200px) {
    display: none;
  }

  > div {
    grid-column: 1;
    grid-row: 1;
  }
`;
