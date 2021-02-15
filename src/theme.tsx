import {mergeWith} from 'lodash';
import {CDJStatus, NetworkState} from 'prolink-connect/lib/types';

export type ProlinkTheme = typeof light;

declare module '@emotion/react' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Theme extends ProlinkTheme {}
}

const colors = {
  white: '#fff',
};

const playStates: Record<CDJStatus.PlayState, {bg: string}> = {
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

const networkState: Record<NetworkState, {bg: string; text: string | null}> = {
  [NetworkState.Offline]: {bg: '#45433D', text: '#fff'},
  [NetworkState.Online]: {bg: '#FF9417', text: null},
  [NetworkState.Connected]: {bg: '#5FF65B', text: null},
  [NetworkState.Failed]: {bg: '#ff5757', text: null},
};

const light = {
  primaryText: '#28272b',
  darkText: '#28272b',
  subText: '#8F8FA0',

  background: colors.white,
  backgroundSecondary: '#fafafa',

  backgroundBox: '#F3F3F3',
  backgroundBoxAlt: '#eee',
  backgroundBoxFocus: '#ddd',

  border: '#eee',
  subBorder: '#e2e2e2',

  boxShadow: 'rgba(0, 0, 0, 0.1)',

  active: '#72d145',
  activeAlt: '#4C98F8',
  critical: '#f84b4b',
  softCritical: '#FF7575',

  playStates,
  networkState,

  control: {
    border: '#ccc',
    borderFocus: '#aaa',
    placeholderText: '#737386',
    knob: '#9E9E9E',
    knobAlt: '#C9CBCD',
  },

  cdjStatus: {
    icon: '#28272b',
    blankBeat: '#C4C4C4',
    activeBeat: '#FF9417',
  },

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

  tooltip: {
    background: '#28272b',
    text: '#fff',
  },
};

const dark = mergeWith(
  {
    primaryText: '#EDECF0',

    background: '#36393F',
    backgroundSecondary: '#2F3136',

    backgroundBox: '#303237',
    backgroundBoxAlt: '#40434A',
    backgroundBoxFocus: '#666',

    border: '#25292D',
    subBorder: '#292B2E',

    boxShadow: 'rgba(0, 0, 0, 0.3)',

    softCritical: '#772B2B',

    control: {
      border: '#202223',
      borderFocus: '#4C98F8',
      background: '#2F3136',
      placeholderText: '#737386',
      knob: '#5C6A7B',
    },

    cdjStatus: {
      icon: '#F1F1F1',
      blankBeat: '#474a4a',
      activeBeat: '#FF9417',
    },

    alert: {
      info: {
        background: '#222832',
        border: '#3B6EAE',
        text: '#6A95CA',
      },
    },
    tooltip: {
      background: '#fff',
      text: '#28272b',
    },
  } as Partial<ProlinkTheme>,
  light,
  (value, srcValue) => (value !== undefined ? value : srcValue)
);

export default {light, dark};
