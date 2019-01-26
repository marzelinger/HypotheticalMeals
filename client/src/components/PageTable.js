import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'reactstrap';

const PageTable = (props) => {
    const { columns,
            properties,
            // list_items: {
            //   _id,
            //   ingredient_name,
            //   ingredient_num,
            //   vendor_info,
            //   pkg_size,
            //   pkg_cost,
            //   skus,
            //   comment,
            //   updatedAt,
            //   createdAt,
            //   __v
            // } 
          } = props;

    return (
      <Table>
        <thead>
          <tr>
            {columns.map(column => 
              <th key={column}>{column}</th>
            )}
          </tr>
        </thead>
        <tbody>
          {props.list_items.map(item => 
            <tr key={item.number}>
              {properties.map(prop => 
                <td key={prop}>{item[prop]}</td>
              )}
            </tr>
          )}
        </tbody>
      </Table>
    );

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
  }))
};

// PageTable.defaultProps = {
//   data: [],
// };

export default PageTable;