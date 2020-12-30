import {css, Theme} from '@emotion/react';

import fonts from 'src/shared/fonts';

const globalCss = (theme: Theme) => css`
  html,
  body,
  body > div {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    min-height: 100%;
    margin: 0;
    padding: 0;
    color: ${theme.primaryText};
    background: ${theme.background};
    transition: color 200ms ease-in-out, background 300ms ease-in-out;
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

  input,
  button,
  textarea,
  :focus {
    outline: none;
  }

  button {
    color: ${theme.primaryText};
    font-family: 'DM Mono';
    transition: background 200ms, color 200ms;
    cursor: pointer;
  }

  a {
    cursor: pointer;
    color: #4b97f8;
    transition: color 200ms;

    &:hover {
      color: #3371bf;
    }
  }

  p {
    line-height: 1.3;
  }

  ul,
  ol {
    padding-left: 1.5rem;
  }

  li {
    margin-bottom: 0.75rem;
  }
`;

const noSelect = css`
  *,
  *::after,
  *::before {
    -webkit-user-select: none;
    -webkit-user-drag: none;
    -webkit-app-region: no-drag;
  }
`;

export default globalCss;

export {noSelect};
