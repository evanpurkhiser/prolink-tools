import {mergeWith} from 'lodash';

export type ProlinkTheme = typeof light;

declare module '@emotion/react' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Theme extends ProlinkTheme {}
}

const colors = {
  white: '#fff',
};

const light = {
  background: colors.white,
  backgroundSecondary: '#fafafa',
  border: '#eee',

  control: {
    border: '#ccc',
    borderFocus: '#aaa',
    placeholderText: '#737386',
  },

  primaryText: '#28272b',
  subText: '#888',

  button: {
    primary: {
      backgroundHover: '#000',
      background: '#28272b',
      color: colors.white,
    },
    muted: {
      backgroundHover: '#e5e5e5',
      background: '#eee',
      color: 'inherit',
    },
  },
};

const dark = mergeWith(
  {
    background: '#28272b',
    primaryText: '#fff',
  },
  light,
  (value, srcValue) => (value !== undefined ? value : srcValue)
);

export default {light, dark};
