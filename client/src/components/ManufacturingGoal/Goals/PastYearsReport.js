import React from 'react';
import PropTypes from 'prop-types';
import {Table } from 'reactstrap';
import * as Constants from '../../../resources/Constants';

export default class PastYearsReport extends React.Component{
    constructor(props){
        super(props);

        var currDate = new Date();
        this.state = {
            sku : this.props.sku,
            start_date: this.props.start_date,
            end_date: this.props.end_date,
            yearly_revenues: this.props.yearly_revenues,
            currDate: currDate,
            table_properties: ["date_range", "sum_yearly_rev"],
            table_columns: ["Date Range", "Revenue"]
        }

    }

    getPropertyLabel = (col) => {
        return this.state.table_columns[this.state.table_properties.indexOf(col)];
    }

    render() {
        return (
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
        )
    }
};

PastYearsReport.propTypes = {
    yearly_revenues: PropTypes.arrayOf(PropTypes.object),
}