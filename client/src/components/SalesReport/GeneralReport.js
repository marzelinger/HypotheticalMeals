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
            total_years: 10
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
                var skus_res = SubmitRequest.submitGetSkusByProductLineID(this.state.prod_lines[pl]._id);
                if(skus_res.success){
                    var skus = skus_res.data;
                    if (skus.length>0){
                        for (let s = 0; s<skus.length; s++){
                            // //need to go through all the prodlines. and then through all the skus.
                            for(let yr = 0; yr<this.dateRanges.length; yr++){
                                let datares = await SubmitRequest.submitGetSaleRecordsByFilter('_', cust_str, '_', skus[s]._id, 
                                this.state.dateRanges[yr]['startdate'], this.state.dateRanges[yr]['enddate'], 0, 0);
                                if(datares.success){
                                    //console.log("this is the dateres: "+JSON.stringify(datares));
                                    var curRowData = await Calculations.getSalesTotalPerYear(datares.data);
                                    console.log("this is the curRowData: "+JSON.stringify(curRowData));
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    onSelectProductLine(prodlines) {
        this.setState({
            prod_lines: prodlines,
            new_data: true
        })
        console.log(prodlines)
    }

    onSelectCustomer(customer) {
        this.setState({
            customer: customer,
            new_data: true
        })
        console.log(customer)
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