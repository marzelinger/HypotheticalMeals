import React from 'react';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import * as Constants from '../../../resources/Constants';
import DatePicker from 'react-date-picker';
import PastYearsReport from './PastYearsReport';
import SubmitRequest from '../../../helpers/SubmitRequest';
import Calculations from '../../SalesReport/Calculations';


export default class SalesProjectionModal extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            item: this.props.item,
            start_date: new Date(),
            end_date: new Date(),
            showPastYearsReport: false,
            start_dates: [],
            end_dates: [],
            to_show: "",
        }

    }

    onChangeStartDate = date => {
        if(date.getMonth() >= 12 || date.getMonth < 0){
            alert("Please enter a valid month");
            return;
        }
        else if(date.getDay() < 0 || date.getDay() >= 31){
            alert("Please  enter a valid day");
        }
        this.setState({ start_date: date});

    }
    onChangeEndDate = date => this.setState({ end_date: date});

    async handleSubmit(){
        let  datares = await SubmitRequest.submitGetSaleRecordsByFilter('_', '_', this.props.item._id,
            this.state.start_date, this.state.end_date, 0, 0)
        if(datares.success){
            var recordsCalcs = await Calculations.getSalesTotals(datares.data);
            var start_date = new Date(this.state.start_date);
            start_date.setHours(start_date.getHours()+8);
            var end_date = new Date(this.state.end_date);
            end_date.setHours(end_date.getHours() + 8);

            var total_data = await Calculations.calcTotalDate(this.state.item, recordsCalcs.revenue, recordsCalcs.sales, recordsCalcs.avg_rev_per_case, start_date.toISOString(), end_date.toISOString());
        }
        await this.setState({
            showPastYearsReport: true,
            to_show: total_data,
        });
    }

    render() {
        return (
            <div>
                <div>
                    <DatePicker
                        onChange = {this.onChangeStartDate}
                        value={this.state.start_date}
                        format={"M-d"}
                    />
                    <DatePicker
                        onChange = {this.onChangeEndDate}
                        value={this.state.end_date}
                        format={"M-d"}
                    />
                    <Button
                        onClick ={this.handleSubmit}
                    >Fuck</Button>
                </div>

                <div>
                    {this.state.showPastYearsReport && <PastYearsReport sku={this.state.item} start_date={this.state.start_date} end_date={this.state.end_date} to_show={this.state.to_show}></PastYearsReport>}
                </div>
            </div>
        );
    }
}

SalesProjectionModal.propTypes = {
    item: PropTypes.object,
    toggle: PropTypes.func,
};