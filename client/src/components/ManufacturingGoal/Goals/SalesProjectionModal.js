import React from 'react';
import { Button, Progress } from 'reactstrap';
import PropTypes from 'prop-types';
import * as Constants from '../../../resources/Constants';
import DatePicker from 'react-date-picker';
import PastYearsReport from './PastYearsReport';
import SubmitRequest from '../../../helpers/SubmitRequest';
import Calculations from '../../SalesReport/Calculations';
import './../../SideBySideBox.css';

export default class SalesProjectionModal extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            sku: this.props.item,
            start_date: new Date(),
            end_date: new Date(),
            showPastYearsReport: false,
            to_show: [],
            loading: false,
            sales_average: "",
            std_dev: "",
        }

        this.handleSubmit = this.handleSubmit.bind(this);
        this.standardDeviation = this.standardDeviation.bind(this);
    }

    componentDidMount() {

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

    onChangeStartDate = date => {
        if(date != null) {
            var newDate = new Date;
            newDate.setDate(date.getDate());
            newDate.setMonth(date.getMonth());
            this.setState({ start_date: newDate })
        } else this.setState({start_date: date});
    }
    onChangeEndDate = date => {
        if(date != null) {
            var newDate = new Date;
            newDate.setDate(date.getDate());
            newDate.setMonth(date.getMonth());
            this.setState({ end_date: newDate })
        } else this.setState({end_date: date});
    }

    async handleSubmit(){
        if(this.state.start_date == null || this.state.end_date == null){
            alert('Please enter a valid start and end date');
            return;
        }
        await this.setState({
            showPastYearsReport: false,
            to_show: [],
        })

        await this.setState({
            loading: true,
        });
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
        var yearlyRevArry = [];
        var total = 0;
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
                total += Number(total_data.sum_yearly_rev);
                arrToUse.push(total_data);
                yearlyRevArry.push(total_data.sum_yearly_rev);
            }
            else{ 
                alert("FUCK");
                return;
            }
        }
        var avg = total/4;
        var std_dev = await this.standardDeviation(yearlyRevArry, avg);
        avg = avg.toFixed(2) + "";
        console.log('gets here');
        std_dev = std_dev.toFixed(5) + "";

        console.log(avg);
        console.log(std_dev);
        await this.setState({
            loading: false,
            showPastYearsReport: true,
            to_show: arrToUse,
            sales_average: avg,
            std_dev: std_dev,
        });
    }

    async standardDeviation(values, avg){        
        var squareDiffs = values.map(function(value){
          var diff = value - avg;
          var sqrDiff = diff * diff;
          return sqrDiff;
        });

        var total= 0;
        for(var i = 0; i < squareDiffs.length; i++){
            total+=squareDiffs[i];
        }
        var avgSquareDiff = total/squareDiffs.length;
      
        var stdDev = Math.sqrt(avgSquareDiff);
        return stdDev;
    }

    onCalenderOpen = () => {

    }

    render() {
        return (
            <div>
                <h1>{this.state.sku.name} Yearly Sales Report</h1>
                <div>
                    <div className = "paddedDiv">
                    Please enter a start date.
                        <DatePicker
                                onChange = {this.onChangeStartDate}
                                value={this.state.start_date}
                                format={"M-d-y"}
                                calendarIcon={null}
                                onCalenderOpen={this.onCalenderOpen}
                        />
                    </div>
                    <div className = "paddedDiv">
                        Please enter an end date.
                        <DatePicker
                            onChange = {this.onChangeEndDate}
                            value={this.state.end_date}
                            format={"M-d-y"}
                            calendarIcon={null}
                        />  
                    </div>  

                    <div className ="centerContainer">
                        <Button className="centerButton"
                            onClick ={this.handleSubmit}
                        >Get Past Yearly Revenue</Button>
                    </div>
                </div>

                <div>
                { this.state.loading ? <Progress animated value={100}/> : null}
                </div>

                <div>
                    {this.state.showPastYearsReport && <PastYearsReport sku={this.state.item} start_date={this.state.start_date} end_date={this.state.end_date} sales_average={this.state.sales_average} std_dev={this.state.std_dev} yearly_revenues={this.state.to_show}></PastYearsReport>}
                </div>
            </div>
        );
    }
}

SalesProjectionModal.propTypes = {
    item: PropTypes.object,
    toggle: PropTypes.func,
};