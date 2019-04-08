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
            sku: this.props.item,
            start_date: new Date(),
            end_date: new Date(),
            showPastYearsReport: false,
            to_show: [],
        }

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        if(this.props.item !== undefined){
            this.setState({
                sku: this.props.item,
            });
        }
    }
/*
    async onChangeStartDate(date){
        console.log(date);
        if(date.getMonth() >= 12 || date.getMonth < 0){
            alert("Please enter a valid month");
            return;
        }
        else if(date.getDay() < 0 || date.getDay() >= 31){
            alert("Please  enter a valid day");
        }
        await this.setState({ start_date: date});
    }*/

    onChangeStartDate = date => this.setState({ start_date: date })
    onChangeEndDate = date => this.setState({ end_date: date })

    async handleSubmit(){
        await this.setState({
            showPastYearsReport: false,
            to_show: [],
        })
        var includeCurrYear = true;
        var wrapAround = false;
        console.log('lets see whats up');

        var startDateDay = await this.state.start_date.getDate(); 
        var startDateMonth = await this.state.start_date.getMonth();
        var endDateDay = await this.state.end_date.getDate();
        var endDateMonth = await this.state.end_date.getMonth();

        var currDate = new Date();
        var currDateDay = await currDate.getDate();
        var currDateMonth = await currDate.getMonth();

        if(endDateMonth > currDateMonth){
            includeCurrYear = false;
        } else if(endDateMonth == currDateMonth){
            if(endDateDay > currDateDay){
                includeCurrYear = false;
            }
        }

        if(startDateMonth > endDateMonth){
            wrapAround = true;
        } else if(startDateMonth == endDateMonth){
            if(startDateDay > endDateDay){
                wrapAround = true;
            }
        }

        var rangesStart = [];
        var rangesEnd = [];
        if(includeCurrYear) var currYear = await this.state.start_date.getFullYear();
        else var currYear = await this.state.start_date.getFullYear()-1;

        for (var i = 0; i < 4; i++){
            rangesEnd[i] = currYear;
            if(wrapAround) rangesStart[i] = currYear - 1;
            else rangesStart[i] = currYear;

            var endMonth = endDateMonth + 1;
            var startMonth = startDateMonth + 1;
            rangesEnd[i] = rangesEnd[i] + "-" + endMonth + "-"+ endDateDay;
            rangesStart[i] = rangesStart[i] + "-" + startMonth + "-"+ startDateDay;
            console.log(rangesStart[i]);
            console.log(rangesEnd[i]);
            currYear = currYear - 1;
        }

        console.log(this.state.sku);

 
        var arrToUse = [];
        for(var i = 0; i < 4; i ++){
            let  datares = await SubmitRequest.submitGetSaleRecordsByFilter('_', '_', '_', this.state.sku._id,
                rangesStart[i], rangesEnd[i], 0, 0)
            console.log("datares is : " + JSON.stringify(datares));
            if(datares.success){
                var recordsCalcs = await Calculations.getSalesTotals(datares.data);
                var currStartEntryArr = rangesStart[i].split("-");
                var start_date = new Date();
                start_date.setFullYear(currStartEntryArr[0]);
                start_date.setMonth(currStartEntryArr[1]-1);
                start_date.setDate(currStartEntryArr[2]);
                //var start_date = new Date(this.state.start_date);
                start_date.setHours(start_date.getHours()+8);

                var currEndEntryArr = rangesEnd[i].split("-");
                var end_date = new Date();
                end_date.setFullYear(currEndEntryArr[0]);
                end_date.setMonth(currEndEntryArr[1]-1);
                end_date.setDate(currEndEntryArr[2]);
                end_date.setHours(end_date.getHours() + 8);

                var total_data = await Calculations.calcTotalData(this.state.sku, recordsCalcs.revenue, recordsCalcs.sales, recordsCalcs.avg_rev_per_case, start_date.toISOString(), end_date.toISOString());
                console.log(total_data);
                total_data.number = i;
                total_data.date_range = "From " + rangesStart[i] + " to " + rangesEnd[i];
            }
            arrToUse.push(total_data);
        }
        console.log('gets here');
        await this.setState({
            showPastYearsReport: true,
            to_show: arrToUse,
        });
    }

    render() {
        return (
            <div>
                <div>
                <DatePicker
                        onChange = {this.onChangeStartDate}
                        value={this.state.start_date}
                        format={"y-M-d"}
                        calendarIcon={null}
                    />
                    <DatePicker
                        onChange = {this.onChangeEndDate}
                        value={this.state.end_date}
                        format={"y-M-d"}
                        calendarIcon={null}
                    />    

                    <Button
                        onClick ={this.handleSubmit}
                    >Get Total Sales for Last 4</Button>
                </div>

                <div>
                    {this.state.showPastYearsReport && <PastYearsReport sku={this.state.item} start_date={this.state.start_date} end_date={this.state.end_date} yearly_revenues={this.state.to_show}></PastYearsReport>}
                </div>
            </div>
        );
    }
}

SalesProjectionModal.propTypes = {
    item: PropTypes.object,
    toggle: PropTypes.func,
};