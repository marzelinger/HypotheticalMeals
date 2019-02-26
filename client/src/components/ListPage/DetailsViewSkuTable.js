
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Table } from 'reactstrap';
import * as Constants from './../../resources/Constants';
import SkusPage from './SkusPage';
import DataStore from './../../helpers/DataStore';

const DetailsViewSkuTable = props => {
var skuTableData = {};
  if(props.id == 1) {
    skuTableData = {
      default_ing_filter: props.ingredient,
      simple: true
    }
  } else {
    skuTableData = {
      default_formula_filter: props.formula,
      simple: true
    }
  }
  return (
    <div>
      <SkusPage
        {
        ...skuTableData
        } 
      />
    </div>
  );

};

DetailsViewSkuTable.propTypes = {
  id: PropTypes.string.isRequired,
  ingredient: PropTypes.object,
  formula: PropTypes.object,
};

export default DetailsViewSkuTable;