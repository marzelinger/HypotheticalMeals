import React from 'react';
import SimpleValue from 'react-select-simple-value';
import ReactSelect from 'react-select';

export const SelectFix = ({ options, value, ...props }) => (
    <SimpleValue options={options} value={value}>
      {simpleProps => <ReactSelect {...props} {...simpleProps} />}
    </SimpleValue>
  );