import {keyframes} from '@emotion/react';
import styled from '@emotion/styled';

type Props = {
  /**
   * Display a message under the loader
   */
  message?: React.ReactNode;
  /**
   * Apply flex-grow: 1 to the loading indicator.
   */
  expand?: boolean;
  /**
   * Size of the spinner
   */
  size?: string;
};

const Loading = ({message, expand, ...props}: Props) => (
  <Wrapper expand={expand}>
    <Loader {...props} />
    {message}
  </Wrapper>
);

const spinner = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const Loader = styled('div')<Pick<Props, 'size'>>`
  animation: ${spinner} 400ms infinite linear;
  display: block;
  height: ${p => p.size ?? '30px'};
  width: ${p => p.size ?? '30px'};
  border-radius: 50%;
  border: 3px solid ${p => p.theme.primaryText};
  border-right-color: transparent;
`;

const Wrapper = styled('div')<Pick<Props, 'expand'>>`
  font-family: Ubuntu;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  ${p => p.expand && 'flex-grow: 1'};
`;

export default Loading;
