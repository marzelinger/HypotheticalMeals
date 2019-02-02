// PageTable.js
// Riley
// Table component for ListPage

import React from 'react';
import PropTypes from 'prop-types';
import { Button, Table, Input } from 'reactstrap';
import * as Constants from './../../resources/Constants';

export class GoalSkuTable extends React.Component{
    constructor(props) {
      super(props);
    }
    getPropertyLabel = (col) => {
      return this.props.columns[this.props.table_properties.indexOf(col)];
    }

    createQuantityElement = (item, index) => {
        return <Input onChange = {(e) => this.props.onQuantityChange(e, index)} placeholder={item['quantity']} type="number" step="1" />
    }
    
    render() {
        console.log(this.props.list_items)
        let tablebody = (
            this.props.list_items.map((item, index) => 
            <tr 
              key={item.num + index}
            >
              {this.props.table_properties.map(prop => 
                <td key={prop}>
                  {prop == 'quantity' ? this.createQuantityElement(item, index) : item[prop]}
                </td>
              )}
            </tr>
          ))
        

      return (
        <div>
          <Table>
            <thead>
              <tr>
                {this.props.table_properties.map(prop => 
                  <th key={prop} onClick={e => this.props.handleSort(e, prop)}>
                    {this.getPropertyLabel(prop)}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
                {tablebody}
            </tbody>
          </Table>
        </div>
      );
    }

};

GoalSkuTable.propTypes = {
  table_columns: PropTypes.arrayOf(PropTypes.string),
  table_properties: PropTypes.arrayOf(PropTypes.string),
  list_items: PropTypes.arrayOf(PropTypes.object),
  selected_items: PropTypes.arrayOf(PropTypes.object),
  handleSort: PropTypes.func,
  handleSelect: PropTypes.func,
  handleDetailViewSelect: PropTypes.func,
  onQuantityChange: PropTypes.func
};


export default GoalSkuTable;