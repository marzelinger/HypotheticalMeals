// ImportTable.js
// Belal
// Table component for ImportPage

import React from 'react';
import {Table} from 'reactstrap';
import PropTypes from 'prop-types';
import './SideBySideBox.css';

export class ImportTable extends React.Component{
    constructor(props){
        super(props);
        if(this.props.label==="SKUs"){
            this.state = {
                page_title: "SKUs",
                table_columns: ['Name', 'Number','Case UPC', 'Unit UPC', 'Unit Size', 'Cost per Case', 'Product Line', "Formula #", "Formula Factor", "Manufacturing Line", "Manufacturing Rate", "Manufacturing Setup Cost", "Manufacturing Run Cost", "Comment"],
                table_properties: ['name', 'num', 'case_upc', 'unit_upc', 'unit_size', 'cpc', 'prod_line', "formula", "scale_factor", "manu_lines", "manu_rate", "setup_cost", "run_cpc", "comment"],
                list_items: this.props.items,
                new_list_items: this.props.new_items,
            }
        } else if(this.props.label==="Ingredients"){
            this.state = {
                page_title: "Ingredients",
                table_columns: ['Name', 'Number', 'Vendor Info', 'Size', 'Cost', 'Comment'],
                table_properties: ['name', 'num', 'vendor_info', 'pkg_size', 'pkg_cost', 'comment'],
                list_items: this.props.items,
                new_list_items: this.props.new_items,
            }
        } else {
            this.state = {
                page_title: "",
                table_columns: [],
                table_properties: [],
                list_items: [],
                new_list_items: [],
            }
        }
    }

    getPropertyLabel = (col) => {
        return this.state.table_columns[this.state.table_properties.indexOf(col)];
    }

    render() {
        return (
            <div className='rowC'>
            <div className="paddedDiv import-table">
                These records will be replaced.
                <Table>
                    <thead>
                        <tr style ={{gridTemplateColumns: `repeat( ${this.state.table_properties.length}, minmax(100px, 1fr))` }}>
                            {this.state.table_properties.map(prop =>
                                <th key={prop}>
                                    {this.getPropertyLabel(prop)}
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.list_items.map(item =>
                            <tr 
                                style ={{gridTemplateColumns: `repeat( ${this.state.table_properties.length}, minmax(100px, 1fr))` }}
                                key={item.num}
                            >
                                {this.state.table_properties.map(prop =>
                                <td
                                    key={prop}
                                >
                                     {prop === "prod_line" ? (item["prod_line_to_show"]) : (prop==="formula" ? item["formula_to_show"] : (prop ==="manu_lines" ? item["manu_lines_to_show"] : item[prop])) }
                                </td>
                            )}
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>
            <div className="paddedDiv import-table">
                These records will replace the others.
                <Table>
                    <thead>
                        <tr style ={{gridTemplateColumns: `repeat( ${this.state.table_properties.length}, minmax(100px, 1fr))` }}    >
                            {this.state.table_properties.map(prop =>
                                <th key={prop}>
                                    {this.getPropertyLabel(prop)}
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.new_list_items.map(item =>
                            <tr
                                style ={{gridTemplateColumns: `repeat( ${this.state.table_properties.length}, minmax(100px, 1fr))` }}
                                key={item.num}
                            >
                                {this.state.table_properties.map(prop =>
                                <td
                                    key={prop}
                                >
                                     {prop === "prod_line" ? (item["prod_line_to_show"]) : (prop==="formula" ? item["formula_to_show"] : (prop ==="manu_lines" ? item["manu_lines_to_show"] : item[prop])) }
                                </td>
                            )}
                            </tr>)}
                    </tbody>
                </Table>
            </div>
            </div>
        )
    }
};

ImportTable.propTypes = {
    table_columns: PropTypes.arrayOf(PropTypes.string),
    table_properties: PropTypes.arrayOf(PropTypes.string),
    list_items: PropTypes.arrayOf(PropTypes.object),
    new_list_items: PropTypes.arrayOf(PropTypes.object),
}