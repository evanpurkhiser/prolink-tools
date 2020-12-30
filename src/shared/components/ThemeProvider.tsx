import {useMedia} from 'react-use';
import {ThemeProvider as EmotionThemeProvider} from '@emotion/react';

import theme from 'src/theme';

type Props = Omit<React.ComponentProps<typeof EmotionThemeProvider>, 'theme'>;

const ThemeProvider = (props: Props) => (
  <EmotionThemeProvider
    theme={theme[useMedia('(prefers-color-scheme: dark)') ? 'dark' : 'light']}
    {...props}
  />
);

export default ThemeProvider;
