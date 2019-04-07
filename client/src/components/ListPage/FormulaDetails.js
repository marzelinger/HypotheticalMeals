// FormulaDetail.js
// Belal

import React from 'react'
import PropTypes from 'prop-types';
import * as Constants from '../../resources/Constants';
import { 
    Button,
    Input,
    FormGroup,
    Label } from 'reactstrap';
import DataStore from '../../helpers/DataStore'
import IngredientsViewSimple from './IngredientsViewSimple'
import ItemSearchInput from './ItemSearchInput';
import ItemSearchModifyListQuantity from './ItemSearchModifyListQuantity';
import SubmitRequest from '../../helpers/SubmitRequest';
import DetailsViewSkuTable from './DetailsViewSkuTable';
import UnitConversion from '../../helpers/UnitConversion';
import AuthRoleValidation from '../auth/AuthRoleValidation';



export default class FormulaDetails extends React.Component {
    constructor(props){
        super(props);

        let {
            item_properties, 
            item_property_labels,
            item_property_patterns,
            item_property_field_type } = DataStore.getFormulaData();

        this.state = {
            item: Object.assign({}, props.item),
            item_properties,
            item_property_labels,
            item_property_patterns,
            item_property_field_type,
            invalid_inputs: [],
            assisted_search_results: [],
            to_undo: {}
        }
        console.log("this is the formula object: "+JSON.stringify(this.state.item));
    }

    async componentDidMount(){

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
        item[prop] = value
        this.setState({ item: item });
    };

    onModifyList = (option, value, qty) => {
        if(AuthRoleValidation.checkRole(this.props.user, Constants.admin) 
        || AuthRoleValidation.checkRole(this.props.user, Constants.product_manager)){
            var item = Object.assign({}, this.state.item);
            switch (option) {
                case Constants.details_add:
                    this.addIngredient(item, value, qty);
                    break;
                case Constants.details_remove:
                    this.removeIngredient(item, value, qty);
                    break;
            }
            this.setState({ 
                item: item
            })
        }
    }

    async removeIngredient(item, value, qty) { 
        let ind = -1;

        let ingr = await SubmitRequest.submitGetIngredientByID(value._id);
        console.log(ingr);
        console.log('gets here');
        var sanitizedUnits = await UnitConversion.getCleanUnitForm(qty);

        if(sanitizedUnits.success == false) {
            alert("Please enter one of the following units: oz, ounce, lb, pound, ton, g, gram, kilogram, kg, floz, fluidounce, pt, pint, qt, quart, gal, gallon, ml, milliliter, l, liter, ct, count");
            return;
        }

        var ingrType = await UnitConversion.getUnitType(sanitizedUnits.data);
        var ingrType2 = await UnitConversion.getUnitType(ingr.data[0].pkg_size);
        console.log("here" + ingrType)
        console.log("here" + ingrType2)
        if(ingrType == -1){
            alert("Please enter one of the following units: oz, ounce, lb, pound, ton, g, gram, kilogram, kg, floz, fluidounce, pt, pint, qt, quart, gal, gallon, ml, milliliter, l, liter, ct, count");
            return;
        }
        var positive = await this.validatePositive(qty);
        if(!positive) {
            alert("Please enter a positive number");
        }
        if (ingrType != ingrType2) {
            alert(`Please enter a unit matching this ingredient's unit. ${qty} and ${ingr.data[0].pkg_size} do not have the same unit type.`);
            return;
        }
        //qty = parseInt(qty);
        item.ingredients.map((ing, index) => {
            if (ing._id === value._id)
                ind = index;
        });
        if (ind > -1) {
            let curr_qty = item.ingredient_quantities[ind];

            curr_qty = await this.subtractTwoUnits(curr_qty, qty)
            var curr_qty_num_arr = curr_qty.match(/^(-?[0-9]+(?:[\.][0-9]{0,20})?|\.[0-9]{1,20}) (oz|ounce|pound|lb|ton|g|gram|kilogram|kg|floz|fluidounce|pint|pt|quart|qt|gallon|gal|milliliter|ml|liter|l|ct|count)$/);
            if (Number(curr_qty_num_arr[1]) > 0) item.ingredient_quantities[ind] = curr_qty;
            else {
                item.ingredients.splice(ind,1);
                item.ingredient_quantities.splice(ind,1);
            }
        }
        this.setState({ item: item })
    }

    validatePositive(qty){
        var qty_arr = qty.match(/^(-?[0-9]+(?:[\.][0-9]{0,20})?|\.[0-9]{1,20}) (oz|ounce|pound|lb|ton|g|gram|kilogram|kg|floz|fluidounce|pint|pt|quart|qt|gallon|gal|milliliter|ml|liter|l|ct|count)$/);
        if(Number(qty_arr[1]) < 0) return false;
        return true;
    }

    subtractTwoUnits(qty1, qty2){
        var qty1_type = UnitConversion.getUnitType(qty1);
        var qty2_type = UnitConversion.getUnitType(qty2);

        if(qty1_type != qty2_type || qty1_type == -1 || qty2_type == -2) return { success: false, error: "One or more provided ingredient type is invalid"};

        var conversionFuncObj = UnitConversion.getConversionFunction(qty1);
        var convertedToAdd = conversionFuncObj.func(qty2);
        console.log(convertedToAdd);

        var qty1_arr = qty1.match(/^(-?[0-9]+(?:[\.][0-9]{0,20})?|\.[0-9]{1,20}) (oz|ounce|pound|lb|ton|g|gram|kilogram|kg|floz|fluidounce|pint|pt|quart|qt|gallon|gal|milliliter|ml|liter|l|ct|count)$/);
        var qty2_arr = convertedToAdd.match(/^(-?[0-9]+(?:[\.][0-9]{0,20})?|\.[0-9]{1,20}) (oz|ounce|pound|lb|ton|g|gram|kilogram|kg|floz|fluidounce|pint|pt|quart|qt|gallon|gal|milliliter|ml|liter|l|ct|count)$/);
        
        var split_array = qty2_arr[1].split(".");
        console.log(split_array);
        if(split_array.length > 1 && split_array[1].length > 5){
            qty2_arr[1] = Number(qty2_arr[1]).toFixed(5) + "";
        }
        
        var new_num = Number(qty1_arr[1]) - Number(qty2_arr[1]);
        new_num = new_num.toFixed(5);
        var output = "" + Math.round((new_num*100000))/100000 + " " + qty1_arr[2];
        return output
    }

    addTwoUnits(qty1, qty2){
        //qty1 is database 
        var qty1_type = UnitConversion.getUnitType(qty1);
        var qty2_type = UnitConversion.getUnitType(qty2);

        if(qty1_type != qty2_type || qty1_type == -1 || qty2_type == -2) return { success: false, error: "One or more provided ingredient type is invalid"};

        var conversionFuncObj = UnitConversion.getConversionFunction(qty1);
        var convertedToAdd = conversionFuncObj.func(qty2);
        console.log(convertedToAdd);

        var qty1_arr = qty1.match(/^(-?[0-9]+(?:[\.][0-9]{0,20})?|\.[0-9]{1,20}) (oz|ounce|pound|lb|ton|g|gram|kilogram|kg|floz|fluidounce|pint|pt|quart|qt|gallon|gal|milliliter|ml|liter|l|ct|count)$/);
        var qty2_arr = convertedToAdd.match(/^(-?[0-9]+(?:[\.][0-9]{0,20})?|\.[0-9]{1,20}) (oz|ounce|pound|lb|ton|g|gram|kilogram|kg|floz|fluidounce|pint|pt|quart|qt|gallon|gal|milliliter|ml|liter|l|ct|count)$/);
    
        var split_array = qty2_arr[1].split(".");
        console.log(split_array);
        if(split_array.length > 1 && split_array[1].length > 5){
            qty2_arr[1] = Number(qty2_arr[1]).toFixed(5) + "";
        }
        
        var new_num = Number(qty1_arr[1]) + Number(qty2_arr[1]);
        new_num = new_num.toFixed(5);
        var output = "" + Math.round((new_num*100000))/100000 + " " + qty1_arr[2];
        return output;
    }


    async addIngredient(item, value, qty) {
        let ind = -1;
        console.log('hello');
        let ingr = await SubmitRequest.submitGetIngredientByID(value._id);
        console.log(ingr);
        console.log('gets here');

        var sanitizedUnits = await UnitConversion.getCleanUnitForm(qty);

        if(sanitizedUnits.success == false) {
            alert("Please enter one of the following units: oz, ounce, lb, pound, ton, g, gram, kilogram, kg, floz, fluidounce, pt, pint, qt, quart, gal, gallon, ml, milliliter, l, liter, ct, count");
            return;
        }

        var ingrType = await UnitConversion.getUnitType(sanitizedUnits.data);
        var ingrType2 = await UnitConversion.getUnitType(ingr.data[0].pkg_size);

        if(ingrType == -1){
            //TODO: fix this alert message
            alert("Please enter one of the following units: oz, ounce, lb, pound, ton, g, gram, kilogram, kg, floz, fluidounce, pint, pt, quart, qt, gal, gallon, ml, milliliter, l, liter, count, ct");
            return;
        }

        var positive = await this.validatePositive(qty);
        if(!positive) {
            alert("Please enter a positive number");
            return;
        }

        if (ingrType != ingrType2) {
            alert(`Please enter a unit matching this ingredient's unit. ${qty} and ${ingr.data[0].pkg_size} do not have the same unit type.`);
            return;
        }

        //qty = parseInt(qty);
        item.ingredients.map((ing, index) => {
            if (ing._id === value._id)
                ind = index;
        });
        if (ind > -1){
            console.log(item.ingredient_quantities);
            let curr_qty = item.ingredient_quantities[ind];
            //curr_qty = curr_qty + qty;
            console.log(curr_qty);
            console.log(qty);

            item.ingredient_quantities[ind] = await this.addTwoUnits(curr_qty, qty);
        }
        else {
            console.log(item.ingredient_quantities);
            console.log(item.ingredients);
            item.ingredients.push(value);
            item.ingredient_quantities.push(qty);
            console.log(item.ingredient_quantities);
            console.log(item.ingredients);
        }
        this.setState({ item: item })
    }

    async handleSubmit(e, opt) {
        console.log("fomrdetails; "+ JSON.stringify(this.state.item));
        if (![Constants.details_save, Constants.details_create].includes(opt)) {
            this.props.handleDetailViewSubmit(e, this.state.item, opt);
            return;
        }
        await this.validateInputs();
        let alert_string = 'Invalid Fields';
        let inv = this.state.invalid_inputs;
        if (inv.length === 0) this.props.handleDetailViewSubmit(e, this.state.item, opt)
        else {
            if(inv.includes('name_long')){
                alert_string += '\nThe formula name provided is too . Must be between 1 and 32 characters.';
            } else if(inv.includes('name_short')){
                alert_string += '\nThe formula name provided is too short. Must be between 1 and 32 characters.';
            }
            alert(alert_string);
        } 
    }

    async validateInputs() { 
        var inv_in = [];
        this.state.item_properties.map(prop => {
            if (!this.state.item[prop].toString().match(this.getPropertyPattern(prop))) inv_in.push(prop);
        })
        console.log(this.state.item.name.length);
        if(this.state.item.name.length == 0){
            inv_in.push("name_short");
        }
        if (this.state.item.name.length > 32) {
            inv_in.push('name_long');
        }
        await this.setState({ invalid_inputs: inv_in });
    }

    injectProperties = () => {
        if (this.state.item){
            return (this.state.item_properties.map(prop => 
                <FormGroup key={prop}>
                    <Label>{this.getPropertyLabel(prop)}</Label>
                    <Input 
                        type={this.getPropertyFieldType(prop)}
                        value={ this.state.item[prop] }
                        invalid={ this.state.invalid_inputs.includes(prop) }
                        onChange={ (e) => this.onPropChange(e.target.value, this.state.item, prop)}
                        disabled = {AuthRoleValidation.checkRole(this.props.user, Constants.admin) 
                            || AuthRoleValidation.checkRole(this.props.user, Constants.product_manager) ? "" : "disabled"}
                   />
                </FormGroup>));
        }
        return;
    }

    render() {
        return (
        <div className='item-details'>
            <div className='item-title'>
                <h1>{ this.state.item  ? this.state.item.name : Constants.undefined }</h1>
            </div>
            <div className='item-properties'>
                { this.injectProperties() }

                <ItemSearchModifyListQuantity
                    api_route={Constants.ingredients_page_name}
                    item_type={Constants.details_modify_ingredient}
                    options={[Constants.details_add, Constants.details_remove]}
                    handleModifyList={this.onModifyList}
                    disabled = {AuthRoleValidation.checkRole(this.props.user, Constants.admin) 
                        || AuthRoleValidation.checkRole(this.props.user, Constants.product_manager) ? false : true}
                />
                <IngredientsViewSimple 
                    formula={this.state.item} 
                    handlePropChange={this.onPropChange}
                    disabled={AuthRoleValidation.checkRole(this.props.user, Constants.admin) 
                        || AuthRoleValidation.checkRole(this.props.user, Constants.product_manager) ? false : true}
                />
                <DetailsViewSkuTable id='2' formula={this.state.item}/>

                
            </div>
            <div className='item-options'>
                { this.props.detail_view_options.map(opt => 
                    <Button 
                        className = "detailButtons"
                        key={opt} 
                        onClick={(e) => this.handleSubmit(e, opt)}
                    >{opt}</Button>
                )}
            </div>
        </div>
        );
    }
}

FormulaDetails.propTypes = {
    item: PropTypes.object,
    detail_view_options: PropTypes.arrayOf(PropTypes.string),
    handleDetailViewSubmit: PropTypes.func
};
