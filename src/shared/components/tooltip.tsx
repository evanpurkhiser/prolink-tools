import React from 'react';
import ReactDOM from 'react-dom';
import {PopperProps, usePopper} from 'react-popper';
import {useTheme} from '@emotion/react';
import styled from '@emotion/styled';
import * as PopperJS from '@popperjs/core';
import {AnimatePresence, motion, MotionStyle} from 'framer-motion';
import memoize from 'lodash/memoize';

export const OPEN_DELAY = 50;

/**
 * How long to wait before closing the tooltip when isHoverable is set
 */
const CLOSE_DELAY = 50;

type Props = {
  /**
   * Position for the tooltip.
   *
   * @default top
   */
  position?: PopperJS.Placement;
  /**
   * Display mode for the container element
   */
  containerDisplayMode?: React.CSSProperties['display'];
  /**
   * The node to attach the Tooltip to
   */
  children: React.ReactNode;
  /**
   * The content to show in the tooltip popover
   */
  title: React.ReactNode;
  /**
   * Additional style rules for the tooltip content.
   */
  tooltipStyles?: React.CSSProperties;
  /**
   * Time to wait (in milliseconds) before showing the tooltip
   */
  delay?: number;
  /**
   * If true, user is able to hover tooltip without it disappearing.
   * (nice if you want to be able to copy tooltip contents to clipboard)
   */
  isHoverable?: boolean;
  /**
   * If child node supports ref forwarding, you can skip apply a wrapper
   */
  skipWrapper?: boolean;
  /**
   * Stops tooltip from being opened during tooltip visual acceptance.
   * Should be set to true if tooltip contains unisolated data (eg. dates)
   */
  className?: string;
};

/**
 * Used to compute the transform origin to give the scale-down micro-animation
 * a pleasant feeling. Without this the animation can feel somewhat 'wrong'.
 */
function computeOriginFromArrow(
  placement: PopperProps<any>['placement'],
  arrowState: PopperJS.State['modifiersData']['arrow']
): MotionStyle {
  if (!arrowState) {
    return {};
  }

  // XXX: Bottom means the arrow will be pointing up
  switch (placement) {
    case 'top':
      return {originX: `${arrowState.x}px`, originY: '100%'};
    case 'bottom':
      return {originX: `${arrowState.x}px`, originY: 0};
    case 'left':
      return {originX: '100%', originY: `${arrowState.y}px`};
    case 'right':
      return {originX: 0, originY: `${arrowState.y}px`};
    default:
      return {originX: `50%`, originY: '100%'};
  }
}

const getPortal = memoize(() => {
  const container = document.querySelector('#tooltip_container');
  if (container) {
    return container;
  }

  const portal = document.createElement('aside');
  portal.setAttribute('id', 'tooltip_portal');
  portal.setAttribute(
    'style',
    'position: absolute; top: 0; left: 0; bottom: 0; right: 0; pointer-events: none;'
  );
  document.body.appendChild(portal);

  return portal;
});

const Tooltip: React.FC<Props> = ({
  children,
  title,
  tooltipStyles,
  isHoverable,
  skipWrapper,
  className,
  delay = 0,
  position = 'top',
  containerDisplayMode = 'inline-block',
}) => {
  const [isOpen, setOpen] = React.useState(false);
  const theme = useTheme();

  const [referenceEl, setReferenceEl] = React.useState<HTMLElement | null>(null);
  const [tooltipEl, setTooltipEl] = React.useState<HTMLDivElement | null>(null);

  const {styles, state} = usePopper(referenceEl, tooltipEl, {
    placement: 'top',
    modifiers: [{name: 'arrow'}, {name: 'offset', options: {offset: [0, 5]}}],
  });

  const setClose = () => setOpen(false);

  let delayTimeout: number | null = null;
  let delayHideTimeout: number | null = null;

  const handleOpen = () => {
    if (delayHideTimeout) {
      window.clearTimeout(delayHideTimeout);
      delayHideTimeout = null;
    }

    if (delay === 0) {
      setOpen(true);
      return;
    }

    delayTimeout = window.setTimeout(setOpen, delay ?? OPEN_DELAY);
  };

  const handleClose = () => {
    if (delayTimeout) {
      window.clearTimeout(delayTimeout);
      delayTimeout = null;
    }

    if (isHoverable) {
      delayHideTimeout = window.setTimeout(setClose, CLOSE_DELAY);
    } else {
      setClose();
    }
  };

  const renderTrigger = (children: React.ReactNode, ref: React.Ref<HTMLElement>) => {
    const propList: {[key: string]: any} = {
      onFocus: handleOpen,
      onBlur: handleClose,
      onMouseEnter: handleOpen,
      onMouseLeave: handleClose,
    };

    // Use the `type` property of the react instance to detect whether we
    // have a basic element (type=string) or a class/function component (type=function or object)
    // Because we can't rely on the child element implementing forwardRefs we wrap
    // it with a span tag so that popper has ref

    if (
      React.isValidElement(children) &&
      (skipWrapper || typeof children.type === 'string')
    ) {
      // Basic DOM nodes can be cloned and have more props applied.
      return React.cloneElement(children, {
        ...propList,
        ref,
      });
    }

    propList.containerDisplayMode = containerDisplayMode;
    return (
      <Container {...propList} className={className} ref={ref}>
        {children}
      </Container>
    );
  };

  const tip = isOpen ? (
    <PositionWrapper style={styles.popper} ref={setTooltipEl}>
      <TooltipContent
        initial={{opacity: 0}}
        animate={{
          opacity: 1,
          scale: 1,
          transition: {type: 'linear', ease: [0.5, 1, 0.89, 1], duration: 0.2},
        }}
        exit={{
          opacity: 0,
          scale: 0.95,
          transition: {type: 'spring', delay: 0.1},
        }}
        style={computeOriginFromArrow(position, state?.modifiersData.arrow)}
        transition={{duration: 0.2}}
        data-placement={state?.placement}
        tooltipStyles={tooltipStyles}
        onMouseEnter={() => isHoverable && handleOpen()}
        onMouseLeave={() => isHoverable && handleClose()}
      >
        {title}
        <TooltipArrow
          data-popper-arrow
          data-placement={state?.placement}
          style={styles.arrow}
          background={tooltipStyles?.background ?? theme.tooltip.background}
        />
      </TooltipContent>
    </PositionWrapper>
  ) : null;

  return (
    <React.Fragment>
      {renderTrigger(children, setReferenceEl)}
      {ReactDOM.createPortal(<AnimatePresence>{tip}</AnimatePresence>, getPortal())}
    </React.Fragment>
  );
};

const Container = styled('span')<{
  containerDisplayMode?: React.CSSProperties['display'];
}>`
  ${p => p.containerDisplayMode && `display: ${p.containerDisplayMode}`};
  max-width: 100%;
`;

const PositionWrapper = styled('div')`
  z-index: 10;
`;

const TooltipContent = styled(motion.div)<Pick<Props, 'tooltipStyles'>>`
  will-change: transform, opacity;
  position: relative;
  background: ${p => p.theme.tooltip.background};
  color: ${p => p.theme.tooltip.text};
  padding: 0.375rem 0.5rem;
  border-radius: 3px;
  overflow-wrap: break-word;
  max-width: 225px;
  font-family: Ubuntu;
  font-size: 0.75rem;
  line-height: 1.4;
  text-align: center;
  ${p => p.tooltipStyles as any};
`;

const TooltipArrow = styled('span')<{background: string | number}>`
  position: absolute;
  width: 10px;
  height: 5px;

  &[data-placement*='bottom'] {
    top: 0;
    left: 0;
    margin-top: -5px;
    &::before {
      border-width: 0 5px 5px 5px;
      border-color: transparent transparent ${p => p.background} transparent;
    }
  }

  &[data-placement*='top'] {
    bottom: 0;
    left: 0;
    margin-bottom: -5px;
    &::before {
      border-width: 5px 5px 0 5px;
      border-color: ${p => p.background} transparent transparent transparent;
    }
  }

  &[data-placement*='right'] {
    left: 0;
    margin-left: -5px;
    &::before {
      border-width: 5px 5px 5px 0;
      border-color: transparent ${p => p.background} transparent transparent;
    }
  }

  &[data-placement*='left'] {
    right: 0;
    margin-right: -5px;
    &::before {
      border-width: 5px 0 5px 5px;
      border-color: transparent transparent transparent ${p => p.background};
    }
  }

  &::before {
    content: '';
    margin: auto;
    display: block;
    width: 0;
    height: 0;
    border-style: solid;
  }
`;

export default Tooltip;
