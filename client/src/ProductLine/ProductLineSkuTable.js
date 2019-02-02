
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Table } from 'reactstrap';
import * as Constants from '../resources/Constants';
import ListPage from '../components/ListPage/ListPage';
import DataStore from '../helpers/DataStore';

const ProductLineSkuTable = props => {
  let {page_name, page_title, filter_options, table_columns, table_properties, table_options, item_properties, item_property_labels, item_property_placeholder } = DataStore.getSkuData();
  const skuTableData = {
    page_name: 'prodlines/' + props.id + '/skus',
    page_title: '',
    filter_options,
    table_columns,
    table_properties,
    table_options,
    item_properties,
    item_property_labels,
    item_property_placeholder,
    simple: true
  }
  console.log('prodlines/' + props.id + '/skus');
  console.log(skuTableData)
  return (
    <div>
      <ListPage
        {...skuTableData}
      />
    </div>
  );

};

ProductLineSkuTable.propTypes = {
  user: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  skus: PropTypes.array.isRequired,
  id: PropTypes.string.isRequired,
};

export default ProductLineSkuTable;