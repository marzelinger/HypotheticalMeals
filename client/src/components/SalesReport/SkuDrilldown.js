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
            invalid_inputs: []
        }

        this.onSelectSku = this.onSelectSku.bind(this);
        this.onSelectCustomer = this.onSelectCustomer.bind(this);
    }

    async componentDidMount() {
    }

    onSelectSku(sku) {
        this.setState({
            sku: sku
        })
        console.log(sku)
    }

    onSelectCustomer(customer) {
        this.setState({
            customer: customer
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
                <ItemSearchInput
                    curr_item={this.state.sku}
                    item_type={Constants.sku_label}
                    invalid_inputs={this.state.invalid_inputs}
                    handleSelectItem={this.onSelectSku}
                    disabled = {false}
                />
            </div>
        </div>
        );
    }
}

SkuDrilldown.propTypes = {
    customer: PropTypes.object,
    handleSelectCustomer: PropTypes.func
  };