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
import Switch from "react-switch";
import SubmitRequest from '../../helpers/SubmitRequest';

import ItemSearchInput from '../ListPage/ItemSearchInput';

const currentUserIsAdmin = require("../auth/currentUserIsAdmin");

export default class CustomerSelectSalesReport extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            customer: Object.assign({}, props.customer),
            allCustomers: false,
            invalid_inputs: [],
            assisted_search_results: [],
            to_undo: {},
        }
    }


    async componentDidMount() {
        await this.fillCustomerLine();
    }

    async fillCustomerLine() {
        var res = {};
        if (this.state.customer !== null && this.state.customer !== '' && this.state.customer._id !== undefined) {
            console.log(this.state.customer)
            res = await SubmitRequest.submitGetCustomerByID(this.state.customer._id);
            console.log(res)
            if (res === undefined || !res.success) res.data[0] = {};
        }
        else {
            res.data = {}
            res.data[0] = {}
        }
        this.setState({ customer: res.data[0] });
    }


    onSelectCustomer = async (customer) => {
        await this.setState({
                customer: customer,
            })
        console.log('this is the customer: '+JSON.stringify(this.state.customer));
        let value = {
            selectAll: this.state.allCustomers,
            customer: this.state.customer
        }
        this.props.handleSelectCustomer(this.state.customer);
    }

    onSelectAllCustomers = () => {
        this.setState({
            allCustomers: !this.state.allCustomers
        })
    };


    render() {
        return (
        <div className='item-details'>
            <div className='item-properties'>
            {/* <Row>
                <Col> */}
            <FormGroup>
                <Label>Select All Customers</Label>
                <br></br>
                <Switch onChange={() => this.onSelectAllCustomers()} checked={this.state.allCustomers}/>
            </FormGroup>
            {/* </Col>
            <Col> */}
                <ItemSearchInput
                    curr_item={this.state.customer}
                    item_type={Constants.customer_label}
                    invalid_inputs={this.state.invalid_inputs}
                    handleSelectItem={this.onSelectCustomer}
                    disabled = {this.state.allCustomers}
                />
                {/* </Col>
                </Row> */}
            </div>
        </div>
        );
    }
}

CustomerSelectSalesReport.propTypes = {
    customer: PropTypes.object,
    handleSelectCustomer: PropTypes.func
  };