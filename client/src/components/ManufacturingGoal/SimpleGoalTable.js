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
            this.props.activities.map((activity, index) => 
            <TableRow
              key={activity.sku.num + index}
              style = {{overflow: 'visible', textAlign: 'center', display:'grid', gridTemplateColumns: '6fr 3fr 3fr'}}
            >
                <TableRowColumn key={index + activity._id} style = {{overflow: 'visible'}}>
                    {`${activity.sku.name}:${activity.sku.unit_size}*${activity.sku.cpc}`}
                </TableRowColumn>
                <TableRowColumn key={index + activity._id}>
                    {activity.quantity}
                </TableRowColumn>
                <TableRowColumn>
                  {activity.quantity * activity.sku.manu_rate}
                </TableRowColumn>
            </TableRow>
          ))
      return (
        <div>
          <Table>
            <TableHeader displaySelectAll = {false} adjustForCheckbox = {false}>
              <TableRow style = {{overflow: 'visible', textAlign: 'center', display:'grid', gridTemplateColumns: '6fr 3fr 3fr'}} selectable = {false} class = "cols">
                  <TableHeaderColumn>
                    SKUs
                  </TableHeaderColumn>
                  <TableHeaderColumn>
                    Quantities
                  </TableHeaderColumn>
                  <TableHeaderColumn>
                    Durations
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