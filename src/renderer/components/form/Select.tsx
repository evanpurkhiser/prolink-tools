import * as React from 'react';
import Control, {components} from 'react-select';
import {X} from 'react-feather';

type ControlProps = React.ComponentProps<typeof Control>;

const selectStyles: ControlProps['styles'] = {
  control: () => ({
    display: 'flex',
    borderRadius: '3px',
    border: '1px solid #ccc',
    width: '100%',
  }),
  valueContainer: base => ({
    ...base,
    padding: '0.25rem',
  }),
  input: base => ({
    ...base,
    color: '#737386',
  }),
  menu: base => ({
    ...base,
    borderRadius: '3px',
    zIndex: 10,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? '#4b98f8' : 'none',
    color: state.isFocused ? '#fff' : 'none',
  }),
};

const selectComponents: ControlProps['components'] = {
  IndicatorsContainer: () => null,
  MultiValueRemove: p => (
    <components.MultiValueRemove {...p}>
      <X size="0.75rem" />
    </components.MultiValueRemove>
  ),
};

const Select = (p: React.ComponentProps<typeof Control>) => (
  <Control components={selectComponents} styles={selectStyles} {...p} />
);

export default Select;
