// PageTable.js
// Riley
// Table component for ListPage

import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'reactstrap';
import * as Constants from './../../resources/Constants';
import {
  Table,
  TableBody,
  TableFooter,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

export class GoalSkuTable extends React.Component{
    constructor(props) {
      super(props);
      this.state = {
        showCheckboxes:false
      }
    }
    getPropertyLabel = (col) => {
      return this.props.columns[this.props.table_properties.indexOf(col)];
    }

    createQuantityElement = (item, index) => {
        return <Input onChange = {(e) => this.props.onQuantityChange(e, index)} placeholder={item['quantity']} type="number" step="1" />
    }
    
    render() {
        let tablebody = (
            this.props.list_items.map((item, index) => 
            <TableRow
              key={item.num + index}
            >
              {this.props.table_properties.map(prop => 
                <TableRowColumn key={prop}>
                  {prop == 'quantity' ? this.createQuantityElement(item, index) : item[prop]}
                </TableRowColumn>
              )}
            </TableRow>
          ))
        

      return (
        <div>
          <Table>
            <TableHeader displaySelectAll={this.state.showCheckboxes} adjustForCheckbox={this.state.showCheckboxes}>
              <TableRow>
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