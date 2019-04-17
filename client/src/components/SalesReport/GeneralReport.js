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
import ExportSimple from '../export/ExportSimple';
// import { Table } from 'reactstrap';
import ItemSearchInput from '../ListPage/ItemSearchInput'
import style from '../../style/GeneralReport.css';

export default class GeneralReport extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            sku_yr_table_properties: ['Year', 'Total Revenue (USD)', 'Average Revenue Per Case (USD)'],
            prod_line_yr_table_properties: ['Year', 'Total Revenue (USD)'],

            sku_totals_properties: ['Sum of Yearly Rev. (USD)', 'Avg. Manu. Run Size', 'Ingr. CPC (USD)', 'Avg. Manu. Setup CPC (USD)', 'Manu. Run CPC (USD)', 'COGS PC (USD)', 'Avg. Rev. PC (USD)', 'Avg. Profit PC (USD)', 'Profit Margin (%)'],
            prod_line_totals_properties: ['Sum of Total Revenue (USD)'],
            sku_header_table_properties: ['Name', 'SKU#', 'Case UPC#', 'Unit UPC#', 'Unit Size', 'Count Per Case', 'Setup Cost (USD)', 'Run CPC (USD)'],
            prod_lines: Object.assign([], props.general_prod_lines),
            prod_lines_indices: Object.assign([], props.general_prod_lines_indices),
            customer: Object.assign({}, props.general_customers),
            // prod_lines: [],
            // customer: {},
            invalid_inputs: [],
            new_data: false,
            report_button: false,
            total_years: 10,
            tenYRdata: Object.assign({}, props.general_report_data),
            // tenYRdata: {},
            dataRanges: [],
            years: [],
            loading: false,
            page_name: Constants.general_report_page_name
        }

        this.calculateYears = this.calculateYears.bind(this);
        this.onSelectProductLine = this.onSelectProductLine.bind(this);
        this.onSelectCustomer = this.onSelectCustomer.bind(this);
        this.checkPriceLength = this.checkPriceLength.bind(this);

        console.log("gen data constructor: "+JSON.stringify(this.state.prod_lines));
        console.log("gen data constructor2: "+JSON.stringify(this.state.prod_lines_indices));


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

    getButtons = () => {
        return (
        <div className = "ingbuttons">
        {(this.state.report_button || this.state.tenYRdata.prodLines !=undefined) && !this.state.loading && this.state.tenYRdata.prodLines !=undefined ? <ExportSimple data = {this.state.tenYRdata.prodLines} fileTitle = {this.state.page_name}/>  : <div/>}
        </div>
        );
    }


    checkPriceLength(val){
        var val_str = ""+val;
        var split_val = val_str.split(".");
        if(split_val.length==2){
            if (split_val[1].length==1){
                //want to round.
                return val+""+0;
            }
            if (split_val[1].length==0){
                //want to round.
                return val+""+0+""+0;
            }
        }
        return val;
    }

    updateReportData = async () => {
        if(this.state.prod_lines.length==0){
            alert(Constants.gen_report_no_prod_line_selected);
            return;
        }
        if(!this.state.new_data) return;
        await this.setState({
            loading: true,
            report_button: true
        });
        console.log("report_button: "+this.state.report_button);
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
                    var prod_totals_data = await Calculations.getProdLineSalesData(tenYRSKUsdata);
                    new_ten_yr_data.prodLines.push({prod_line: this.state.prod_lines[pl], tenYRSKUdata: tenYRSKUsdata, prod_totals_data: prod_totals_data});
                    await this.setState({tenYRdata: new_ten_yr_data});
                    await this.props.handleGeneralReportDataChange(this.state.tenYRdata, this.state.prod_lines, this.state.customer, this.state.prod_lines_indices);
                    //console.log("this is the tenyr: "+JSON.stringify(this.state.tenYRdata));
                }
                else {
                    new_ten_yr_data.prodLines.push({prod_line: this.state.prod_lines[pl], tenYRSKUdata: { skus: []}, prod_totals_data: {}});
                    await this.setState({tenYRdata: new_ten_yr_data});
                    await this.props.handleGeneralReportDataChange(this.state.tenYRdata, this.state.prod_lines, this.state.customer, this.state.prod_lines_indices);
                }
            }
        }
        await this.setState({
            loading: false,
            new_data: false
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
                            {'$'+this.checkPriceLength(cur_sku.totalData.sum_yearly_rev)}
                        </TableRowColumn>
                        <TableRowColumn>
                            {cur_sku.totalData.avg_manu_run_size}
                        </TableRowColumn>
                        <TableRowColumn>
                            {'$'+this.checkPriceLength(cur_sku.totalData.ingr_cost_per_case)}
                        </TableRowColumn>
                        <TableRowColumn>
                            {'$'+this.checkPriceLength(cur_sku.totalData.avg_manu_setup_cost_per_case)}
                        </TableRowColumn>
                        <TableRowColumn>
                            {'$'+this.checkPriceLength(cur_sku.totalData.manu_run_cost_per_case)}
                        </TableRowColumn>
                        <TableRowColumn>
                            {'$'+this.checkPriceLength(cur_sku.totalData.total_COGS_per_case)}
                        </TableRowColumn>
                        <TableRowColumn>
                            {'$'+this.checkPriceLength(cur_sku.totalData.avg_rev_per_case)}
                        </TableRowColumn>
                        <TableRowColumn>
                            {'$'+this.checkPriceLength(cur_sku.totalData.avg_profit_per_case)}
                        </TableRowColumn>
                        <TableRowColumn>
                            {cur_sku.totalData.profit_marg}
                        </TableRowColumn>
                    </TableRow>

            </div>
        );

    }


    getProdLineTotals = (prod_line_total) => {
        return (
            <div>
                <TableRow  class= "cols trselect">
                    <TableRowColumn>
                    {'$'+this.checkPriceLength(prod_line_total)}
                    </TableRowColumn>
                </TableRow>
            </div>

        );

    }

    getProdLineRecordsTable = (prod_totals_data) => {

        // let prodLineData = {
        //     yearData: [],
        //     totalData: 0


        // yr: curSKUData[y].yr,
        // yr_total_rev: curSKUData[y].salesData.revenue
        // };
        if(prod_totals_data!=undefined){
            if(prod_totals_data.yearData!=undefined){
                return (
                    <div>
                        {prod_totals_data.yearData.map((data_line,ind) =>
                                            // need to show the val in the sku data here.
                                            //here we have the yr, sales data, and the sku# stuff
                                            <TableRow  class= "cols trselect">
                                                <TableRowColumn>
                                                    {data_line.yr}
                                                </TableRowColumn>
                                                <TableRowColumn>
                                                {'$'+this.checkPriceLength(data_line.yr_total_rev)}
                                                </TableRowColumn>
                                            </TableRow>
                                        )} 
                    </div>

                );
            }
        }

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
                                        {'$'+this.checkPriceLength(cur_sku.skuData[ind].salesData.rev_round)}
                                        </TableRowColumn>
                                        <TableRowColumn>
                                        {'$'+this.checkPriceLength(cur_sku.skuData[ind].salesData.avg_rev_per_case_round)}
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
                    {cur_sku.sku.cpc}
                    </TableRowColumn>
                    <TableRowColumn>
                    {'$'+this.checkPriceLength(cur_sku.sku.setup_cost)}
                    </TableRowColumn>
                    <TableRowColumn>
                    {'$'+this.checkPriceLength(cur_sku.sku.run_cpc)}
                    </TableRowColumn>
                </TableRow>
            </div>

        );

    }


    prodLineTotalCalcsHeader = () => {
        return (
            <div>
                <TableRow  class= "cols trselect">
                    <TableRowColumn>
                        Product Line Name
                    </TableRowColumn>
                    <TableRowColumn>
                        Sum of Total Revenue for Past Decade
                    </TableRowColumn>
                </TableRow>
            </div>

        );

    }
    prodLineTable = () => {
        return (
            <div>
                <TableRow  class= "cols trselect">
                    <TableRowColumn>
                    </TableRowColumn>
                    <TableRowColumn>
                    </TableRowColumn>
                    <TableRowColumn>
                    </TableRowColumn>
                    <TableRowColumn>
                    </TableRowColumn>
                    <TableRowColumn>
                    </TableRowColumn>
                    <TableRowColumn>
                    </TableRowColumn>
                    <TableRowColumn>
                    </TableRowColumn>
                    <TableRowColumn>
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

    prodLineRecordsLabelHeader = () => {
        return (
            <TableRow class= "cols trselect" selectable = {false} >
                {this.state.prod_line_yr_table_properties.map(prop => 
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

    
    prodLineTotalsHeader = () => {
        return (
                <TableRow className = "cols" selectable = {false} >
                    {this.state.prod_line_totals_properties.map(prop => 
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
        // console.log("DATA IS: "+ JSON.stringify(this.state.tenYRdata));
         console.log("report button "+ this.state.report_button);
        if(this.state.tenYRdata.prodLines!= undefined){
            if (this.state.tenYRdata.prodLines.length>0){
                // console.log("DATA IS: "+ JSON.stringify(this.state.tenYRdata));
                // console.log("DATA SKU LENGTH: "+ JSON.stringify(this.state.tenYRdata.prodLines[0].skus.length));
                console.log("here");
                return (
                    <div className = "report-container-general"> 
                      <div className = "report-heading">
                      <h2 width>General Sales Report Summary</h2>
                      {this.getButtons()}
                      </div>
                    {this.state.tenYRdata.prodLines.map(pl_row => 
                    <div className = "report-container-general"> 
                        <h5>Product Line: {pl_row.prod_line.name}</h5>
                        
                            {pl_row.tenYRSKUdata.skus.length != 0 ?
                           
                              <div className = "report-container-general">
                                {pl_row.tenYRSKUdata.skus.map((cur_sku,index) =>
                                    <div>
                                    <div className = "row">
                                        <h7  >
                                        SKU Name: {cur_sku.sku.name}
                                        </h7>
                                        <div className = "ingbuttons">     
                                            <div className = "skuDrillDown hoverable"
                                                onClick={() => this.props.handleSkuSelect(cur_sku.sku, this.state.tenYRdata, this.state.prod_lines, this.state.customer, this.state.prod_lines_indices)}
                                                primary={true}
                                            >
                                            View SKU Drilldown
                                            </div>                
                                        </div>
                                    </div>

                                    {cur_sku.sku.status== 'queued'?
                                    <h6> Data of {cur_sku.sku.name} is currently loading. </h6> 
                                    :
                                        
                                    (<div>
                                        
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
                                    </div> )}


                                    </div>

                                )}
                                </div>
                                :
                                <div>
                                <h6> {pl_row.prod_line.name} has no SKUs associated with it. </h6>
                                {/* <h6> zero monies</h6> */}

                                </div>
                                
                            }
                            <div>
                            <h5> {pl_row.prod_line.name} Summary Table: </h5>
                            <div className = "report-container-general-records">
                                            <Table height={'300px'}>
                                            <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                                                {this.prodLineRecordsLabelHeader()}
                                            </TableHeader>
                                            <TableBody displayRowCheckbox = {false} stripedRows={this.state.stripedRows}>
                                                {this.getProdLineRecordsTable(pl_row.prod_totals_data)}
                                            </TableBody>
                                            </Table>
                                        </div>
                                        <div className = "report-container-general-total">
                                                <Table height={'40px'}>
                                                <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                                                {this.prodLineTotalsHeader()}
                                                </TableHeader>
                                                <TableBody displayRowCheckbox = {false} stripedRows={this.state.stripedRows}>
                                                    {this.getProdLineTotals(pl_row.prod_totals_data.totalData)}
                                                </TableBody>
                                                </Table>
                            </div>
                            </div>
                    </div>
                )}
                </div>);
            }
        }
        return;
    }

    async onSelectProductLine(prodlines, indices) {
        await this.setState({
            prod_lines: prodlines,
            prod_lines_indices: indices,
            new_data: true,
            report_button: false,
            tenYRdata: {}

        })
        console.log("report_button: "+this.state.report_button);
        await this.props.handleGeneralReportDataChange(this.state.tenYRdata, this.state.prod_lines, this.state.customer, this.state.prod_lines_indices);
    }

    async onSelectCustomer(customer) {
        console.log("this is the selecting customer.")
        let custres = customer._id !== undefined ? await SubmitRequest.submitGetCustomerByID(customer._id) : {data: [{}]}
        this.setState({
            customer: custres.data[0],
            new_data: true,
            report_button: false,
            tenYRdata: {}        
        })
        await this.props.handleGeneralReportDataChange(this.state.tenYRdata, this.state.prod_lines, this.state.customer, this.state.prod_lines_indices);
    }

    render() {
        return (
        <div className="report-container-general">
            <div className='item-properties'>
                <ProductLineSelectSalesReport
                    className = 'select-lines'
                    handleSelectProdLines= {this.onSelectProductLine}
                    simple = {false}
                    prod_lines = {this.state.prod_lines}
                    prod_lines_indices = {this.state.prod_lines_indices}
                >
                </ProductLineSelectSalesReport>
                <CustomerSelectSalesReport
                    customer = {this.props.general_customer}
                    handleSelectCustomer = {this.onSelectCustomer}
                    className = 'sku-drilldown-filter'
                />
                <div className = "row">
                    <div className = "create_report_button hoverable"
                                onClick={() => this.updateReportData()}
                                primary={true}
                                > 
                        {Constants.create_sum_sales_report} 
                    </div>
                </div>
            </div>
            <div className = "report">
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
    general_customer: PropTypes.object,
    general_prod_lines: PropTypes.arrayOf(PropTypes.object),
    general_prod_lines_indices: PropTypes.arrayOf(PropTypes.number),
    handleGeneralReportDataChange: PropTypes.func
  };