import React from 'react';
import PropTypes from 'prop-types';
import * as Constants from '../../../resources/Constants';

export default class PastYearsReport extends React.Component{
    constructor(props){
        super(props);

        var currDate = new Date();
        this.state = {
            sku : this.props.sku,
            start_date: this.props.start_date,
            end_date: this.props.end_date,
            year_1: this.props.year_1,
            currDate: currDate,
            to_show: ""
        }

    }

    render() {
        return (
            <div>
                {this.props.to_show}
            </div>
        );
    }
}