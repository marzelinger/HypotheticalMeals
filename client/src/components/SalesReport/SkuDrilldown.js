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
        
        let today = new Date()
        today.setTime(today.getTime() - 300*60*1000)
        let last_year = new Date(today.getTime() - 300*60*1000)
        last_year.setFullYear(today.getFullYear() - 1)

        this.state = {
            sku_totals_labels: ['Sum of Yearly Rev.', 'Avg. Manu. Run Size', 'Ingr. CPC', 'Avg. Manu. Setup CPC', 'Manu. Run CPC', 'COGS PC', 'Avg. Rev. PC', 'Avg. Profit PC', 'Profit Margin (%)'],
            sku_totals_props: ['sum_yearly_rev', 'avg_manu_run_size', 'ingr_cost_per_case', 'avg_manu_setup_cost_per_case', 'manu_run_cost_per_case', 'total_COGS_per_case', 'avg_rev_per_case', 'avg_profit_per_case', 'profit_marg'],
            today: today.toISOString().substr(0,10),
            last_year: last_year.toISOString().substr(0,10),
            customer: {},
            dateRange: { 'startdate': last_year.toISOString().substr(0,10), 'enddate': today.toISOString().substr(0,10)},
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
    }

    componentDidMount() {
        if (this.props.sku._id !== undefined) {
            this.onSelectSku(this.props.sku)
        }
    }

    async componentDidUpdate(prevProps, prevState) {
        if ( this.props.sku._id !== undefined && this.state.dateRange['startdate'] !== null && 
             this.state.dateRange['enddate'] !== null && this.state.new_data){
            var cust_str = (this.props.customer._id === undefined) ? '_' : this.props.customer._id;
            let datares = await SubmitRequest.submitGetSaleRecordsByFilter('_', cust_str, '_', this.props.sku._id, 

                                this.state.dateRange['startdate'], this.state.dateRange['enddate'], 0, 0)
            console.log(datares.data)
            if(datares.success){
                await this.getTotalRowData(datares.data);
            }
            let newDataPoints = (datares.data.length > 0) ? await this.processDataPoints(datares) : []
            let newMessage = (datares.data.length > 0) ? (<Alert color='primary'>Please select a SKU</Alert>) : 
                                                         (<Alert color='secondary'>No results...</Alert>)
            await this.setState({ 
                data: datares.data,
                dataPoints: newDataPoints,
                message: newMessage,
                new_data: false,
            })
            if (datares.data.length > 0) {
                this.chart.render()
                await this.getTotalRowData(datares.data)
            }
        }
    }

    async getTotalRowData(records){
        var recordsCalcs = await Calculations.getSalesTotals(records);
        console.log("recordCalcs: "+JSON.stringify(recordsCalcs));
        if(recordsCalcs != undefined){
            var total_data = await Calculations.calcTotalData(this.props.sku, recordsCalcs.revenue, recordsCalcs.sales, recordsCalcs.avg_rev_per_case);
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
        let newRange = Object.assign({}, this.state.dateRange)
        newRange[type] = event.target.value
        this.setState({
            dateRange: newRange,
            new_data: true
        })
    }

    getSKUTotals = () => {
        return ( 
            <div>
                 <tr >
                    {this.state.sku_totals_props.map(prop => {
                        return (
                            <th>
                                {this.state.totalRowData[prop]}
                            </th>
                        )
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
                text: this.props.sku.name + ' Sales Report'
            },
            axisX:{
                title: "Date",
            },
            axisY:{
                title: "Revenue (USD)",
                labelFormatter: function ( e ) {
                    return "$" + e.value;  
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
        return this.state.data.map( rec => {
            let rec_return = this.state.item_properties.map( prop => {
                if (prop === 'year' || prop === 'week') {
                    var prop_return = rec.date[prop]
                }
                else if (prop === 'revenue') {
                    var prop_return =  '$' + parseInt(rec.sales) * parseFloat(rec.ppc)
                }
                else if (prop === 'ppc') {
                    var prop_return =  '$' + rec[prop]
                }
                else {
                    var prop_return =  rec[prop]
                }
                return (<td>{prop_return}</td>)
            })
            return (<tr>{rec_return}</tr>)
        })
    }

    injectReportPreview() {
        return (
            <div className='report-container'>
                <Table>
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
                />
            </div>)
    }

    render() {
        console.log(this.props.customer)
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
                    item = {this.props.customer}
                    handleSelectCustomer = {this.onSelectCustomer}
                    className='sku-drilldown-filter'
                />
                <FormGroup className='sku-drilldown-filter'>
                    <Label for="startdate">Start Date</Label>
                    <Input
                        type="date"
                        name="date"
                        id="startdate"
                        defaultValue={this.state.last_year}
                        onChange = {(e) => this.onInputChange(e, 'startdate')}
                    />
                </FormGroup>
                <FormGroup className='sku-drilldown-filter'>
                    <Label for="enddate">End Date</Label>
                    <Input
                        type="date"
                        name="date"
                        id="enddate"
                        defaultValue={this.state.today}
                        onChange = {(e) => this.onInputChange(e, 'enddate')}
                    />
                </FormGroup>
            </div>
            {this.state.data.length > 0 ? this.injectReportPreview() : this.state.message}
        </div>
        );
    }
}

SkuDrilldown.propTypes = {
    sku: PropTypes.object,
    customer: PropTypes.object,
    handleSelectSku: PropTypes.func,
    handleSelectCustomer: PropTypes.func
};