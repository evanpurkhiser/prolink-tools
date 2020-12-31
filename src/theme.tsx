import {mergeWith} from 'lodash';
import {CDJStatus} from 'prolink-connect/lib/types';

export type ProlinkTheme = typeof light;

declare module '@emotion/react' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Theme extends ProlinkTheme {}
}

const colors = {
  white: '#fff',
};

const playStates: Record<CDJStatus.PlayState, {bg: string; stroke?: string}> = {
  [CDJStatus.PlayState.Empty]: {bg: '#f1f1f1'},
  [CDJStatus.PlayState.Loading]: {bg: '#E9E9E9'},
  [CDJStatus.PlayState.Playing]: {bg: '#81F14C'},
  [CDJStatus.PlayState.Looping]: {bg: '#FFD466'},
  [CDJStatus.PlayState.Paused]: {bg: '#78DFFF'},
  [CDJStatus.PlayState.Cued]: {bg: '#FFC266'},
  [CDJStatus.PlayState.Cuing]: {bg: '#FF9466'},
  [CDJStatus.PlayState.PlatterHeld]: {bg: '#DDFFB2'},
  [CDJStatus.PlayState.Searching]: {bg: '#B378FF'},
  [CDJStatus.PlayState.SpunDown]: {bg: '#FB75A5'},
  [CDJStatus.PlayState.Ended]: {bg: '#FF6666'},
};

const light = {
  background: colors.white,
  backgroundSecondary: '#fafafa',
  backgroundBox: '#F3F3F3',
  border: '#eee',
  subBorder: '#e2e2e2',
  playStates,

  control: {
    border: '#ccc',
    borderFocus: '#aaa',
    placeholderText: '#737386',
    knob: '#9E9E9E',
  },

  primaryText: '#28272b',
  subText: '#8F8FA0',

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

  alert: {
    info: {
      background: '#ECF2FA',
      border: '#4B97F8',
      text: '#1a4275',
    },
  },
};

const dark = mergeWith(
  {
    background: '#36393F',
    backgroundSecondary: '#2F3136',
    backgroundBox: '#303237',
    primaryText: '#EDECF0',
    border: '#25292D',
    subBorder: '#292B2E',

    control: {
      border: '#202223',
      borderFocus: '#484E58',
      background: '#2F3136',
      placeholderText: '#737386',
      knob: '#5C6A7B',
    },

    alert: {
      info: {
        background: '#222832',
        border: '#3B6EAE',
        text: '#6A95CA',
      },
    },
  } as Partial<ProlinkTheme>,
  light,
  (value, srcValue) => (value !== undefined ? value : srcValue)
);

export default {light, dark};
