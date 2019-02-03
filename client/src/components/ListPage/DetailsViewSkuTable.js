
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Table } from 'reactstrap';
import * as Constants from './../../resources/Constants';
import ListPage from './ListPage';
import DataStore from './../../helpers/DataStore';

const DetailsViewSkuTable = props => {
  let {
    page_name, 
    filter_options, 
    table_columns, 
    table_properties, 
    item_properties, 
    item_property_labels, } = DataStore.getIngredientData();

  const skuTableData = {
    page_name: page_name + '/' + props.id + '/skus',
    page_title: '',
    filter_options,
    table_columns,
    table_properties,
    item_properties,
    item_property_labels,
    default_ing_filter: props.ingredient,
    simple: true
  }
  return (
    <div>
      <ListPage
        {...skuTableData}
      />
    </div>
  );

};

DetailsViewSkuTable.propTypes = {
//   user: PropTypes.string.isRequired,
//   name: PropTypes.string.isRequired,
//   skus: PropTypes.array.isRequired,
  id: PropTypes.string.isRequired,
  ingredient: PropTypes.object.isRequired
};

export default DetailsViewSkuTable;