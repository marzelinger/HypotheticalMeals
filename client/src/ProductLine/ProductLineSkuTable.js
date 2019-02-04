// PageTable.js
// Riley
// Table component for ListPage

import React from 'react';
import PropTypes from 'prop-types';
import { Button, Table, Input } from 'reactstrap';
import ItemSearchInput from '../components/ListPage/ItemSearchInput';
import * as Constants from '../resources/Constants';
import Select from 'react-select'

export class ProductLineSkuTable extends React.Component{
    constructor(props) {
      super(props);
    }

    getPropertyLabel = (col) => {
      return this.props.columns[this.props.table_properties.indexOf(col)];
    }

    createProductLineElement = (item, index) => {
        const options = this.props.options
        let defaultValue = {};
        options.forEach(option => {
          if(option.label == item.prod_line.name){
            defaultValue = option;
          }
        })
        return (<Select defaultValue = {defaultValue} onChange = {(newval, {action}) => this.props.onProdLineChange(newval, index, action) } options={options} />);
        // return <Input onChange = {(e) => this.props.onProdLineChange(e, index)} placeholder={item['prod_line']} type="String" />
    }
    
    render() {
        let tablebody = (
            this.props.list_items.map((item, index) => 
            <tr 
              key={item.num + index}
            >
              {this.props.table_properties.map(prop => 
                <td key={prop}>
                  {prop == 'prod_line' ? this.createProductLineElement(item, index) : item[prop]}
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

ProductLineSkuTable.propTypes = {
  table_columns: PropTypes.arrayOf(PropTypes.string),
  table_properties: PropTypes.arrayOf(PropTypes.string),
  list_items: PropTypes.arrayOf(PropTypes.object),
  handleSort: PropTypes.func,
  onProdLineChange: PropTypes.func
};


export default ProductLineSkuTable;