import { Flex } from '@rebass/grid/emotion';
import { observer } from 'mobx-react';
import styled, { css } from 'react-emotion';
import React from 'react';
import Select, { components } from 'react-select';

import * as icons from 'app/components/icons';
import config from 'app/config';
import Label from 'app/components/settings/label';

const FIELDS = ['album', 'comment', 'genre', 'key', 'label'];

const fieldTransform = f => ({ value: f, label: f });

const selectStyles = {
  control: base => css`
    display: flex;
    background: #f9f9f9;
    border-radius: 3px;
    border: 1px solid #d6d7dc;
    font-size: 0.9em;
  `,
  valueContainer: base => css`
    ${base};
    padding: 6px;
  `,
  input: base => css`
    ${base};
    color: #737386;
  `,
  menu: base => css`
    ${base};
    box-shadow: 0 0 12px rgba(0, 0, 0, 0.15);
    border-radius: 2px;
  `,
};

const selectComponents = {
  IndicatorsContainer: p => null,
  MultiValueRemove: p => (
    <components.MultiValueRemove {...p}>
      <icons.X size="1em" />
    </components.MultiValueRemove>
  ),
};

const MetadataConfig = p => (
  <React.Fragment>
    <Label>Metadata Items</Label>
    <Select
      options={FIELDS.map(fieldTransform)}
      value={config.detailItems.map(fieldTransform)}
      components={selectComponents}
      styles={selectStyles}
      onChange={values => (config.detailItems = values.map(v => v.value))}
      placeholder="Add metadata items to display..."
      isMulti
    />
  </React.Fragment>
);

export default observer(MetadataConfig);
