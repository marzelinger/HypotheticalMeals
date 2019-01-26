import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'reactstrap';

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

    render() {
      return (
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
              <tr key={item.number}>
                {this.props.properties.map(prop => 
                  <td key={prop}>{item[prop]}</td>
                )}
              </tr>
            )}
          </tbody>
        </Table>
      );
    }

};

PageTable.propTypes = {
  table_columns: PropTypes.arrayOf(PropTypes.string),
  table_properties: PropTypes.arrayOf(PropTypes.string),
  list_items: PropTypes.arrayOf(PropTypes.shape({
    ingredient_name: PropTypes.string,
    ingredient_num: PropTypes.string,
    vendor_info: PropTypes.string,
    pkg_size: PropTypes.string,
    pkg_cost: PropTypes.number,
    skus: PropTypes.arrayOf(PropTypes.string),
    comment: PropTypes.string,
    updatedAt: PropTypes.date,
    createdAt: PropTypes.date
  })),
  handleSort: PropTypes.func
};

// PageTable.defaultProps = {
//   data: [],
// };

export default PageTable;