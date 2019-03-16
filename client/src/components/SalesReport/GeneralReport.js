// GeneralReport.js

import React from 'react'
import PropTypes from 'prop-types';
import * as Constants from '../../resources/Constants';
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
            sku_yr_table_properties: ['Year', 'SKU#', 'Total Revenue', 'Average Revenue Per Case'],
            sku_totals_properties: ['Sum of Yearly Rev.', 'Avg. Manu. Run Size', 'Ingr. CPC', 'Avg. Manu. Setup CPC', 'Manu. Run CPC', 'COGS PC', 'Avg. Rev. PC', 'Avg. Profit PC', 'Profit Margin'],
            prod_lines: [],
            customer: {},
            invalid_inputs: [],
            new_data: false,
            total_years: 10,
            // tenYRdata: {}
            tenYRdata:{
                prodLines: []
                }
        }

        this.onSelectProductLine = this.onSelectProductLine.bind(this);
        this.onSelectCustomer = this.onSelectCustomer.bind(this);
    }

    async componentDidMount() {
    }

    async componentDidUpdate(prevProps, prevState) {
        if ( this.state.prod_lines.length !== 0 && this.state.new_data){
            await this.updateReportData();
        }
    }

    //THIS IS FOR WHEN PRODUCT LINES ARE BEING ADDED.... RIGHT NOW WILL JUST RECALCULATE ALL
    updateReportData = async () => {
        var new_ten_yr_data = this.state.tenYRdata;
        new_ten_yr_data.prodLines = await []; //TODO. this might be doing it too slowly.
         console.log("this is the prodline in data1111: "+JSON.stringify(new_ten_yr_data.prodLines));
        var cust_str = (this.state.customer._id === undefined) ? '_' : this.state.customer._id;
        if(this.state.prod_lines.length>0){
            console.log("this is the prolength : "+this.state.prod_lines.length);
            for(let pl = 0; pl<this.state.prod_lines.length; pl++){
                //there are product lines to generate data for.
                var skus_res = await SubmitRequest.submitGetSkusByProductLineID(this.state.prod_lines[pl]._id);
                // console.log("these are the SKUS: "+JSON.stringify(skus_res));
                if(skus_res.success){
                    var skus = skus_res.data;
                    //this will be the data for each sku in this prod line for the ten years
                    //want to then use that to make a table
                    var {tenYRSKUsdata} = Calculations.getTenYRSalesData(skus, cust_str);
                    console.log("this is the tenYRSKUdata: "+JSON.stringify(tenYRSKUsdata));
                    console.log("this is the prodline in data: "+JSON.stringify(new_ten_yr_data.prodLines));

                    new_ten_yr_data.prodLines.push({prod_line: this.state.prod_lines[pl], tenYRSKUdata: tenYRSKUsdata});
                    console.log("this is ten in data: "+JSON.stringify(new_ten_yr_data.prodLines));

                    await this.setState({tenYRdata: new_ten_yr_data});
                    console.log("this is the tenyr: "+JSON.stringify(this.state.tenYRdata));
                }
            }
        }
        await this.setState({new_data: false});
    }

    handleRowSelect = (res) => {

    }

    handleSelect = (e, item) => {

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
    generalReportTables = () => {
        //console.log("this is the tenYRdata: "+JSON.stringify(this.state.tenYRdata));
        //console.log("this is the prodLength: "+JSON.stringify(this.state.tenYRdata.prodLines.length));

        if (this.state.tenYRdata.prodLines.length>0){
            return (this.state.tenYRdata.prodLines.map(pl_row => 
                <Table
                   height={'413px'}
                //   fixedHeader={true}
                //   fixedFooter={this.state.fixedFooter}
                //   selectable={this.state.selectable}
                //   multiSelectable={this.state.multiSelectable}
                //   onRowSelection = {(res) => this.handleRowSelect(res)}
>
                    <TableHeader>
                        <TableRow >
                            <TableHeaderColumn>Product Line: {pl_row.prod_line.name}</TableHeaderColumn>
                        </TableRow>
                    </TableHeader>
                    {/* {pl_row.tenYRSKUdata.skus.map(cur_sku =>
                        <div>
                        <TableHeader>
                            <TableRow className = "cols" selectable = {false} >
                                {this.state.sku_yr_table_properties.map(prop => 
                                    <TableHeaderColumn>{prop}</TableHeaderColumn>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody stripedRows={this.state.stripedRows}>

                            {cur_sku.skuData.map((skuData, ind) =>
                                // need to show the val in the sku data here.
                                //here we have the yr, sales data, and the sku# stuff
                                <TableRow>
                                    <TableRowColumn onClick={e => this.handleSelect(e, skuData)}>
                                        {cur_sku.skuData[ind].yr}
                                    </TableRowColumn>
                                    <TableRowColumn onClick={e => this.handleSelect(e, skuData)}>
                                    {cur_sku.sku._id}
                                    </TableRowColumn>
                                    <TableRowColumn onClick={e => this.handleSelect(e, skuData)}>
                                    {cur_sku.skuData[ind].salesData.revenue}
                                    </TableRowColumn>
                                    <TableRowColumn onClick={e => this.handleSelect(e, skuData)}>
                                    {cur_sku.skuData[ind].salesData.avg_rev_per_case}
                                    </TableRowColumn>
                                </TableRow>
                            )}
                            </TableBody>
                            <TableHeader>
                                <TableRow className = "cols" selectable = {false} >
                                    {this.state.sku_totals_properties.map(prop => 
                                        <TableHeaderColumn>{prop}</TableHeaderColumn>
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                            <TableRow>
                                <TableRowColumn onClick={e => this.handleSelect(e, cur_sku)}>
                                    {cur_sku.totalData.sum_yearly_rev}
                                </TableRowColumn>
                                <TableRowColumn onClick={e => this.handleSelect(e, cur_sku)}>
                                    {cur_sku.totalData.avg_manu_run_size}
                                </TableRowColumn>
                                <TableRowColumn onClick={e => this.handleSelect(e, cur_sku)}>
                                    {cur_sku.totalData.ingr_cost_per_case}
                                </TableRowColumn>
                                <TableRowColumn onClick={e => this.handleSelect(e, cur_sku)}>
                                    {cur_sku.totalData.avg_manu_setup_cost_per_case}
                                </TableRowColumn>
                                <TableRowColumn onClick={e => this.handleSelect(e, cur_sku)}>
                                    {cur_sku.totalData.manu_run_cost_per_case}
                                </TableRowColumn>
                                <TableRowColumn onClick={e => this.handleSelect(e, cur_sku)}>
                                    {cur_sku.totalData.total_COGS_per_case}
                                </TableRowColumn>
                                <TableRowColumn onClick={e => this.handleSelect(e, cur_sku)}>
                                    {cur_sku.totalData.avg_rev_per_case}
                                </TableRowColumn>
                                <TableRowColumn onClick={e => this.handleSelect(e, cur_sku)}>
                                    {cur_sku.totalData.avg_profit_per_case}
                                </TableRowColumn>
                                <TableRowColumn onClick={e => this.handleSelect(e, cur_sku)}>
                                    {cur_sku.totalData.profit_marg}
                                </TableRowColumn>
                             </TableRow>
                        </TableBody>
                        </div>
                        )} */}

                </Table>
                ));
        }
        return;
    }

    async onSelectProductLine(prodlines) {
        await this.setState({
            prod_lines: prodlines,
            new_data: true
        })
        //console.log("this is the prodline selected: "+JSON.stringify(prodlines));
        this.updateReportData();
    }

    async onSelectCustomer(customer) {
        await this.setState({
            customer: customer,
            new_data: true
        })
        //console.log("this is the customer selected: "+JSON.stringify(customer));
        this.updateReportData();
    }

    render() {
        return (
        <div className='item-details'>
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
                            onClick={() => this.onGenerateReport(null, Constants.create_sum_sales_report)}
                            primary={true}
                            > 
                    {Constants.create_sum_sales_report} 
                </div>
                <h3>General Sales Report Summary</h3>
                {this.generalReportTables()}


            </div>
        </div>
        );
    }
}

GeneralReport.propTypes = {
    // customer: PropTypes.object,
    // handleSelectCustomer: PropTypes.func
  };