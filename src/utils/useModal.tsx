import * as React from 'react';
import ReactDOM from 'react-dom';
import {X} from 'react-feather';
import {useClickAway, useKey} from 'react-use';
import styled from '@emotion/styled';
import {AnimatePresence, motion} from 'framer-motion';

type Options = {
  /**
   * Does clicking outside of the modal close it?
   *
   * @default true
   */
  canClickOut?: boolean;
  /**
   * Does escape close the modal?
   *
   * @default true
   */
  escapeCloses?: boolean;
  /**
   * Show a close button on the modal
   */
  withCloseButton?: boolean;
};

type RenderProps = {
  Modal: React.ComponentType<React.ComponentProps<typeof motion.div>>;
  closeModal: () => void;
};

type Content = React.ComponentType<RenderProps>;

const defaultOptions: Options = {
  canClickOut: true,
  escapeCloses: true,
  withCloseButton: true,
};

const useModal = (Content: Content, options: Options = defaultOptions) => {
  const [show, setVisible] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useClickAway(containerRef, () => options.canClickOut && setVisible(false));
  useKey(
    key => key.key === 'Escape',
    () => options.escapeCloses && setVisible(false)
  );

  const renderProps = {
    closeModal: () => setVisible(false),
  };

  const ModalComponent: RenderProps['Modal'] = ({children, ...props}) => (
    <Modal>
      <CloseButton onClick={() => setVisible(false)} />
      <Body {...props} ref={containerRef}>
        {children}
      </Body>
    </Modal>
  );

  const content = show ? <Content Modal={ModalComponent} {...renderProps} /> : null;

  const modal = ReactDOM.createPortal(
    <AnimatePresence>{content}</AnimatePresence>,
    document.querySelector('body')!
  );

  return [modal, setVisible] as const;
};

export default useModal;

const Modal = styled(motion.div)`
  z-index: 10;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-app-region: drag;
`;

Modal.defaultProps = {
  initial: 'init',
  animate: 'animate',
  exit: 'init',
  transition: {duration: 0.15},
  variants: {
    init: {opacity: 0},
    animate: {opacity: 1},
  },
};

const Body = styled(motion.div)`
  background: ${p => p.theme.background};
  border-radius: 5px;
  box-shadow: 0 0 80px rgba(0, 0, 0, 0.05);
  padding: 1rem;
  font-family: Ubuntu;
  color: ${p => p.theme.primaryText};
  width: 600px;
  max-height: 60vh;
  overflow: scroll;

  p {
    font-size: 0.95rem;
    line-height: 1.4;

    &:last-child {
      margin: 0;
    }
  }

  hr {
    border: 0;
    background: ${p => p.theme.border};
    height: 1px;
  }
`;

Body.defaultProps = {
  variants: {
    init: {scale: 0.9, opacity: 0},
    animate: {scale: 1, opacity: 1},
  },
  transition: {type: 'spring', delay: 0.1, duration: 0.15},
};

const CloseButton = styled('button')`
  position: absolute;
  top: 3rem;
  right: 0.75rem;
  display: flex;
  align-items: center;
  border: 0;
  padding: 0.25rem;
  background: ${p => p.theme.background};
  border-radius: 5px;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.05);
  transition: opacity 200ms ease-in-out;
  opacity: 0.8;

  &:hover {
    opacity: 1;
  }
`;

CloseButton.defaultProps = {
  children: <X size="1rem" />,
};
