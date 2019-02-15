
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Table } from 'reactstrap';
import * as Constants from './../../resources/Constants';
import SkusPage from './SkusPage';
import DataStore from './../../helpers/DataStore';

const DetailsViewSkuTable = props => {

  const skuTableData = {
    default_ing_filter: props.ingredient,
    simple: true
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
  ingredient: PropTypes.object
};

export default DetailsViewSkuTable;