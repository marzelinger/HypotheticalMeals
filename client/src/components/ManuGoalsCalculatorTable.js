
import React from 'react';
import ExportSimple from './export/ExportSimple';
import PropTypes from 'prop-types';
import { Button, Table } from 'reactstrap';

export default class ManuGoalsCalculatorTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: props.data,
            page_title: 'calculator',
            table_columns: ['Name', 'Number', 'Vendor Information', 'Package Size', 'Package Cost', 'SKUs', 'Quantity in Goal'],
            table_properties: ['name', 'num', 'vendor_info', 'pkg_size', 'pkg_cost', 'skus', 'goalQuantity']
        };
    }

    getPropertyLabel = (col) => {
        return this.state.table_columns[this.state.table_properties.indexOf(col)];
      }

    render() {
        console.log(this.state.data)
        return (
            <div className="list-page">
                <div>
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
                        {this.state.data.map((item, index) => 
                            <tr key={item.num + index}>
                            {this.state.table_properties.map(prop => 
                                <td key={prop}>
                                {item[prop]}
                                </td>
                            )}
                            </tr>
                        )}
                        </tbody>
                    </Table>
                </div>
                <ExportSimple data = {this.state.data} fileTitle = {this.state.page_title}/>               
            </div>
        );
    }
}

ManuGoalsCalculatorTable.propTypes = {
    data: PropTypes.array
}