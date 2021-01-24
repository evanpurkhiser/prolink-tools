import * as React from 'react';
import {ChromePicker, ColorResult} from 'react-color';
import {X} from 'react-feather';
import {usePopper} from 'react-popper';
import {useClickAway} from 'react-use';
import styled from '@emotion/styled';
import {AnimatePresence, motion} from 'framer-motion';
import {set} from 'mobx';
import {observer} from 'mobx-react';

import {NowPlayingConfig} from '.';

type Props = {
  config: NowPlayingConfig;
  defaultColors: Record<string, string>;
  trimPrefix?: string;
};

const ColorConfig = observer(({config, defaultColors, trimPrefix}: Props) => (
  <Container>
    {Object.entries(defaultColors).map(([name, color]) => (
      <Color
        key={name}
        name={name}
        trimPrefix={trimPrefix}
        color={config?.colors?.[name] ?? color}
        defaultColor={defaultColors[name]}
        onReset={() => set(config, {colors: {...config?.colors, [name]: undefined}})}
        onChange={color => set(config, {colors: {...config?.colors, [name]: color}})}
      />
    ))}
  </Container>
));

type ColorProps = {
  name: string;
  color: string;
  defaultColor: string;
  trimPrefix?: string;
  onChange: (color: string) => void;
  onReset: () => void;
};

const rgba = (color: ColorResult) =>
  `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`;

const Color = ({color, defaultColor, name, trimPrefix, onChange}: ColorProps) => {
  const [showPicker, openPicker] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [indicatorEl, setIndicatorEl] = React.useState<HTMLDivElement | null>(null);
  const [pickerEl, setPickerEl] = React.useState<HTMLDivElement | null>(null);
  const {styles, state} = usePopper(indicatorEl, pickerEl, {
    placement: 'top',
    modifiers: [{name: 'arrow'}, {name: 'offset', options: {offset: [0, 15]}}],
  });

  useClickAway(containerRef, () => openPicker(false));

  return (
    <div ref={containerRef}>
      <ColorPill onClick={() => openPicker(!showPicker)} key={name}>
        <ColorBlock ref={setIndicatorEl} style={{backgroundColor: color}} />
        {name.replace(trimPrefix ?? '', '')}
        {color !== defaultColor && (
          <ResetButton
            onClick={e => {
              e.stopPropagation();
              onChange(defaultColor);
            }}
          />
        )}
      </ColorPill>
      <AnimatePresence>
        {showPicker && (
          <Picker style={styles.popper} ref={setPickerEl}>
            <motion.div
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              transition={{duration: 0.15}}
            >
              <ChromePicker
                color={color}
                onChange={newColor => onChange(rgba(newColor))}
              />
              <Arrow
                data-placement={state?.placement}
                data-popper-arrow
                style={styles.arrow}
              />
            </motion.div>
          </Picker>
        )}
      </AnimatePresence>
    </div>
  );
};

const Container = styled('div')`
  display: flex;
  flex-direction: row;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const Picker = styled('div')`
  padding: 0 2rem;
  z-index: 100;

  .chrome-picker {
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.2) !important;
  }
`;

const Arrow = styled('div')`
  height: 0;
  width: 0;
  border: 10px solid transparent;

  &[data-placement='top'] {
    border-top-color: #fff;
  }
`;

const ColorPill = styled('div')`
  cursor: pointer;
  background-color: ${p => p.color};
  padding: 0.125rem 0.5rem;
  padding-left: 0.25rem;
  border-radius: 3px;
  background: ${p => p.theme.backgroundBox};
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  align-items: center;
  overflow: hidden;
`;

const ColorBlock = styled('div')`
  content: '';
  display: block;
  width: 15px;
  height: 15px;
  border-radius: 25%;
`;

const ResetButton = styled('button')`
  position: relative;
  padding: 0 0.25rem;
  color: ${p => p.theme.subText};
  background: ${p => p.theme.backgroundBoxAlt};
  border: none;
  display: flex;
  align-items: center;
  margin: -0.125rem -0.5rem;
  margin-left: 0;
  align-self: normal;

  svg {
    z-index: 1;
  }

  &:hover {
    background: ${p => p.theme.softCritical};
    color: #fff;
  }
`;

ResetButton.defaultProps = {
  type: 'button',
  children: <X size="0.75rem" />,
};

export default ColorConfig;
