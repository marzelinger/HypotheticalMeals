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

export class SimpleGoalTable extends React.Component{
    constructor(props) {
      super(props);
    }
    
    render() {
        let tablebody = (
            this.props.skus.map((item, index) => 
            <TableRow
              key={item.num + index}
            >
                <TableRowColumn key={index}>
                    {this.props.skus[index].name}
                </TableRowColumn>
                <TableRowColumn key={index}>
                    {this.props.quantities[index]}
                </TableRowColumn>

            </TableRow>
          ))
      return (
        <div>
          <Table>
            <TableHeader>
              <TableRow selectable = {false} class = "cols">
                  <TableHeaderColumn>
                    SKUs
                  </TableHeaderColumn>
                  <TableHeaderColumn>
                    Quantities
                  </TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox = {false}>
                {tablebody}
            </TableBody>
          </Table>
        </div>
      );
    }

};

SimpleGoalTable.propTypes = {
  skus: PropTypes.array,
  quantities: PropTypes.array
};


export default SimpleGoalTable;