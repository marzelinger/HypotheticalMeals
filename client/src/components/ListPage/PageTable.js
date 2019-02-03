// PageTable.js
// Riley
// Table component for ListPage

import React from 'react';
import PropTypes from 'prop-types';
import { 
  Button, 
  Table,
  Input } from 'reactstrap';
import * as Constants from './../../resources/Constants';

export class PageTable extends React.Component{
    constructor(props) {
      super(props);
    }

    getPropertyLabel = (col) => {
      return this.props.columns[this.props.table_properties.indexOf(col)];
    }

    rowStyle = (item) => {
      return ({ backgroundColor: this.props.selected_items.includes(item) ? 
          Constants.selected_row_color : Constants.unselected_row_color});
    }

    render() {
      return (
        <div>
          <Table>
            <thead>
              <tr>
                {this.props.table_properties.map(prop => 
                  <th key={prop} onClick={e => this.props.handleSort(e, prop)}>
                    {this.getPropertyLabel(prop)}
                  </th>
                )}
                {(this.props.quantities === undefined) ? 
                  null : ( <th>Ingredient Quantitites</th> )}
              </tr>
            </thead>
            <tbody>
              {this.props.list_items.map((item, index) => 
                <tr 
                  key={index}
                  style={this.rowStyle(item)}
                >
                  {this.props.table_properties.map(prop => 
                    <td 
                      key={prop}
                      onClick={e => this.props.handleSelect(e, item) }
                    >
                      {((typeof item[prop]) === 'string' || item[prop] === null || item[prop] === undefined) 
                          ? item[prop] : item[prop].name}
                      {console.log(item)}
                    </td>
                  )}
                  {([undefined,null].includes(this.props.quantities)) ? 
                    (<td color='link' onClick={(e) => this.props.handleDetailViewSelect(e, item) }>...</td>) : 
                    (<td>
                      <Input 
                        type="text"
                        value={this.props.quantities[index]}
                        onChange={(e) => this.props.handleQuantityChange(e, index)}
                      />
                    </td>)}
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      );
    }

};

PageTable.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.string),
  table_properties: PropTypes.arrayOf(PropTypes.string),
  list_items: PropTypes.arrayOf(PropTypes.object),
  quantities: PropTypes.arrayOf(PropTypes.string),
  selected_items: PropTypes.arrayOf(PropTypes.object),
  handleSort: PropTypes.func,
  handleSelect: PropTypes.func,
  handleDetailViewSelect: PropTypes.func,
  handleQuantityChange: PropTypes.func
};


export default PageTable;