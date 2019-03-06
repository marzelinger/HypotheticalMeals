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
import ItemSearchInput from '../ListPage/ItemSearchInput'

const currentUserIsAdmin = require("../auth/currentUserIsAdmin");

export default class GeneralReport extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            product_lines: [],
            customer: {},
            invalid_inputs: []
        }

        this.onSelectProductLine = this.onSelectProductLine.bind(this);
        this.onSelectCustomer = this.onSelectCustomer.bind(this);
    }

    async componentDidMount() {
    }


    onSelectProductLine(prodlines) {
        this.setState({
            product_lines: prodlines
        })
        console.log(prodlines)
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
                <ProductLineSelectSalesReport
                    handleSelectProdLines= {this.onSelectProductLine}
                    simple = {false}
                >
                </ProductLineSelectSalesReport>

            </div>
        </div>
        );
    }
}

GeneralReport.propTypes = {
    // customer: PropTypes.object,
    // handleSelectCustomer: PropTypes.func
  };