// CustomerSelectSalesReport.js

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
import ItemSearchInput from '../ListPage/ItemSearchInput'

const currentUserIsAdmin = require("../auth/currentUserIsAdmin");

export default class SkuDrilldown extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            sku: {},
            customer: {},
            dateRange: { 'startdate': null, 'enddate': null},
            new_data: false,
            invalid_inputs: []
        }

        this.onSelectSku = this.onSelectSku.bind(this);
        this.onSelectCustomer = this.onSelectCustomer.bind(this);
    }

    async componentDidUpdate(prevProps, prevState) {
        if ( this.state.sku._id !== undefined && this.state.dateRange['startdate'] !== null && 
             this.state.dateRange['enddate'] !== null && this.state.new_data){
            var cust_str = (this.state.customer._id === undefined) ? '_' : this.state.customer._id;
            let datares = await SubmitRequest.submitGetSaleRecordsByFilter('_', cust_str, '_', this.state.sku._id, 
                                this.state.dateRange['startdate'], this.state.dateRange['enddate'], '_', 0, 0)
            console.log(datares)
        }
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
        let custres = await SubmitRequest.submitGetCustomerByID(customer._id)
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

    render() {
        return (
        <div className='item-details'>
            <div className='item-properties'>
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
                        onChange = {(e) => this.onInputChange(e, 'startdate')}
                        // placeholder="date placeholder"
                    />
                    <Label for="enddate">End Date</Label>
                    <Input
                        type="date"
                        name="date"
                        id="enddate"
                        onChange = {(e) => this.onInputChange(e, 'enddate')}
                        // placeholder="date placeholder"
                    />
                </FormGroup>
            </div>
        </div>
        );
    }
}

SkuDrilldown.propTypes = {
    customer: PropTypes.object,
    handleSelectCustomer: PropTypes.func
  };