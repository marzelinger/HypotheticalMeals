import React from 'react';
import PropTypes from 'prop-types';
import {Button, Table } from 'reactstrap';
import * as Constants from '../../../resources/Constants';

export default class PastYearsReport extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            sku : this.props.sku,
            start_date: this.props.start_date,
            end_date: this.props.end_date,
            yearly_revenues: this.props.yearly_revenues,
            table_properties: ["date_range", "sales"],
            table_columns: ["Date Range", "Sales"],
            std_dev: this.props.std_dev,
            sales_average: this.props.sales_average,
        }

    }

    getPropertyLabel = (col) => {
        return this.state.table_columns[this.state.table_properties.indexOf(col)];
    }

    render() {
        return (
            <div>
                <div>
                <Table>
                    <thead>
                        <tr style={{gridTemplateColumns: `repeat( ${this.state.table_properties.length}, minmax(100px, 1fr))`}}>
                        {this.state.table_properties.map(prop =>
                            <th key={prop}>
                                {this.getPropertyLabel(prop)}
                            </th>
                        )}
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.yearly_revenues.map(item => 
                            <tr
                            style ={{gridTemplateColumns: `repeat( ${this.state.table_properties.length}, minmax(100px, 1fr))` }}
                                key={item.number}
                            >
                                {this.state.table_properties.map(prop =>
                                    <td
                                        key={prop}
                                    >
                                        {item[prop]} 
                                    </td>
                                )}
                            </tr>)}
                    </tbody>

                </Table>
                </div>
                <div>
                    <h2> Summary Row</h2>
                    <div className="centerContainer">
                        {this.state.sales_average} +/- {this.state.std_dev}
                    </div>
                </div>

                <div className="centerContainer ">
                    <Button className="centerButton"
                        onClick={() => this.props.useAverage(this.state.sales_average)}> Use average sales as quantity</Button>
                </div>
                
            </div>
        )
    }
};

PastYearsReport.propTypes = {
    yearly_revenues: PropTypes.arrayOf(PropTypes.object),
    useAverage: PropTypes.func,
}