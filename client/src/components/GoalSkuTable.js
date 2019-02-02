
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Table } from 'reactstrap';
import * as Constants from '../resources/Constants';
import ListPage from './ListPage/ListPage';
import DataStore from '../helpers/DataStore';

const GoalSkuTable = props => {
  let {page_name, page_title, filter_options, table_columns, table_properties, table_options, item_properties, item_property_labels, item_property_placeholder } = DataStore.getSkuData();
  const skuTableData = {
    page_name: `manugoals/${props.user}/${props.id}/skus`,
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
  console.log(props.id);
  console.log(`manugoals/${props.user}/${props.id}/skus`);
  console.log(skuTableData)
  return (
    <div>
      <ListPage
        {...skuTableData}
      />
    </div>
  );

};

GoalSkuTable.propTypes = {
  user: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  skus: PropTypes.array.isRequired,
  id: PropTypes.string.isRequired,
};

export default GoalSkuTable;