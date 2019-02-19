// PageTable.js
// Riley
// Table component for SkusPage

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
import '../../style/TableStyle.css'

export class GoalSkuTable extends React.Component{
    constructor(props) {
      super(props);
      this.state = {
        showCheckboxes:true,
        selected: '',
        list_items: props.list_items,
        simple: this.props.simple !=undefined ? this.props.simple : false
      } 
    }

    componentDidUpdate(prevProps){
      if(prevProps.list_items !== this.props.list_items){
          this.setState({          
              list_items: this.props.list_items
          });
      }
    }

    getPropertyLabel = (col) => {
      return this.props.columns[this.props.table_properties.indexOf(col)];
    }

    createQuantityElement = (item, index) => {
        return <Input min = {1} onChange = {(e) => this.props.onQuantityChange(e, index)} placeholder={item['quantity']} type="number" step="1" />
    }

    handleSelectedRow  = async (indexes) => {
      await this.setState({selected: indexes});
      console.log(this.state.selected);
    }  

    handleDeleteButton = () =>{
      this.props.handleDeleteActivities(this.state.selected);
      this.setState({selected: []});
    }
    
    render() {
      console.log(this.props.list_items)
        let tablebody = (
            this.state.list_items.map((item, index) => 
            <TableRow
              key={item.num + index}
              selectable = {!this.state.simple}
              selected = {this.state.selected !=undefined && this.state.selected.includes(index) && !this.state.simple}
            >
              {this.props.table_properties.map(prop => 
                <TableRowColumn key={prop}>
                  {prop == 'quantity' ? this.createQuantityElement(item, index) : item.sku[prop]}
                </TableRowColumn>
              )}

            </TableRow>
          ))
      return (
        <div>
          <Table multiSelectable = {true}
          onRowSelection = {(index) => this.handleSelectedRow(index)}
          deselect
          >
            <TableHeader adjustForCheckbox={this.state.showCheckboxes && !this.state.simple}>
              <TableRow selectable = {false} class = "cols trselect">
                {this.props.table_properties.map(prop => 
                  <TableHeaderColumn tooltip = {this.state.simple ? null : "Sort By " + this.getPropertyLabel(prop)} className = "hoverable" key={prop}>
                    <div onClick={e => this.props.handleSort(e, prop)}>{this.getPropertyLabel(prop)}</div>
                  </TableHeaderColumn>
                )}
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox = {this.state.showCheckboxes && !this.state.simple} deselectOnClickaway = {false}>
                {tablebody}
            </TableBody>
          </Table>
          {!this.state.simple ? <div onClick = {() => this.handleDeleteButton()} className = "delete detailButtons hoverable">delete selected activities</div> : <div></div>}
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
  onQuantityChange: PropTypes.func,
  handleDeleteActivities: PropTypes.func
};


export default GoalSkuTable;