
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Table } from 'reactstrap';
import * as Constants from './../../resources/Constants';
import IngredientsPage from './IngredientsPage';

const DetailsViewIngredientTable = props => {

  const ingredientTableData = {
    default_sku_filter: props.sku,
    simple: true
  }
  return (
    <div>
      <IngredientsPage
        {...ingredientTableData}
      />
    </div>
  );

};

DetailsViewIngredientTable.propTypes = {
  id: PropTypes.string.isRequired,
  sku: PropTypes.object.isRequired
};

export default DetailsViewIngredientTable;