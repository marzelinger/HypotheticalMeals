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
import SubmitRequest from '../../helpers/SubmitRequest';
import CustomerSelectSalesReport from './CustomerSelectSalesReport'
import ProductLineSelectSalesReport from './ProductLineSelectSalesReport'
import Calculations from './Calculations'
import { Table } from 'reactstrap';
import ItemSearchInput from '../ListPage/ItemSearchInput'

const currentUserIsAdmin = require("../auth/currentUserIsAdmin");

export default class GeneralReport extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            prod_lines: [],
            customer: {},
            invalid_inputs: [],
            new_data: false,
            dateRanges: [
                //start jan 1 2010
                { 'startdate': "2010-01-01", 'enddate': "2010-12-31"},
                { 'startdate': "2011-01-01", 'enddate': "2011-12-31"},
                { 'startdate': "2012-01-01", 'enddate': "2012-12-31"},
                { 'startdate': "2013-01-01", 'enddate': "2013-12-31"},
                { 'startdate': "2014-01-01", 'enddate': "2014-12-31"},
                { 'startdate': "2015-01-01", 'enddate': "2015-12-31"},
                { 'startdate': "2016-01-01", 'enddate': "2016-12-31"},
                { 'startdate': "2017-01-01", 'enddate': "2017-12-31"},
                { 'startdate': "2018-01-01", 'enddate': "2018-12-31"},
                { 'startdate': "2019-01-01", 'enddate': "2019-12-31"}
                //end jan1 2019
            ],
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

    updateReportData = async () => {
        var cust_str = (this.state.customer._id === undefined) ? '_' : this.state.customer._id;
        if(this.state.prod_lines.length>0){
            for(let pl = 0; pl<this.state.prod_lines.length; pl++){
                //there are product lines to generate data for.
                var skus_res = await SubmitRequest.submitGetSkusByProductLineID(this.state.prod_lines[pl]._id);
                console.log("these are the SKUS: "+JSON.stringify(skus_res));
                if(skus_res.success){
                    var skus = skus_res.data;
                    //this will be the data for each sku in this prod line for the ten years
                    //want to then use that to make a table
                    var {tenYRSKUsdata} = Calculations.getTenYRSalesData(skus, cust_str);
                    console.log("this is the tenYRSKUdata: "+JSON.stringify(tenYRSKUsdata));
                    var new_ten_yr_data = this.state.tenYRdata;
                    new_ten_yr_data.prodLines.push(tenYRSKUsdata);
                    await this.setState({tenYRdata: new_ten_yr_data});
                    this.updateReportTables();
                }
            }
        }
        await this.setState({new_data: false});
    }

    updateReportTables = async () => {

        if(this.state.tenYRdata.length>0){
            for(let pl = 0; pl<this.state.tenYRdata.length; pl++){
                //for each product Line we want to go through the skus data and make
                //a table for each sku.
                //make a super table for each prod line?

                //there are product lines to generate data for.


            
            }
        }
        await this.setState({new_data: false});
    }

    async onSelectProductLine(prodlines) {
        await this.setState({
            prod_lines: prodlines,
            new_data: true
        })
        console.log(prodlines)
        this.updateReportData();
    }

    async onSelectCustomer(customer) {
        await this.setState({
            customer: customer,
            new_data: true
        })
        console.log(customer)
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


            </div>
        </div>
        );
    }
}

GeneralReport.propTypes = {
    // customer: PropTypes.object,
    // handleSelectCustomer: PropTypes.func
  };