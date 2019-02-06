// ImportTable.js
// Belal
// Table component for ImportPage

import React from 'react';
import {Table} from 'reactstrap';
import PropTypes from 'prop-types';
import './SideBySideBox.css';

export class ImportReport extends React.Component{
    constructor(props){
        super(props);
        if(this.props.label==="SKUs"){
            this.state = {
                page_title: "SKUs",
                table_columns: ['Name', 'Number','Case UPC', 'Unit UPC', 'Unit Size', 'Cost per Case', 'Product Line', "Comment"],
                table_properties: ['name', 'num', 'case_upc', 'unit_upc', 'unit_size', 'cpc', 'prod_line', "comment"],
                added_items: this.props.added_items,
                updated_items: this.props.updated_items,
                ignored_items: this.props.ignored_items,
            }
        } else if(this.props.label==="Ingredients"){
            this.state = {
                page_title: "Ingredients",
                table_columns: ['Name', 'Number', 'Vendor Info', 'Size', 'Cost', 'Comment'],
                table_properties: ['name', 'num', 'vendor_info', 'pkg_size', 'pkg_cost', 'comment'],
                added_items: this.props.added_items,
                updated_items: this.props.updated_items,
                ignored_items: this.props.ignored_items,
            }
        } else if(this.props.label==="Formulas"){
            this.state ={
                page_title: "Formulas",
                table_columns: ['Name', 'Number','Case UPC', 'Unit UPC', 'Unit Size', 'Cost per Case', 'Product Line', "Comment"],
                table_properties: ['name', 'num', 'case_upc', 'unit_upc', 'unit_size', 'cpc', 'prod_line', "comment"],
                added_items: this.props.added_items,
                updated_items: this.props.updated_items,
                ignored_items: this.props.ignored_items,
            }
        } else if(this.props.label==="Product Line"){
            this.state = {
                page_title: "Product Line",
                table_columns: ["Name"],
                table_properties: ["name"],
                added_items: this.props.added_items,
                updated_items: this.props.updated_items,
                ignored_items: this.props.ignored_items,
            }
        } else {
            this.state = {
                page_title: "",
                table_columns: [],
                table_properties: [], 
                added_items: [],
                updated_items: [],
                ignored_items: [],
            }
        }

        console.log(this.state.updated_items);
    }

    getPropertyLabel = (col) => {
        return this.state.table_columns[this.state.table_properties.indexOf(col)];
    }

    render() {
        return (
            <div className = "ImportReport">
                <div className="paddedDiv">
                    The following records were added.
                    <Table>
                        <thead>
                            <tr>
                                {this.state.table_properties.map(prop =>
                                    <th key={prop}>
                                        {this.getPropertyLabel(prop)}
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.added_items.map(item =>
                                <tr
                                    key={this.props.label === "Product Line" ? item.name : item.num}
                                >
                                    {this.state.table_properties.map(prop =>
                                    <td
                                        key={prop}
                                    >
                                        {prop === "prod_line" ? item[prop].name : item[prop]}
                                    </td>
                                )}
                                </tr>
                            )}
                        </tbody>
                    </Table>

                    The following records were updated.
                    <Table>
                        <thead>
                            <tr>
                                {this.state.table_properties.map(prop =>
                                    <th key={prop}>
                                        {this.getPropertyLabel(prop)}
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.updated_items.map(item =>
                                <tr
                                    key={this.props.label === "Product Line" ? item.name : item.num}
                                >
                                    {this.state.table_properties.map(prop =>
                                    <td
                                        key={prop}
                                    >
                                         {prop === "prod_line" ? item[prop].name : item[prop]}
                                    </td>
                                )}
                                </tr>
                            )}
                        </tbody>
                    </Table>

                    The following records were ignored
                    <Table>
                        <thead>
                            <tr>
                                {this.state.table_properties.map(prop =>
                                    <th key={prop}>
                                        {this.getPropertyLabel(prop)}
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.ignored_items.map(item =>
                                <tr
                                    key={this.props.label === "Product Line" ? item.name : item.num}
                                >
                                    {this.state.table_properties.map(prop =>
                                    <td
                                        key={prop}
                                    >
                                         {prop === "prod_line" ? item[prop].name : item[prop]}
                                    </td>
                                )}
                                </tr>
                            )}
                        </tbody>
                    </Table>
                
                </div>
            </div>
        )
    }
};

ImportReport.propTypes = {
    table_columns: PropTypes.arrayOf(PropTypes.string),
    table_properties: PropTypes.arrayOf(PropTypes.string),
    added_items: PropTypes.arrayOf(PropTypes.object),
    updated_items: PropTypes.arrayOf(PropTypes.object),
    ignored_items: PropTypes.arrayOf(PropTypes.object),
}