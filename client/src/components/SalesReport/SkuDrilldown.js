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
//         TableRowColumn,
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
            today: today.toISOString().substr(0,10),
            last_year: last_year.toISOString().substr(0,10),
            sku: {},
            customer: {},
            dateRange: { 'startdate': last_year.toISOString().substr(0,10), 'enddate': today.toISOString().substr(0,10)},
            new_data: false,
            invalid_inputs: [],
            totalRowData: {},
            data: [],
            dataPoints: [],
            item_properties,
            item_property_labels,
            invalid_inputs: [],
            page_name: 'salesReport_sku',
            message: (<Alert color='primary'>Please Select a SKU</Alert>)
        }

        this.onSelectSku = this.onSelectSku.bind(this);
        this.onSelectCustomer = this.onSelectCustomer.bind(this);
    }

    async componentDidUpdate(prevProps, prevState) {
        if ( this.state.sku._id !== undefined && this.state.dateRange['startdate'] !== null && 
             this.state.dateRange['enddate'] !== null && this.state.new_data){
            var cust_str = (this.state.customer._id === undefined) ? '_' : this.state.customer._id;
            let datares = await SubmitRequest.submitGetSaleRecordsByFilter('_', cust_str, '_', this.state.sku._id, 

                                this.state.dateRange['startdate'], this.state.dateRange['enddate'], 0, 0)
            console.log(datares.data)
            if(datares.success){
                await this.getTotalRowData(datares.data);
            }
            let newDataPoints = (datares.data.length > 0) ? await this.processDataPoints(datares) : []
            let newMessage = (datares.data.length > 0) ? (<Alert color='primary'>Please Select a SKU</Alert>) : 
                                                         (<Alert color='secondary'>No Results...</Alert>)
            await this.setState({ 
                data: datares.data,
                dataPoints: newDataPoints,
                message: newMessage,
                new_data: false,
            })
            if (datares.data.length > 0) this.chart.render()
        }
    }

    async getTotalRowData(records){
        var recordsCalcs = Calculations.getSalesTotals(records);
        if(recordsCalcs != undefined){
            var total_data = Calculations.calcTotalData(this.state.sku, recordsCalcs.revenue, recordsCalcs.sales, recordsCalcs.avg_rev_per_case);
            await this.setState({
                totalRowData : total_data
            });
        }
    }

    getPropertyLabel = (prop) => {
        return this.state.item_property_labels[this.state.item_properties.indexOf(prop)];
    }

    async processDataPoints(datares) {
        let dataPoints = [];
        await datares.data.map(rec => {
            let key = 'Wk ' + rec.date.week + ' ' + rec.date.year;
            let rev = 0;
            let ind = dataPoints.findIndex(r => r.label === key);
            if (ind !== -1) {
                rev = dataPoints[ind].y;
                dataPoints.splice(ind, 1);
            }
            rev += parseInt(rec.sales) * parseFloat(rec.ppc);
            dataPoints.push({ label: key, y: rev });
        });
        console.log(dataPoints);
        let cnt = dataPoints[0].label.match('Wk ([0-9]{1,2}) ([0-9]{4})');
        let wk_cnt = parseInt(cnt[1]);
        let yr_cnt = parseInt(cnt[2]);
        var newDataPoints = [];
        for (var i = 0; i < dataPoints.length - 1; i++) {
            newDataPoints.push(dataPoints[i]);
            if (wk_cnt === 52) {
                wk_cnt = 1;
                yr_cnt += 1;
            }
            else
                wk_cnt++;
            while (dataPoints[i + 1].label !== 'Wk ' + wk_cnt + ' ' + yr_cnt) {
                console.log('in while')
                newDataPoints.push({ label: 'Wk ' + wk_cnt + ' ' + yr_cnt, y: 0 });
                if (wk_cnt === 52) {
                    wk_cnt = 1;
                    yr_cnt += 1;
                }
                else
                    wk_cnt++;
            }
        }
        newDataPoints.push(dataPoints[dataPoints.length - 1]);
        console.log(newDataPoints);
        return newDataPoints;
    }

    async onSelectSku(sku) {
        let skures = await SubmitRequest.submitGetSkuByID(sku._id)
        this.setState({
            sku: skures.data[0],
            new_data: true
        })
        console.log(skures.data[0])
    }

    async onSelectCustomer(customer) {
        console.log(customer)
        let custres = customer._id !== undefined ? await SubmitRequest.submitGetCustomerByID(customer._id) : {data: [{}]}
        console.log(custres.data[0])
        this.setState({
            customer: custres.data[0],
            new_data: true
        })
        console.log(custres.data[0])
    }

    onInputChange(event, type) {
        console.log("this is the tyep: "+type);
        console.log("this is the val: "+event.target.value);
        let newRange = Object.assign({}, this.state.dateRange)
        newRange[type] = event.target.value
        this.setState({
            dateRange: newRange,
            new_data: true
        })
        console.log(newRange)
    }

    getOptions() {
        let options = {
            animationEnabled: true,
            title: {
                text: this.state.sku.name + ' Sales Report'
            },
            data: [{				
                type: "line",
                dataPoints: this.state.dataPoints
             }]
        }
        console.log(options)
        return options
    }

    injectTable() {
        return this.state.data.map( rec => {
            let rec_return = this.state.item_properties.map( prop => {
                if (prop === 'year' || prop === 'week') {
                    var prop_return = rec.date[prop]
                }
                else if (prop === 'revenue') {
                    var prop_return =  parseInt(rec.sales) * parseFloat(rec.ppc)
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
                <div class="table-wrapper-scroll-y my-custom-scrollbar">
                    <Table>
                        <thead>
                            <tr>
                                {this.state.item_property_labels.map(lab => <th>{lab}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {this.injectTable()}
                        </tbody>
                    </Table> 
                </div>
                <CanvasJSChart options = {this.getOptions()}
                    onRef = {ref => this.chart = ref}
                />
                <ExportSimple 
                    data = {this.state.data} 
                    fileTitle = {this.state.page_name}
                /> 
            </div>)
    }

    render() {
        return (
        <div className='sku-drilldown'>
            <div className='filter-container'>
                <CustomerSelectSalesReport
                    item = {this.state.customer}
                    handleSelectCustomer = {this.onSelectCustomer}
                />
                <ItemSearchInput
                    curr_item={this.state.sku}
                    item_type={Constants.sku_label}
                    invalid_inputs={this.state.invalid_inputs}
                    handleSelectItem={this.onSelectSku}
                    disabled = {false}
                />
                <FormGroup>
                    <Label for="startdate">Start Date</Label>
                    <Input
                        type="date"
                        name="date"
                        id="startdate"
                        defaultValue={this.state.last_year}
                        onChange = {(e) => this.onInputChange(e, 'startdate')}
                    />
                <FormGroup>
                </FormGroup>
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
    customer: PropTypes.object,
    handleSelectCustomer: PropTypes.func
};