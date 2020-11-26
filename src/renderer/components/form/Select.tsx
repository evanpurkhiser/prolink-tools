import * as React from 'react';
import {ChevronDown, X} from 'react-feather';
import Control, {components} from 'react-select';

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
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? '#4b98f8' : 'none',
    color: state.isFocused ? '#fff' : 'none',
    padding: '0.25rem 0.5rem',
    margin: '0 0.25rem',
    borderRadius: '3px',
    width: 'auto',
  }),
};

const selectComponents: ControlProps['components'] = {
  IndicatorSeparator: () => null,
  ClearIndicator: () => null,
  DropdownIndicator: p => (
    <components.DropdownIndicator {...p}>
      <ChevronDown size="1rem" />
    </components.DropdownIndicator>
  ),
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
