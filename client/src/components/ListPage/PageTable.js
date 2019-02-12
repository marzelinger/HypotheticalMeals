
// export default PageTable;

import React, {Component} from 'react';
import {
  Table,
  TableBody,
  TableFooter,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import { Input, Button } from 'reactstrap';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import Details from 'material-ui/svg-icons/navigation/more-horiz';
import TextField from 'material-ui/TextField';
import Toggle from 'material-ui/Toggle';
import PropTypes from 'prop-types';
import TableActions from './TableActions';
import '../../style/TableStyle.css'

const styles = {
  propContainer: {
    width: 200,
    overflow: 'hidden',
    margin: '20px auto 0',
  },
  propToggleHeader: {
    margin: '20px auto 10px',
  },
};

/**
 * A more complex example, allowing the table height to be set, and key boolean properties to be toggled.
 */
export default class PageTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fixedHeader: true,
      fixedFooter: false,
      stripedRows: false,
      showRowHover: true,
      selectable: props.selectable!=undefined ? props.selectable : true,
      multiSelectable: props.selectable!=undefined ? props.selectable : true,
      enableSelectAll: false,
      deselectOnClickaway: false,
      showCheckboxes: props.selectable!=undefined ? props.selectable : true,
      showDetails: props.showDetails!= undefined ? props.showDetails : false
    };
  }
  
  getPropertyLabel = (col) => {
    return this.props.columns[this.props.table_properties.indexOf(col)];
  }

  handleToggle = (event, toggled) => {
    this.setState({
      [event.target.name]: toggled,
    });
  };

  handleChange = (event) => {
    this.setState({height: event.target.value});
  };

  displayValue(item, prop) {
    switch (prop){
      case 'prod_line':
        return item[prop].name;
      case 'pkg_cost':
        return '$' + item[prop].toFixed(2);
      default:
        return item[prop];
    }
    // return (['string','number'].includes(typeof item[prop]) || item[prop] === null || item[prop] === undefined) 
    //                       ? item[prop] : item[prop].name
  }

  determineSelected= (index) => {
    if(this.state.selectable){
      return this.props.selected_indexes.includes(index);
    } 
    return false;
  }

  determineColumns = () => {
    return this.props.table_properties.length + (this.state.showDetails ? 1 : 0);
  }

  getDetailsCol = () => {
    {if(this.state.showDetails){
      return (<TableHeaderColumn style={{ height: 'auto !important', cursor: "default" }}> See More Details </TableHeaderColumn>);
      }
    }
  }

  getColumnComponent = (prop) => {
    if(this.props.sortable != undefined && this.props.sortable){
      return (                  
        <TableHeaderColumn style={{ height: 'auto !important', cursor: "pointer" }} tooltip = {"Sort By " + this.getPropertyLabel(prop)} className = "hoverable" key={prop}>
          <div onClick={e => this.props.handleSort(e, prop)}>{this.getPropertyLabel(prop)}</div>
        </TableHeaderColumn>
      )
    }
    return (<TableHeaderColumn style={{ height: 'auto !important', cursor: "default" }} >{this.getPropertyLabel(prop)}</TableHeaderColumn>);
  }

  getTableSuperHeader = () => {
      if(this.props.showHeader) {
        return (
          <TableRow className = "superrow">
            <TableHeaderColumn id = "pagetitle" className = "super" colSpan = {2}>{`${this.props.title} Table`}</TableHeaderColumn>
            <TableHeaderColumn className = "super" colSpan = {this.determineColumns() - 2}>
              <TableActions
                simple = {this.props.simple}
                table_options = {this.props.table_options}
                onTableOptionSelection = {this.props.onTableOptionSelection}
                onFilterValueSelection = {this.props.onFilterValueSelection}
                onFilterValueChange = {this.props.onFilterValueChange}
                onRemoveFilter = {this.props.onRemoveFilter}
                filters = {this.props.filters}
                ingredients = {this.props.ingredients}
                products = {this.props.product_lines}
                skus = {this.props.skus}
                id = "tableactions"
                onTableOptionSelection = {this.props.onTableOptionSelection}
              >
              </TableActions>
            
            </TableHeaderColumn>
          </TableRow>
        );
      }
  }

  render() {
    console.log(`myrow ${this.state.showCheckboxes ? " trselect":""}`);
    return (
      <div>
        <Table
          height={!this.state.selectable ? null : '413px'}
          fixedHeader={this.state.fixedHeader}
          fixedFooter={this.state.fixedFooter}
          selectable={this.state.selectable}
          multiSelectable={this.state.multiSelectable}
          onRowSelection = {(res) => this.props.handleSelect(res)}
        >
          <TableHeader
            displaySelectAll={false}
            adjustForCheckbox={this.state.selectable}
            enableSelectAll={false}
          >
              {this.getTableSuperHeader()}
            <TableRow class = "cols" selectable = {true} >
                {this.props.table_properties.map(prop => 
                  this.getColumnComponent(prop)
                )}
                {this.getDetailsCol()}
            </TableRow>
          </TableHeader>
          <TableBody
            displayRowCheckbox={this.state.showCheckboxes}
            deselectOnClickaway={this.state.deselectOnClickaway}
            showRowHover={this.state.showRowHover}
            stripedRows={this.state.stripedRows}
          >
              {this.props.list_items.map((item, index) => 
                <TableRow className = {`myrow ${this.state.showCheckboxes ? " trselect":""}`} selected = {this.determineSelected(index)} key={index}>
                  {this.props.table_properties.map(prop => 
                    <TableRowColumn
                      key={prop}
                      onClick={e => this.props.handleSelect(e, item)}
                      style={{ height: 'auto !important' }}
                    >
                      {this.displayValue(item, prop)}
                    </TableRowColumn>
                  )}
                  {([undefined,null].includes(this.props.quantities)) ? 
                    (<TableRowColumn>
                      <IconButton onClick={(e) => this.props.handleDetailViewSelect(e, item) }>
                        <Details></Details>
                      </IconButton>
                    </TableRowColumn>) : 
                    (<TableRowColumn>
                      <Input onChange = {(e) => this.props.handleQuantityChange(e, index)} className = "inputs" placeholder={this.props.quantities[index]} type="number" step="1" />
                    </TableRowColumn>)}
                </TableRow>
              )}
          </TableBody>
        </Table>
      </div>
    );
  }
}

PageTable.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.string),
  table_properties: PropTypes.arrayOf(PropTypes.string),
  list_items: PropTypes.arrayOf(PropTypes.object),
  quantities: PropTypes.arrayOf(PropTypes.string),
  selected_items: PropTypes.arrayOf(PropTypes.object),
  selected_indexes: PropTypes.array,
  handleSort: PropTypes.func,
  handleSelect: PropTypes.func,
  handleDetailViewSelect: PropTypes.func,
  handleQuantityChange: PropTypes.func,
  showHeader: PropTypes.bool.isRequired
};