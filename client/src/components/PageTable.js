// PageTable.js
// Riley
// Table component for ListPage

import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'reactstrap';
import ItemDetails from './ItemDetails'
import * as Constants from '../resources/Constants';

export class PageTable extends React.Component{
    constructor(props) {
      super(props);
      // const { columns,
      //   properties,
      //   list_items
      //   //   _id,
      //   //   ingredient_name,
      //   //   ingredient_num,
      //   //   vendor_info,
      //   //   pkg_size,
      //   //   pkg_cost,
      //   //   skus,
      //   //   comment,
      //   //   updatedAt,
      //   //   createdAt,
      //   //   __v
      //   // } 
      // } = props;
    }

    getProperty = (col_label) => {
      return this.props.properties[this.props.columns.indexOf(col_label)];
    }

    rowStyle = (item) => {
      return ({ backgroundColor: this.props.selected_items.includes(item) ? 
          Constants.unselected_row_color : Constants.selected_row_color});
    }

    render() {
      return (
        <div className="container">
          <Table>
            <thead>
              <tr>
                {this.props.columns.map(column => 
                  <th key={column} onClick={e => this.props.handleSort(e, this.getProperty(column))}>{column}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {this.props.list_items.map(item => 
                <tr 
                  key={item._id} 
                  onClick={e => { this.props.handleSelect(e, item)} }
                  style={this.rowStyle(item)}>
                    {this.props.properties.map(prop => 
                      <td key={prop}>{item[prop]}</td>
                    )}
                </tr>
              )}
            </tbody>
          </Table>
          <ItemDetails>
          </ItemDetails>
        </div>
      );
    }

};

PageTable.propTypes = {
  table_columns: PropTypes.arrayOf(PropTypes.string),
  table_properties: PropTypes.arrayOf(PropTypes.string),
  list_items: PropTypes.arrayOf(PropTypes.object),
  //   PropTypes.shape({
  //     ingredient_name: PropTypes.string,
  //     ingredient_num: PropTypes.string,
  //     vendor_info: PropTypes.string,
  //     pkg_size: PropTypes.string,
  //     pkg_cost: PropTypes.number,
  //     skus: PropTypes.arrayOf(PropTypes.string),
  //     comment: PropTypes.string,
  //     updatedAt: PropTypes.date,
  //     createdAt: PropTypes.date
  // })),
  selected_items: PropTypes.arrayOf(PropTypes.object),
  handleSort: PropTypes.func,
  handleSelect: PropTypes.func
};

export default PageTable;