import * as React from 'react';
import ReactDOM from 'react-dom';
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
};

type RenderProps = {
  closeModal: () => void;
};

type Content = React.ReactNode | ((props: RenderProps) => React.ReactNode);

const defaultOptions: Options = {
  canClickOut: true,
  escapeCloses: true,
};

const useModal = (content: Content, options: Options = defaultOptions) => {
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

  const body = typeof content === 'function' ? content(renderProps) : content;

  const modal = ReactDOM.createPortal(
    <AnimatePresence>
      {body !== null && show && (
        <Modal>
          <Body ref={containerRef}>{body}</Body>
        </Modal>
      )}
    </AnimatePresence>,
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
