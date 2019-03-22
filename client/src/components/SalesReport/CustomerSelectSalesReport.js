// CustomerSelectSalesReport.js

import React from 'react'
import PropTypes from 'prop-types';
import * as Constants from '../../resources/Constants';
import { 
    Button,
    Input,
    Form,
    FormGroup,
    Row,
    Col,
    CustomInput,
    Label } from 'reactstrap';
import Switch from "react-switch";
import Checkbox from '@material-ui/core/Checkbox';

import SubmitRequest from '../../helpers/SubmitRequest';

import ItemSearchInput from '../ListPage/ItemSearchInput';

const currentUserIsAdmin = require("../auth/currentUserIsAdmin");

export default class CustomerSelectSalesReport extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            customer: Object.assign({}, props.customer),
            allCustomers: true,
            singleCustomer: false,
            invalid_inputs: [],
            assisted_search_results: [],
            to_undo: {},
            rerender: false
        }
    }


    async componentDidMount() {
        await this.fillCustomerLine();
    }

    componentDidUpdate() {
        if (this.state.rerender) {
            this.setState({rerender: false})
        }
    }

    async fillCustomerLine() {
        var res = {};
        if (this.state.customer !== null && this.state.customer !== '' && this.state.customer._id !== undefined) {
            res = await SubmitRequest.submitGetCustomerByID(this.state.customer._id);
            if (res === undefined || !res.success) {
                await this.setState({ customer: '' });
            }
            else{
                this.props.handleSelectCustomer(res.data[0])
                await this.setState({ 
                    customer: res.data[0] ,
                    allCustomers: false,
                    singleCustomer: true,
                    // rerender: true
                });
            }
        }
        else {
            res.data = {}
            res.data[0] = {}
            await this.setState({ customer: res.data[0] });
        }
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
        this.props.handleSelectCustomer({});
        this.setState({
            customer: {},
            allCustomers: !this.state.allCustomers,
            singleCustomer: !this.state.singleCustomer,
            rerender: true
        })
    };


    render() {
        return (
        <div className='sales-item-details'>
            <Label for="all-customers">Select Customers</Label>
            <div className='sales-item-properties'>
                <CustomInput type="checkbox" id="exampleswitch" name="customSwitch" onChange={() => this.onSelectAllCustomers()} checked={this.state.allCustomers}/>
                {!this.state.rerender ? <ItemSearchInput
                    curr_item={this.state.customer}//{this.state.allCustomers ? {name: 'All Customers'} :this.state.customer}
                    item_type={Constants.customer_label}
                    invalid_inputs={this.state.invalid_inputs}
                    handleSelectItem={this.onSelectCustomer}
                    disabled = {this.state.allCustomers}
                    hide_label = {true}
                /> : null}
            </div>
        </div>
        );
    }
}

CustomerSelectSalesReport.propTypes = {
    customer: PropTypes.object,
    handleSelectCustomer: PropTypes.func
  };