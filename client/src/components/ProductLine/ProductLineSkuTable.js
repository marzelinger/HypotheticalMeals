// PageTable.js
// Riley
// Table component for ListPage

import React from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  TableBody,
  TableFooter,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import * as Constants from '../../resources/Constants';
import Select from 'react-select'
import '../../style/TableStyle.css'

export class ProductLineSkuTable extends React.Component{
    constructor(props) {
      super(props);
      this.state= {
        showCheckboxes: false
      }
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
        let dataSourceConfig = {
          text: 'label',
          value: 'value',
        };
        const customStyles = {
          control: (base, state) => ({
              ...base,
              borderColor: this.props.invalid ? 'red' : '#ddd',
              height: '30px',
              'min-height': '30px',
              width: '150px'
          })
        }
       
        return (<Select  styles={customStyles} className = "select" defaultValue = {defaultValue} onChange = {(newval, {action}) => this.props.onProdLineChange(newval, index, action) } options={options} />);
    }
    
    render() {
      var rev_index = this.props.list_items.length;
        let tablebody = (
            this.props.list_items.map((item, index) => {
              rev_index = rev_index - 1;
              return (<TableRow
              key={item.num + index}
            >
              {this.props.table_properties.map(prop => 
                <TableRowColumn style = {{overflow: prop == 'prod_line' ? 'visible' : 'hidden', zIndex: `${rev_index}`}}  key={prop}>
                  {prop == 'prod_line' ? this.createProductLineElement(item, index) : item[prop]}
                </TableRowColumn>
              )}
            </TableRow>
              )

            }

          ))
        

      return (
        <div className = 'prod-line-table'>
          <Table height = {'100px'}>
            <TableHeader displaySelectAll={this.state.showCheckboxes} adjustForCheckbox={this.state.showCheckboxes}>
              <TableRow class= "cols trselect">
                {this.props.table_properties.map(prop => 
                  <TableHeaderColumn tooltip = {"Sort By " + this.getPropertyLabel(prop)} className = "hoverable" key={prop}>
                    <div onClick={e => this.props.handleSort(e, prop)}>{this.getPropertyLabel(prop)}</div>
                  </TableHeaderColumn>
                )}
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox = {this.state.showCheckboxes}>
                {tablebody}
            </TableBody>
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