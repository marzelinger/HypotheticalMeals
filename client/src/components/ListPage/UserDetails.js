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
import ManuLineSelect from './ManuLineSelect';
import AuthRoleValidation from '../auth/AuthRoleValidation';
import { constants } from 'fs';
import SubmitRequest from '../../helpers/SubmitRequest';

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
            manu_lines: [],
            //Object.assign([], props.general_prod_lines),
            manu_lines_indices: [],
            //Object.assign([], props.general_prod_lines_indices),
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
        var curUser = await AuthRoleValidation.determineUser();
        if (![Constants.details_save, Constants.details_create, Constants.details_delete].includes(opt)) {
            this.props.handleDetailViewSubmit(e, this.props.item, opt);
            return;
        }
        if([Constants.details_delete].includes(opt)){
            //check if you are deleting yourself.
            console.log("current user name: "+ curUser.user.username);
            console.log("current detail name: "+ this.props.item.username);

            if(curUser.user.username == this.props.item.username){
                //trying to delete yourself.
                if(window.confirm(`Are you sure you want to delete your own account? Doing so will result in all manufacturing goals and activities belonging to you being deleted. You will also be logged out of the system.`)){
                    this.props.handleDetailViewSubmit(e, this.props.item, opt);
                    return;
                }
            }
            else if(window.confirm(`Are you sure you want to delete this user? Doing so will result in all manufacturing goals and activities belonging to ${this.props.item.username} being deleted.`)){
                this.props.handleDetailViewSubmit(e, this.props.item, opt);
                return;
            }
        }

        else{
            await this.validateInputs();
            if(this.state.invalid_inputs.length==1){
                if(this.state.invalid_inputs.includes(Constants.no_manu_lines)){
                    if(window.confirm(`A user with the Plant Manager Role must manage at least one manufacturing line.`)){
                        return;
                    }
                }
            }
            if(this.state.invalid_inputs.includes(Constants.change_own_roles)){
                if(window.confirm(`Are you sure you want to change your own roles? Doing so will result in you being logged out and needing to login again.`)){
                    this.props.handleDetailViewSubmit(e, this.props.item, opt);
                    return;
                }         
            }
            if (this.state.invalid_inputs.length === 0) {
                this.props.handleDetailViewSubmit(e, this.props.item, opt);
            }
            else alert('Invalid Fields '+this.state.invalid_inputs[0]);
        }
    }

    async validateInputs() { 
        var curUser = await AuthRoleValidation.determineUser();
        var inv_in = [];
        this.state.item_properties.map(prop => {
            if (!this.props.item[prop].toString().match(this.getPropertyPattern(prop))) {
                inv_in.push(prop);
            }
        });
        console.log("this is validate: ")
        console.log("this is props item: "+JSON.stringify(this.props.item));
        if(AuthRoleValidation.checkRole(this.props.item, Constants.plant_manager)){
            if(this.props.item.manu_lines!=undefined){
                if(this.props.item.manu_lines.length==0){
                    inv_in.push(Constants.no_manu_lines);
                }
            }
        }
        console.log("current user name VALID: "+ curUser.user.username);
        console.log("current detail name VALID: "+ this.props.item.username);

        if(curUser.user.username == this.props.item.username){
            inv_in.push(Constants.change_own_roles);
        }
        await this.setState({ invalid_inputs: inv_in });
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

    onCheckBoxClick = async (role) => {
        var new_item = this.state.item;
        var new_roles = new_item.roles;
        console.log("new_item: "+JSON.stringify(new_item));
        if(new_roles.includes(role)){
            //removing this role
            var ind = new_roles.indexOf(role);
            new_roles.splice(ind, 1);

            //TODO: MAYBE SEND AN ALERT IF THEY TRY TO UNSELECT ONE THAT ISN'T UNSELECTABLE?
            if(role==Constants.plant_manager){
                var new_manu_lines = [];
                new_item.manu_lines = new_manu_lines;
            }
        }
        else{
            //adding this role.
            new_roles.push(role);
            if(role==Constants.admin){
                //want to add all the roles to the user.
                if(!new_roles.includes(Constants.analyst)) new_roles.push(Constants.analyst);                
                if(!new_roles.includes(Constants.product_manager)) new_roles.push(Constants.product_manager);
                if(!new_roles.includes(Constants.business_manager)) new_roles.push(Constants.business_manager);
                if(!new_roles.includes(Constants.plant_manager)) new_roles.push(Constants.plant_manager);
                //want to add all the manulines to the user.
                //TODO
                var manu_res = await SubmitRequest.submitGetData(Constants.manu_line_page_name);
                var new_manu_lines = [];
                if(manu_res.success){
                    if(manu_res.data!=null){
                        for(let i = 0; i<manu_res.data.length; i++){
                            new_manu_lines.push(manu_res.data[i]._id);
                        }
                    }
                }
                new_item.manu_lines = new_manu_lines;
            }
            else if(role==Constants.product_manager){
                //want to add analyst role to the user.
                if(!new_roles.includes(Constants.analyst)) new_roles.push(Constants.analyst);  
            }
            else if(role==Constants.business_manager){
                //want to add analyst role to the user.
                if(!new_roles.includes(Constants.analyst)) new_roles.push(Constants.analyst);  
            }
            else if(role==Constants.plant_manager){
                //want to add analyst role to the user.
                if(!new_roles.includes(Constants.analyst)) new_roles.push(Constants.analyst); 
                //TODO
                //make the manu selector available. 
            }
        }
        new_item.roles = new_roles;

        await this.setState({
            item: new_item
        })
        console.log("new_item with new roles: "+JSON.stringify(this.state.item));



    };

    isChecked(role) {
        var roles = this.state.item.roles;
        if(roles.includes(role)){
            return true;
        }
        return false;
    };

    onSelectManuLines = async (manu_lines, indices) =>{
        console.log("this is the state.item: "+JSON.stringify(this.state.item));
        console.log("manuLines: "+JSON.stringify(manu_lines));
        var new_item = this.state.item;
        new_item.manu_lines = manu_lines;
        await this.setState({
            item: new_item,
            manu_lines_indices: indices,
            new_data: true,
        })
    }


    render() {
        return (
        <div className='item-details'>
            <div className='item-title'>
                <h1>{ this.props.item ? this.props.item.username : Constants.undefined }</h1>
            </div>
            <div className='item-properties'>
                { this.injectProperties() }
            </div>
            <div className= 'privilege'>
            </div> 
            <FormGroup>
                <Label>Administrator</Label>
                <br></br>
                <Switch onChange={() => this.onCheckBoxClick(Constants.admin)} checked={this.isChecked(Constants.admin)} disabled = {this.state.item.username ==="admin"}/>
            </FormGroup>
            <Form>
                <FormGroup>
                <Label for="exampleCheckbox">User Roles</Label>
                <div>
                    <CustomInput type="checkbox" id="analyst" label="Analyst" checked={this.isChecked(Constants.analyst)} onChange={() => this.onCheckBoxClick(Constants.analyst)} disabled = {this.isChecked(Constants.admin)|| this.isChecked(Constants.product_manager) || this.isChecked(Constants.plant_manager) || this.isChecked(Constants.business_manager)}/>
                    <CustomInput type="checkbox" id="product_manager" label="Product Manager" checked={this.isChecked(Constants.product_manager)}  disabled = {this.isChecked(Constants.admin)} onChange={() => this.onCheckBoxClick(Constants.product_manager)}/>
                    <CustomInput type="checkbox" id="business_manager" label="Business Manager" checked={this.isChecked(Constants.business_manager)} disabled = {this.isChecked(Constants.admin)} onChange={() => this.onCheckBoxClick(Constants.business_manager)}/>
                    <CustomInput type="checkbox" id="plant_manager" label="Plant Manager" checked={this.isChecked(Constants.plant_manager)} disabled = {this.isChecked(Constants.admin)} onChange={() => this.onCheckBoxClick(Constants.plant_manager)}/>
                    {/* <CustomInput type="checkbox" id="admin" label="Admin" disabled = {false} /> */}
                </div>
                </FormGroup>
            </Form>
            {this.isChecked(Constants.plant_manager) ?
                <div>
                    <ManuLineSelect
                            className = 'select-manu-lines'
                            handleSelectManuLines= {this.onSelectManuLines}
                            simple = {false}
                            manu_lines = {this.state.item.manu_lines}
                            user = {this.props.user}
                            user_item = {this.state.item}
                        >
                    </ManuLineSelect>
                </div>
            : <div></div>
            }
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