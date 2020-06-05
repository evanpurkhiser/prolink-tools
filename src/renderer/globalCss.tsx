import {css} from '@emotion/core';

import fonts from 'app/fonts';

const globalCss = css`
  html,
  body,
  body > div {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    min-height: 100%;
    margin: 0;
    padding: 0;
  }

  ${fonts};

  * {
    box-sizing: border-box;
  }

  :root {
    font-size: 16px;
    font-family: 'DM Mono';
    line-height: 1.2;
  }

  :not(input):not(textarea),
  :not(input):not(textarea)::after,
  :not(input):not(textarea)::before {
    -webkit-user-select: none;
    user-select: none;
    cursor: default;
  }
  input,
  button,
  textarea,
  :focus {
    outline: none;
  }
`;

export default globalCss;
