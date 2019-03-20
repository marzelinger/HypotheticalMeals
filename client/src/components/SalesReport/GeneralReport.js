// GeneralReport.js

import React from 'react'
import PropTypes from 'prop-types';
import * as Constants from '../../resources/Constants';
import LoadingOverlay from 'react-loading-overlay';
import { 
    Button,
    Input,
    FormGroup,
    Row,
    Col,
    Label } from 'reactstrap';
    import {
        Table,
        TableBody,
        TableFooter,
        TableHeader,
        TableHeaderColumn,
        TableRow,
        TableRowColumn,
      } from 'material-ui/Table';
import SubmitRequest from '../../helpers/SubmitRequest';
import CustomerSelectSalesReport from './CustomerSelectSalesReport'
import ProductLineSelectSalesReport from './ProductLineSelectSalesReport'
import Calculations from './Calculations'
// import { Table } from 'reactstrap';
import ItemSearchInput from '../ListPage/ItemSearchInput'

const currentUserIsAdmin = require("../auth/currentUserIsAdmin");

export default class GeneralReport extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            sku_yr_table_properties: ['Year', 'Total Revenue (USD)', 'Average Revenue Per Case (USD)'],
            sku_totals_properties: ['Sum of Yearly Rev. (USD)', 'Avg. Manu. Run Size', 'Ingr. CPC (USD)', 'Avg. Manu. Setup CPC (USD)', 'Manu. Run CPC (USD)', 'COGS PC (USD)', 'Avg. Rev. PC (USD)', 'Avg. Profit PC (USD)', 'Profit Margin (%)'],
            sku_header_table_properties: ['Name', 'SKU#', 'Case UPC#', 'Unit UPC#', 'Unit Size', 'CPC (USD)', 'Setup Cost (USD)', 'Run CPC (USD)'],
            prod_lines: Object.assign({}, props.general_prod_lines),
            customer: Object.assign({}, props.general_customers),
            invalid_inputs: [],
            new_data: false,
            report_button: false,
            total_years: 10,
            tenYRdata: Object.assign({}, props.general_report_data),
            dataRanges: [],
            years: [],
            loading: false
        }

        this.calculateYears = this.calculateYears.bind(this);
        this.onSelectProductLine = this.onSelectProductLine.bind(this);
        this.onSelectCustomer = this.onSelectCustomer.bind(this);
    }

    async componentDidMount() {
        await this.calculateYears();
    }

    async calculateYears(){
        var curDate = new Date();
        var curYear = curDate.getFullYear();
        var first = curYear-9;
        var second = curYear-8;
        var third = curYear-7;
        var fourth = curYear-6;
        var fifth = curYear-5;
        var sixth = curYear-4;
        var seventh = curYear-3;
        var eighth = curYear-2;
        var ninth = curYear-1;
        var tenth = curYear;

        var newYears =  [
            first,
            second,
            third,
            fourth,
            fifth,
            sixth,
            seventh,
            eighth,
            ninth,
            tenth
        ];

        var newDateRanges =  [
            //start jan 1 2010
            { 'startdate': first+"-01-01", 'enddate': first+"-12-31"},
            { 'startdate': second+"-01-01", 'enddate': second+"-12-31"},
            { 'startdate': third+"-01-01", 'enddate': third+"-12-31"},
            { 'startdate': fourth+"-01-01", 'enddate': fourth+"-12-31"},
            { 'startdate': fifth+"-01-01", 'enddate': fifth+"-12-31"},
            { 'startdate': sixth+"-01-01", 'enddate': sixth+"-12-31"},
            { 'startdate': seventh+"-01-01", 'enddate': seventh+"-12-31"},
            { 'startdate': eighth+"-01-01", 'enddate': eighth+"-12-31"},
            { 'startdate': ninth+"-01-01", 'enddate': ninth+"-12-31"},
            { 'startdate': tenth+"-01-01", 'enddate': tenth+"-12-31"}
            //end dec 31 2019
        ];
        await this.setState({
            dataRanges: newDateRanges,
            years: newYears
        })
    }

    async componentDidUpdate(prevProps, prevState) {
        if ( this.state.prod_lines.length !== 0 && this.state.new_data){
            //await this.updateReportData();
        }
    }

    updateReportData = async () => {
        await this.setState({
            loading: true,
            report_button: true
        });
        var new_ten_yr_data = {
                 prodLines: []
                 };

        var cust_str = (this.state.customer._id === undefined) ? '_' : this.state.customer._id;
        
        if(this.state.prod_lines.length>0){
            for(let pl = 0; pl<this.state.prod_lines.length; pl++){
                //there are product lines to generate data for.
                var skus_res = await SubmitRequest.submitGetSkusByProductLineID(this.state.prod_lines[pl]._id);
                if(skus_res.success){
                    var skus = skus_res.data;
                    //this will be the data for each sku in this prod line for the ten years
                    //want to then use that to make a table
                    //await this.calculateYears();
                    var tenYRSKUsdata = await Calculations.getTenYRSalesData(skus, cust_str, this.state.dataRanges, this.state.years);
                    new_ten_yr_data.prodLines.push({prod_line: this.state.prod_lines[pl], tenYRSKUdata: tenYRSKUsdata});
                    await this.setState({tenYRdata: new_ten_yr_data});
                    await this.props.handleGeneralReportDataChange(this.state.tenYRdata, this.state.prod_lines, this.state.customer);
                    //console.log("this is the tenyr: "+JSON.stringify(this.state.tenYRdata));
                }
                else {
                    new_ten_yr_data.prodLines.push({prod_line: this.state.prod_lines[pl], tenYRSKUdata: { skus: []}});
                    await this.setState({tenYRdata: new_ten_yr_data});
                    await this.props.handleGeneralReportDataChange(this.state.tenYRdata, this.state.prod_lines, this.state.customer);
                }
            }
        }
        await this.setState({new_data: false});
        await this.setState({
            loading: false
        });
    }

    onSKUSelect = (e, item) => {

    }

    getPropertyLabel = (col) => {
        return this.props.columns[this.props.table_properties.indexOf(col)];
      }

      //{prod_line: this.state.prod_lines[pl], tenYRSKUdata: tenYRSKUsdata})
      //tenyrskudata: {}
      //                tenYRSKUsdata.skus.push({sku: skus[s]._id, skuData: curSkuData, totalData: skuTotalData});

    //need to go through all prod lines and make a new table for each
    //for each prod line go through and create the header
    //then for each set of skus for the prodline, put the sku header, the sku rows, the sku total

    getSKUTotals = (cur_sku) => {
        return ( 
            <div>
                 <TableRow  class= "cols trselect">
                        <TableRowColumn>
                            {'$'+cur_sku.totalData.sum_yearly_rev}
                        </TableRowColumn>
                        <TableRowColumn>
                            {cur_sku.totalData.avg_manu_run_size}
                        </TableRowColumn>
                        <TableRowColumn>
                            {'$'+cur_sku.totalData.ingr_cost_per_case}
                        </TableRowColumn>
                        <TableRowColumn>
                            {'$'+cur_sku.totalData.avg_manu_setup_cost_per_case}
                        </TableRowColumn>
                        <TableRowColumn>
                            {'$'+cur_sku.totalData.manu_run_cost_per_case}
                        </TableRowColumn>
                        <TableRowColumn>
                            {'$'+cur_sku.totalData.total_COGS_per_case}
                        </TableRowColumn>
                        <TableRowColumn>
                            {'$'+cur_sku.totalData.avg_rev_per_case}
                        </TableRowColumn>
                        <TableRowColumn>
                            {'$'+cur_sku.totalData.avg_profit_per_case}
                        </TableRowColumn>
                        <TableRowColumn>
                            {cur_sku.totalData.profit_marg}
                        </TableRowColumn>
                    </TableRow>

            </div>
        );

    }

    getRecordsTable = (cur_sku) => {
        return (
            <div>
                {cur_sku.skuData.map((skuData, ind) =>
                                    // need to show the val in the sku data here.
                                    //here we have the yr, sales data, and the sku# stuff
                                    <TableRow  class= "cols trselect">
                                        <TableRowColumn>
                                            {cur_sku.skuData[ind].yr}
                                        </TableRowColumn>
                                        <TableRowColumn>
                                        {'$'+cur_sku.skuData[ind].salesData.revenue}
                                        </TableRowColumn>
                                        <TableRowColumn>
                                        {'$'+cur_sku.skuData[ind].salesData.avg_rev_per_case}
                                        </TableRowColumn>
                                    </TableRow>
                                )} 
            </div>

        );

    }

    getSKUTable = (cur_sku) => {
        return (
            <div>
                <TableRow  class= "cols trselect">
                    <TableRowColumn>
                        {cur_sku.sku.name}
                    </TableRowColumn>
                    <TableRowColumn>
                    {cur_sku.sku.num}
                    </TableRowColumn>
                    <TableRowColumn>
                    {cur_sku.sku.case_upc}
                    </TableRowColumn>
                    <TableRowColumn>
                    {cur_sku.sku.unit_upc}
                    </TableRowColumn>
                    <TableRowColumn>
                    {cur_sku.sku.unit_size}
                    </TableRowColumn>
                    <TableRowColumn>
                    {'$'+cur_sku.sku.cpc}
                    </TableRowColumn>
                    <TableRowColumn>
                    {'$'+cur_sku.sku.setup_cost}
                    </TableRowColumn>
                    <TableRowColumn>
                    {'$'+cur_sku.sku.run_cpc}
                    </TableRowColumn>
                </TableRow>
            </div>

        );

    }

    prodLineHeader = (pl_row) => {
        return (
            <TableRow class= "cols trselect">
                <TableHeaderColumn>Product Line: {pl_row.prod_line.name}</TableHeaderColumn>
            </TableRow>

        );
    }

    recordsLabelHeader = () => {
        return (
            <TableRow class= "cols trselect" selectable = {false} >
                {this.state.sku_yr_table_properties.map(prop => 
                    <TableHeaderColumn>{prop}</TableHeaderColumn>
                )}
            </TableRow>
        );
    }

    skuLabelHeader = (cur_sku) => {
        return (
            <TableRow class= "cols trselect" selectable = {false}>
                {this.state.sku_header_table_properties.map(prop => 
                    <TableHeaderColumn>{prop}</TableHeaderColumn>
                )}
            </TableRow>
        );
    }

    skuTotalsHeader = () => {
        return (
                <TableRow className = "cols" selectable = {false} >
                    {this.state.sku_totals_properties.map(prop => 
                        <TableHeaderColumn>{prop}</TableHeaderColumn>
                    )}
                </TableRow>
        );
    }


    generalReportTables = () => {
        console.log("DATA IS: "+ JSON.stringify(this.state.tenYRdata));
        console.log("report button "+ this.state.report_button);
        if(this.state.tenYRdata.prodLines!= undefined){
            if (this.state.tenYRdata.prodLines.length>0){
                // console.log("DATA IS: "+ JSON.stringify(this.state.tenYRdata));
                // console.log("DATA SKU LENGTH: "+ JSON.stringify(this.state.tenYRdata.prodLines[0].skus.length));
                console.log("here");
                return (
                    <div className = "report-container-general"> 
                      <h2 width>General Sales Report Summary</h2>

                    {this.state.tenYRdata.prodLines.map(pl_row => 
                    <div className = "report-container-general"> 
                        <h5>Product Line: {pl_row.prod_line.name}</h5>
                            {pl_row.tenYRSKUdata.skus.length != 0 ? 
                              <div className = "report-container-general">
                                {pl_row.tenYRSKUdata.skus.map((cur_sku,index) =>
                                <div>
                                    <h7 className = "hoverable" onClick={() => this.props.handleSkuSelect(cur_sku.sku, this.state.tenYRdata, this.state.prod_lines, this.state.customer)}>
                                    SKU Name: {cur_sku.sku.name}
                                    </h7>
                                    <div className = "report-container-general-sku">
                                        <Table height={'40px'}>
                                        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                                            {this.skuLabelHeader(cur_sku)}
                                        </TableHeader>
                                        <TableBody displayRowCheckbox = {false} stripedRows={this.state.stripedRows}>
                                            {this.getSKUTable(cur_sku)}
                                        </TableBody>
                                        </Table>

                                    </div>
                                    <div className = "report-container-general-records">
                                        <Table height={'300px'}>
                                        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                                            {this.recordsLabelHeader()}
                                        </TableHeader>
                                        <TableBody displayRowCheckbox = {false} stripedRows={this.state.stripedRows}>
                                            {this.getRecordsTable(cur_sku)}
                                        </TableBody>
                                        </Table>
                                    </div>
                                    <div className = "report-container-general-total">
                                            <Table height={'40px'}>
                                            <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                                            {this.skuTotalsHeader()}
                                            </TableHeader>
                                            <TableBody displayRowCheckbox = {false} stripedRows={this.state.stripedRows}>
                                                {this.getSKUTotals(cur_sku)}
                                            </TableBody>
                                            </Table>
                                    </div>
                                </div>
                                )}
                                </div>
                                :
                                <h6> {pl_row.prod_line.name} has no SKUs associated with it. </h6>
                            }
                    </div>
                )}
                </div>);
            }
        }
        return;
    }

    async onSelectProductLine(prodlines) {
        await this.setState({
            prod_lines: prodlines,
            new_data: true,
            report_button: false,
            tenYRdata: {}

        })
        await this.props.handleGeneralReportDataChange(this.state.tenYRdata, this.state.prod_lines, this.state.customer);
        //this.updateReportData();
    }

    async onSelectCustomer(customer) {
        await this.setState({
            customer: customer,
            new_data: true,
            report_button: false,
            tenYRdata: {}
        })
        await this.props.handleGeneralReportDataChange(this.state.tenYRdata, this.state.prod_lines, this.state.customer);
        //this.updateReportData();
    }

    render() {
        return (
        <div className="report-container-general">
            <div className='item-properties'>
                <CustomerSelectSalesReport
                    item = {this.state.customer}
                    handleSelectCustomer = {this.onSelectCustomer}
                />
                <ProductLineSelectSalesReport
                    handleSelectProdLines= {this.onSelectProductLine}
                    simple = {false}
                >
                </ProductLineSelectSalesReport>
                <div className = "create_sum_report_button hoverable"
                            onClick={() => this.updateReportData()}
                            primary={true}
                            > 
                    {Constants.create_sum_sales_report} 
                </div>
                 
                <LoadingOverlay
                active={this.state.loading}
                spinner
                text='Loading report data...'
                >
                <div className = "report-container-general"> 
                {this.state.loading ?<h2 width> Report Data Loading...</h2>: <div/>}
                    {this.generalReportTables()}
                </div>
                </LoadingOverlay>
            </div>
        </div>
        );
    }
}





GeneralReport.propTypes = {
    handleSkuSelect: PropTypes.func,
    general_report_data: PropTypes.object,
    general_customers: PropTypes.object,
    general_prod_lines: PropTypes.object,
    handleGeneralReportDataChange: PropTypes.func,
  };