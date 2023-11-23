import {useTimeout} from 'react-use';
import {keyframes} from '@emotion/react';
import styled from '@emotion/styled';
import {motion} from 'framer-motion';

const ConnectingSplash = () => {
  const [showHelp] = useTimeout(10000);

  return (
    <Container>
      <Text layout transition={{duration: 0.2}}>
        <Indicator />
        Waiting for PROLINK devices
      </Text>
      {showHelp() && (
        <Help initial={{y: 20, opacity: 0}} animate={{y: 0, opacity: 1}}>
          Not seeing your CDJs? Ensure they are <strong>ON</strong> and connected to the{' '}
          <strong>same network</strong> as this computer. If they are simply linked to one
          another they will need to be plugged into your network router. Also make sure
          you have allowed this app in your <strong>System Firewall</strong>.{' '}
          <a href="https://prolink.tools/manual">Read the manual</a>.
        </Help>
      )}
    </Container>
  );
};

const Container = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  min-height: 200px;
  flex-grow: 1;
  flex-direction: column;
`;

const Text = styled(motion.div)`
  display: grid;
  grid-template-columns: max-content 1fr;
  grid-gap: 1rem;
  align-items: center;
  font-size: 0.8rem;
  text-transform: uppercase;
  font-weight: 500;
`;

const Help = styled(motion.p)`
  font-family: Ubuntu;
  font-size: 0.8rem;
  color: #888;
  max-width: 420px;
  font-weight: 400;
  line-height: 1.4;
`;

const pulse = keyframes`
  0% {
    transform: scale(0.1);
    opacity: 1
  }

  40%, 100% {
    transform: scale(0.8);
    opacity: 0;
  }
`;

const Indicator = styled('div')`
  height: 10px;
  width: 10px;
  border-radius: 50%;
  background: #f95757;
  position: relative;

  &:before {
    content: '';
    display: block;
    position: absolute;
    height: 100px;
    width: 100px;
    border-radius: 50%;
    top: -50px;
    left: -50px;
    border: 4px solid #f95757;
    margin: 1px;
    transform-origin: center;
    animation: ${pulse} 3s ease-out infinite;
  }
`;

export default ConnectingSplash;
