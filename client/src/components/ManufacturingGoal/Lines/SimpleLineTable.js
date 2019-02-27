// PageTable.js
// Riley
// Table component for SkusPage

import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'reactstrap';
import * as Constants from '../../../resources/Constants';
import {
  Table,
  TableBody,
  TableFooter,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import '../../../style/TableStyle.css'

export class SimpleLineTable extends React.Component{
    constructor(props) {
      super(props);
    }
    
    render() {
        let tablebody = (
            this.props.skus.map((sku, index) => 
            <TableRow
              key={sku.num + index}
              style = {{overflow: 'visible', textAlign: 'center', display:'grid', gridTemplateColumns: '3fr 3fr 3fr 3fr'}}
            >
                <TableRowColumn >
                    {sku.name}
                </TableRowColumn>
                <TableRowColumn >
                    {sku.num}
                </TableRowColumn>
                <TableRowColumn>
                    {sku.unit_size}
                </TableRowColumn>
                <TableRowColumn>
                    {sku.cpc}
                </TableRowColumn>
            </TableRow>
          ))
      return (
        <div>
          <Table>
            <TableHeader displaySelectAll = {false} adjustForCheckbox = {false}>
              <TableRow style = {{overflow: 'visible', textAlign: 'center', display:'grid', gridTemplateColumns: '3fr 3fr 3fr 3fr'}} selectable = {false} class = "cols">
                  <TableHeaderColumn>
                    SKU Name
                  </TableHeaderColumn>
                  <TableHeaderColumn>
                    SKU Number
                  </TableHeaderColumn>
                  <TableHeaderColumn>
                    Size Per Unit
                  </TableHeaderColumn>
                  <TableHeaderColumn>
                    Case Count
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

SimpleLineTable.propTypes = {
  skus: PropTypes.array,
  quantities: PropTypes.array
};


export default SimpleLineTable;