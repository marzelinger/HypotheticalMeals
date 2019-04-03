// IngredientItemDetails.js
// Riley
// Item details popup that is used for viewing, editing and creating Ingredients

import React from 'react'
import PropTypes from 'prop-types';
import * as Constants from '../../resources/Constants';
import Switch from "react-switch";
import { 
    Button,
    Input,
    FormGroup,
    Label,
    CustomInput } from 'reactstrap';

import DataStore from '../../helpers/DataStore'
import DetailsViewSkuTable from './DetailsViewSkuTable'
import { Form, FormText } from 'reactstrap';
import printFuncFront from '../../printFuncFront';
import Checkbox from './Checkbox';
import ModifyManuLines from '../ListPage/ModifyManuLines'; 
import AuthRoleValidation from '../auth/AuthRoleValidation';
import { constants } from 'fs';

const currentUserIsAdmin = require("../auth/currentUserIsAdmin");

export default class UserDetails extends React.Component {
    constructor(props) {
        super(props);

        let {
            item_properties, 
            item_property_labels,
            item_property_patterns,
            item_property_field_type } = DataStore.getUserData();

        this.state = {
            item: props.item,
            item_properties,
            item_property_labels,
            item_property_patterns,
            item_property_field_type,
            invalid_inputs: []
        }
    }



    getPropertyLabel = (prop) => {
        return this.state.item_property_labels[this.state.item_properties.indexOf(prop)];
    }

    getPropertyPattern = (prop) => {
        return this.state.item_property_patterns[this.state.item_properties.indexOf(prop)];
    }

    getPropertyFieldType = (prop) => {
        return this.state.item_property_field_type[this.state.item_properties.indexOf(prop)];
    }


    onPropChange = (value, item, prop) => {
        item[prop] = value;
        this.setState({ item: item });
        printFuncFront("this is the item: "+JSON.stringify(item));
    };

    async handleSubmit(e, opt) {
        console.log("this is the item: "+JSON.stringify(this.props.item));
        if (![Constants.details_save, Constants.details_create, Constants.details_delete].includes(opt)) {
            this.props.handleDetailViewSubmit(e, this.props.item, opt);
            return;
        }
        
        if([Constants.details_delete].includes(opt)){
            if(window.confirm(`Are you sure you want to delete this user? Doing so will result in all manufacturing goals and activities belonging to ${this.props.item.username} being deleted.`)){
                this.props.handleDetailViewSubmit(e, this.props.item, opt);
                return;
            }
        }
        else{
            await this.validateInputs();
            if (this.state.invalid_inputs.length === 0) {
                this.props.handleDetailViewSubmit(e, this.props.item, opt);
            }
            else alert('Invalid Fields');
        }
    }

    async validateInputs() { 
        var inv_in = [];
        this.state.item_properties.map(prop => {
            if (!this.props.item[prop].toString().match(this.getPropertyPattern(prop))) {
                inv_in.push(prop);
            }
        })
        await this.setState({ invalid_inputs: inv_in });
    }

    onAdminCheckBoxClick = () => {

        var new_item = this.state.item
        new_item["isAdmin"] = !this.state.item.isAdmin;
        this.setState({
            item: new_item
        })
    };



    onModifyManuLines = (list) => {
        var newItem = Object.assign({}, this.state.item);
        console.log("newitem in mod manu: "+newItem);
        newItem['manu_lines'] = list;
        this.setState({
            item: newItem
        })
    }


    injectProperties = () => {
        if (this.props.item){
            return (this.state.item_properties.map(prop => 
                <FormGroup key={prop}>
                    <Label>{this.getPropertyLabel(prop)}</Label>
                    <Input 
                        type={this.getPropertyFieldType(prop)}
                        value={ this.props.item[prop] }
                        invalid={ this.state.invalid_inputs.includes(prop) }
                        onChange={ (e) => this.onPropChange(e.target.value, this.props.item, prop) }
                        disabled = {true}
                    />
                </FormGroup>));
        }
        return null;
    }

    onAnalystClick = () => {
        var new_item = this.state.item
        var new_roles = new_item.roles;
        if(new_roles.includes(Constants.analyst)){
            var ind = new_roles.indexOf(Constants.analyst);
            new_roles.splice(ind, 1);
        }
        else{
            new_roles.push(Constants.analyst);
        }

        new_item.roles = new_roles;
        this.setState({
            item: new_item
        })
    };

    onCheckBoxClick = (role) => {
        var new_item = this.state.item
        var new_roles = new_item.roles;
        console.log("new_item: "+JSON.stringify(new_item));
        if(new_roles.includes(role)){
            var ind = new_roles.indexOf(role);
            new_roles.splice(ind, 1);
        }
        else{
            new_roles.push(role);
        }

        new_item.roles = new_roles;
        console.log("new_item with new roles: "+JSON.stringify(new_item));

        this.setState({
            item: new_item
        })


    };

    isChecked(role) {
        var roles = this.state.item.roles;
        if(roles.includes(role)){
            return true;
        }
        return false;
    };

    
    render() {
        console.log("item here: "+JSON.stringify(this.state.item));
        console.log("this is a check: "+(this.state.item.roles).includes[Constants.product_manager]);
        return (
        <div className='item-details'>
            <div className='item-title'>
                <h1>{ this.props.item  ? this.props.item.name : Constants.undefined }</h1>
            </div>
            <div className='item-properties'>
                { this.injectProperties() }
            </div>
            <div className= 'privilege'>
            </div> 
            <FormGroup>
                <Label>Administrator</Label>
                <br></br>
                <Switch onChange={() => this.onAdminCheckBoxClick()} checked={this.state.item.isAdmin} disabled = {this.state.item.username ==="admin"}/>
            </FormGroup>
            <Form>
                <FormGroup>
                <Label for="exampleCheckbox">User Roles</Label>
                <div>
                    <CustomInput type="checkbox" id="analyst" label="Analyst" checked={this.isChecked(Constants.analyst)} onChange={() => this.onCheckBoxClick(Constants.analyst)} />
                    <CustomInput type="checkbox" id="product_manager" label="Product Manager" checked={this.isChecked(Constants.product_manager)}  disabled = {false} onChange={() => this.onCheckBoxClick(Constants.product_manager)}/>
                    <CustomInput type="checkbox" id="business_manager" label="Business Manager" checked={this.isChecked(Constants.business_manager)} disabled = {false} onChange={() => this.onCheckBoxClick(Constants.business_manager)}/>
                    <CustomInput type="checkbox" id="plant_manager" label="Plant Manager" checked={this.isChecked(Constants.plant_manager)} disabled = {false} onChange={() => this.onCheckBoxClick(Constants.plant_manager)}/>
                    {/* <CustomInput type="checkbox" id="admin" label="Admin" disabled = {false} /> */}
                </div>
                </FormGroup>
            </Form>
            <ModifyManuLines
                    item={this.state.item}
                    label={Constants.select_manu_lines_label}
                    handleModifyManuLines={this.onModifyManuLines}
                    disabled = {!currentUserIsAdmin().isValid}
            />
            <div className='item-options'>
                { this.props.detail_view_options.map(opt => 
                    <Button 
                        className = "detailButtons"
                        key={opt} 
                        onClick={(e) => this.handleSubmit(e, opt)}
                        disabled = {(this.state.item.username ==="admin" && opt === Constants.details_delete) || (this.state.item.isNetIDLogin && opt ===Constants.details_delete) }
                    >{opt}</Button>
                )}
            </div>
        </div>
        );
    }
}

UserDetails.propTypes = {
    item: PropTypes.object,
    detail_view_options: PropTypes.arrayOf(PropTypes.string),
    handleDetailViewSubmit: PropTypes.func
  };