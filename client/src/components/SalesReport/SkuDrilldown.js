// CustomerSelectSalesReport.js

import React from 'react'
import PropTypes from 'prop-types';
import * as Constants from '../../resources/Constants';
import { 
    Button,
    Input,
    FormGroup,
    Table,
    Label,
    Alert } from 'reactstrap';
// import { 
//         Table,
//         TableHeader,
//         TableRow,
//         th,
//         TableBody,
//         TableHeaderColumn } from 'material-ui/Table';
import SubmitRequest from '../../helpers/SubmitRequest';
import CustomerSelectSalesReport from './CustomerSelectSalesReport'
import ItemSearchInput from '../ListPage/ItemSearchInput'
import Calculations from './Calculations'

import DataStore from '../../helpers/DataStore';
import CanvasJSReact from '../../assets/canvasjs.react';
import ExportSimple from '../export/ExportSimple'
var CanvasJSChart = CanvasJSReact.CanvasJSChart;
var moment = require('moment');


export default class SkuDrilldown extends React.Component {
    constructor(props) {
        super(props);

        let {
            item_properties, 
            item_property_labels} = DataStore.getSkuSaleReportData();

        this.state = {
            sku_totals_labels: ['Sum of Yearly Rev.', 'Avg. Manu. Run Size', 'Ingr. CPC', 'Avg. Manu. Setup CPC', 'Manu. Run CPC', 'COGS PC', 'Avg. Rev. PC', 'Avg. Profit PC', 'Profit Margin (%)'],
            sku_totals_props: ['sum_yearly_rev', 'avg_manu_run_size', 'ingr_cost_per_case', 'avg_manu_setup_cost_per_case', 'manu_run_cost_per_case', 'total_COGS_per_case', 'avg_rev_per_case', 'avg_profit_per_case', 'profit_marg'],
            new_data: false,
            invalid_inputs: [],
            totalRowData: {},
            data: [],
            dataPoints: [],
            totalRowData: {},
            item_properties,
            item_property_labels,
            invalid_inputs: [],
            page_name: 'salesReport_sku',
            message: (<Alert color='primary'>Please select a SKU</Alert>),
        }

        this.onSelectSku = this.onSelectSku.bind(this);
        this.onSelectCustomer = this.onSelectCustomer.bind(this);
        // this.checkPriceLength = this.checkPriceLength.bind(this);
    }

    componentDidMount() {
        if (this.props.sku._id !== undefined) {
            this.onSelectSku(this.props.sku)
        }
    }

    async componentDidUpdate(prevProps, prevState) {
        if ( this.props.sku._id !== undefined && this.props.dateRange['startdate'] !== null && 
             this.props.dateRange['enddate'] !== null && this.state.new_data){
            var cust_str = (this.props.customer._id === undefined) ? '_' : this.props.customer._id;
            let datares = await SubmitRequest.submitGetSaleRecordsByFilter('_', cust_str, '_', this.props.sku._id, 
                                this.props.dateRange['startdate'], this.props.dateRange['enddate'], 0, 0)
            console.log("This is what I care about: " + this.props.dateRange['startdate']);
            console.log("this is what I care about: " + this.props.dateRange['enddate']);
            console.log(datares.data)
            if(datares.success){
                await this.getTotalRowData(datares.data);
            }
            if(datares.data !== undefined){
                let newDataPoints = (datares.data.length > 0) ? await this.processDataPoints(datares) : []
                let newMessage = (datares.data.length > 0) ? (<Alert color='primary'>Please seleect a SKU</Alert>) : 
                                                            (<Alert color='secondary'>No results...</Alert>)
                await this.setState({ 
                    data: datares.data,
                    dataPoints: newDataPoints,
                    message: newMessage,
                    new_data: false,
                })
                console.log(this.props.dateRange_valid)
                if (datares.data.length > 0 && this.props.dateRange_valid) {
                    this.chart.render()
                    await this.getTotalRowData(datares.data)
                }
            }
            if(datares.data==undefined){
                let newDataPoints = []
                let newMessage = (<Alert color='secondary'>No results...</Alert>)
                await this.setState({ 
                    data: datares.data,
                    dataPoints: newDataPoints,
                    message: newMessage,
                    new_data: false,
                })
            }
        }
    }


    async getTotalRowData(records){
        var recordsCalcs = await Calculations.getSalesTotals(records);
        console.log("recordCalcs: "+JSON.stringify(recordsCalcs));
        if(recordsCalcs != undefined){
            //format dates.
            //into ISO
            var start_date = new Date(this.props.dateRange.startdate);
            start_date.setHours(start_date.getHours() + 8);
            var end_date = new Date(this.props.dateRange.enddate)
            end_date.setHours(end_date.getHours() + 8);

            console.log("start_sku: "+ start_date.toISOString());
            console.log("end_sku: "+ start_date.toISOString());

            var total_data = await Calculations.calcTotalData(this.props.sku, recordsCalcs.revenue, recordsCalcs.sales, recordsCalcs.avg_rev_per_case, start_date.toISOString(), end_date.toISOString());
            await this.setState({
                totalRowData : total_data
            });
        }
    }

    getPropertyLabel = (prop) => {
        return this.state.item_property_labels[this.state.item_properties.indexOf(prop)];
    }

    async processDataPoints(datares) {
        let dataPoints = []
        await datares.data.map(rec => {
            let date = moment().year(rec.date.year).week(rec.date.week).startOf('isoweek').toDate();
            console.log("this is the date: "+date);
            let rev = 0;
            let ind = dataPoints.findIndex(r => {
                let rx = new Date(r.x)
                let dd = new Date(date)
                return Math.abs(rx.getTime() - dd.getTime()) < 1
            });
            if (ind !== -1) {
                rev = dataPoints[ind].y;
                dataPoints.splice(ind, 1);
            }
            rev += parseInt(rec.sales) * parseFloat(rec.ppc);
            dataPoints.push({ x: date, y: rev });
        })
        dataPoints.sort(function(a,b){
            return new Date(a.x) - new Date(b.x);
        })
        let newPoints = []
        let last = dataPoints[0]
        dataPoints.map(dp => {
            let lastDate = new Date(last.x)
            let nextDate = new Date(dp.x)
            let diff = nextDate.getTime() - lastDate.getTime()
            while (diff >= 2*604800000) {
                let newDate = lastDate
                newDate.setTime(lastDate.getTime() + 604800000)
                let newPoint = { x: new Date(newDate), y: 0}
                diff = diff - 604800000
                newPoints.push(newPoint)
                lastDate = newDate
            }
            last = dp
        })
        newPoints.map(dp => dataPoints.push(dp))
        dataPoints.sort(function(a,b){
            return new Date(a.x) - new Date(b.x);
        })
        return dataPoints;
    }

    async onSelectSku(sku) {
        let skures = await SubmitRequest.submitGetSkuByID(sku._id)
        await this.props.handleSelectSku(skures.data[0])
        this.setState({
            new_data: true
        })
    }

    async onSelectCustomer(customer) {
        let custres = customer._id !== undefined ? await SubmitRequest.submitGetCustomerByID(customer._id) : {data: [{}]}
        await this.props.handleSelectCustomer(custres.data[0])
        this.setState({
            new_data: true
        })
    }

    onInputChange(event, type) {
        console.log(type)
        this.props.handleDateRangeSelect(event, type)
        this.setState({
            new_data: true
        })
    }

    getSKUTotals = () => {
        return ( 
            <div>
                 <tr >
                    {this.state.sku_totals_props.map(prop => {
                        if (['sum_yearly_rev', 'ingr_cost_per_case', 'avg_manu_setup_cost_per_case', 'manu_run_cost_per_case', 'total_COGS_per_case', 'avg_rev_per_case', 'avg_profit_per_case'].includes(prop)){
                            var toDisplay = '$' + Calculations.checkPriceLength(this.state.totalRowData[prop])
                        } 
                        else var toDisplay = this.state.totalRowData[prop]
                        return <td>{toDisplay}</td>
                    }
                    )}
                    </tr>

            </div>
        );

    }

    getOptions() {
        let options = {
            animationEnabled: true,
            zoomEnabled: true,
            interactivityEnabled: true,
            theme: "light2",
            title: {
                text: this.props.sku.name + ' Weekly Revenue',
                fontFamily: 'calibri',
                fontWeight: 'normal'
            },
            axisX:{
                title: "Date",
            },
            axisY:{
                title: "Revenue (USD)",
                labelFormatter: function ( e ) {
                    return "$" + Calculations.checkPriceLength(e.value);  
                }  
            },
            data: [{				
                type: "line",
                dataPoints: this.state.dataPoints
             }]
        }
        return options
    }

    injectTable() {
        if(this.state.data!=undefined){
            return this.state.data.map( rec => {
                let rec_return = this.state.item_properties.map( prop => {
                    if (prop === 'year' || prop === 'week') {
                        var prop_return = rec.date[prop]
                    }
                    else if (prop === 'revenue') {
                        var prop_return =  '$' + Calculations.checkPriceLength(parseInt(rec.sales) * parseFloat(rec.ppc))
                    }
                    else if (prop === 'ppc') {
                        var prop_return =  '$' + Calculations.checkPriceLength(rec[prop])
                    }
                    else {
                        var prop_return =  rec[prop]
                    }
                    return (<td>{prop_return}</td>)
                })
                return (<tr>{rec_return}</tr>)
            })
        }
    }

    injectReportPreview() {
        return (
            <div className='report-container'>
                <Table className='sku-drilldown-table'>
                    <thead>
                        <tr>
                            {this.state.item_property_labels.map(lab => <th>{lab}</th>)}
                        </tr>
                    </thead>
                    <div class="table-wrapper-scroll-y my-custom-scrollbar">
                        <tbody>
                            {this.injectTable()}
                        </tbody>
                    </div>
                </Table> 
                <div className='export-button'>
                    <ExportSimple 
                        data = {this.state.data} 
                        fileTitle = {this.state.page_name}
                        name = {'Export Table'}
                        className = 'sku-drilldown-export'
                    /> 
                </div>
                <div className = "report-container-general-total">
                    <Table>
                        <thead>
                            <tr className = "" selectable = {false} >
                                {this.state.sku_totals_labels.map(prop => 
                                    <th>{prop}</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {this.getSKUTotals(this.state.totalRowData)}
                        </tbody>
                    </Table>
                </div>
                <CanvasJSChart 
                    options = {this.getOptions()}
                    onRef = {ref => this.chart = ref}
                    className='sku-drilldown-chart'
                />
            </div>)
    }

    handleDateChangeRaw = (e) => {
        e.preventDefault();
      }

    render() {
        return (
        <div className='sku-drilldown'>
            <div className='filter-container'>
                <ItemSearchInput
                    curr_item={this.props.sku}
                    item_type={Constants.sku_label}
                    invalid_inputs={this.state.invalid_inputs}
                    handleSelectItem={this.onSelectSku}
                    disabled = {false}
                    className='sku-drilldown-filter'
                />
                <CustomerSelectSalesReport
                    customer = {this.props.customer}
                    handleSelectCustomer = {this.onSelectCustomer}
                    className='sku-drilldown-filter'
                />
                <FormGroup className='sku-drilldown-filter'>
                    <Label for="startdate">Start Date</Label>
                    <Input
                        type="date"
                        name="date"
                        id="startdate"
                        defaultValue={this.props.dateRange.startdate}
                        onChange = {(e) => this.onInputChange(e, 'startdate')}
                        max={moment(this.props.dateRange.enddate).format("YYYY-MM-DD")}
                        invalid={!this.props.dateRange_valid}
                    />
                </FormGroup>
                <FormGroup className='sku-drilldown-filter'>
                    <Label for="enddate">End Date</Label>
                    <Input
                        type="date"
                        name="date"
                        id="enddate"
                        defaultValue={this.props.dateRange.enddate}
                        onChange = {(e) => this.onInputChange(e, 'enddate')}
                        max={moment().format("YYYY-MM-DD")}
                        invalid={!this.props.dateRange_valid}
                    />
                </FormGroup>
            </div>
            {this.state.data !== undefined && this.props.dateRange_valid ?
                (<div>
                {this.state.data.length > 0 ? this.injectReportPreview() : this.state.message}
                </div>)
                :
                <div></div>
            }
        </div>
        );
    }
}

SkuDrilldown.propTypes = {
    sku: PropTypes.object,
    customer: PropTypes.object,
    handleSelectSku: PropTypes.func,
    handleSelectCustomer: PropTypes.func,
    handleDateRangeSelect: PropTypes.func,
    dateRange: PropTypes.object,
    dateRange_valid: PropTypes.bool
};