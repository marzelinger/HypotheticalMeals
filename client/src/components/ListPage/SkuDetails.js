// SkuDetails.js
// Riley
// Item details popup that is used for viewing, editing and creating Ingredients

import React from 'react'
import PropTypes from 'prop-types';
import CheckDigit from '../../helpers/CheckDigit';
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
import ModifyManuLines from './ModifyManuLines';
import SkuFormulaDetails from './SkuFormulaDetails';
import ItemStore from '../../helpers/ItemStore';
import UnitConversion from '../../helpers/UnitConversion';
import AuthRoleValidation from '../auth/AuthRoleValidation';


export default class SKUDetails extends React.Component {
    constructor(props) {
        super(props);

        let {
            item_properties, 
            item_property_labels,
            item_property_patterns,
            item_property_field_type } = DataStore.getSkuData();

            let formProps = DataStore.getFormulaData();

        this.state = {
            item: Object.assign({}, props.item),
            formula_item: Object.assign({}, props.formula_item),
            item_properties,
            item_property_labels,
            item_property_patterns,
            item_property_field_type,
            formProps,
            invalid_inputs: [],
            assisted_search_results: [],
            prod_line_item: {},
            to_undo: {},
            newFormula: false,
            existingFormula: false,
            existingFormulaSelected: false
        }
    }

    async componentDidMount() {
        await this.fillProductLine();
        //await this.fillFormulaLine(); //TODO CHECK THIS
    }

    async fillProductLine() {
        var res = {};
        if (this.state.item.prod_line !== null && this.state.item.prod_line !== '') {
            res = await SubmitRequest.submitGetProductLineByID(this.state.item.prod_line._id);
            if (res === undefined || !res.success) res.data[0] = {};
        }
        else {
            res.data = {}
            res.data[0] = {}
        }
        this.setState({ prod_line_item: res.data[0] });
    }

    async fillFormulaLine() {
        var res = {};
        console.log("This is the fill FormulaLine: "+JSON.stringify(this.state.item));
        if (this.state.item.formula !== null && this.state.item.formula !== '') {
            res = await SubmitRequest.submitGetFormulaByID(this.state.item.formula._id);
            if (res === undefined || !res.success) res.data[0] = {};
        }
        else {
            res.data = {}
            res.data[0] = {}
        }
        this.setState({ formula_item: res.data[0] });
        console.log("this is the current state item: "+JSON.stringify(this.state.item));
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

    onSelectProductLine = (pl) => {
        if(AuthRoleValidation.checkRole(this.props.user, Constants.admin) || AuthRoleValidation.checkRole(this.props.user, Constants.product_manager)){
            var newItem = Object.assign({}, this.state.item);
            newItem['prod_line'] = pl._id;
            this.setState({
                item: newItem,
                prod_line_item: pl
            })
        }
        console.log('this is the prod_line_item: '+JSON.stringify(this.state.prod_line_item));
    }

    onSelectFormula = async (formula) => {
        console.log("the formula is selected.");
        console.log("the formula: "+ JSON.stringify(formula));

        var new_formula_item = await SubmitRequest.submitGetFormulaByID(formula._id);
        console.log("the formula from the call: "+ JSON.stringify(new_formula_item));
        if(new_formula_item.success){
            if(AuthRoleValidation.checkRole(this.props.user, Constants.admin) || AuthRoleValidation.checkRole(this.props.user, Constants.product_manager)){
                var newItem = Object.assign({}, this.state.item);
                newItem['formula'] = formula._id;
                await this.setState({
                    item: newItem,
                    formula_item: new_formula_item.data[0],
                    existingFormulaSelected: true
                })
                console.log("the formula is existingFormula.: "+this.state.existingFormulaSelected);
                console.log("the state of item the state: "+ JSON.stringify(this.state.item));
            }
        }
    }

    onModifyManuLines = (list) => {
        if(AuthRoleValidation.checkRole(this.props.user, Constants.admin) || AuthRoleValidation.checkRole(this.props.user, Constants.product_manager)){
            var newItem = Object.assign({}, this.state.item);
            console.log(newItem);
            newItem['manu_lines'] = list;
            this.setState({
                item: newItem
            })
        }
    }

    onPropChange = (value, item, prop) => {
        if (item.manu_lines.length > 0 && prop === 'manu_rate') {
            alert('Once Manufacturing Lines are set, you cannot change Manufacturing Rate!')
            return
        }
        item[prop] = value
        this.setState({ item: item });
    };


    onFormulaPropChange = (value, formula_item, prop) => {
        console.log("this is the value: "+value);
        console.log("this is the formula_item: "+JSON.stringify(formula_item));
        console.log("this is the prop: "+prop);
        console.log("PROPS BEING CHANGED IN FORMULA SKUDETAILS");
        formula_item[prop] = value;
        this.setState({ formula_item: formula_item });

        var curItem = this.state.item;
        //TODO DO WE REALLY WANT THIS EHRE?
        curItem['formula']=formula_item; //MIGHT BE ISSUE HERE.
        this.setState({ item: curItem });
        //TODO CHECK THAT HERE WE DON'T NEED TO BE SENDING THE FORMULA ITEM UP
        console.log("this is the new formula"+ JSON.stringify(formula_item));
        console.log("this is the new formula state."+ JSON.stringify(this.state.formula_item));

        console.log("this is the new item"+ JSON.stringify(curItem));
        console.log("this is the new formula state."+ JSON.stringify(this.state.item));


    };

    onModifyList = (option, value, qty) => {
        console.log("in on modify list: "+ JSON.stringify(option));
        console.log("in on modify list: val "+ JSON.stringify(value));
        console.log("in on modify list qty: "+ JSON.stringify(qty));


        if(AuthRoleValidation.checkRole(this.props.user, Constants.admin) || AuthRoleValidation.checkRole(this.props.user, Constants.product_manager)){
            var formula_item = Object.assign({}, this.state.formula_item);
            console.log("this is the current formula"+ JSON.stringify(formula_item));
            console.log("this is the option"+ JSON.stringify(option));

            switch (option) {
                case Constants.details_add:
                    this.addIngredient(formula_item, value, qty);
                    break;
                case Constants.details_remove:
                    this.removeIngredient(formula_item, value, qty);
                    break;
            }
            console.log("this is the current formula after"+ JSON.stringify(this.state.formula_item));
            this.setState({ 
                formula_item: formula_item
            })
            console.log("this is formula in onmodifylist after"+ JSON.stringify(this.state.formula_item));

        }
    }


    async removeIngredient(item, value, qty) { 
        let ind = -1;

        let ingr = await SubmitRequest.submitGetIngredientByID(value._id);
        console.log(ingr);
        console.log('gets here');
        var ingrType = await UnitConversion.getUnitType(qty);
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
        this.setState({ formula_item: item })
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
        var output = "" + Math.round((new_num*100000))/100000 + " " + qty1_arr[2];
        return output;
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
        var output = "" + Math.round((new_num*100000))/100000 + " " + qty1_arr[2];
        return output;
    }



    async addIngredient(item, value, qty) {
        let ind = -1;
        console.log('hello');
        let ingr = await SubmitRequest.submitGetIngredientByID(value._id);
        console.log(ingr);
        console.log('gets here');
        var ingrType = await UnitConversion.getUnitType(qty);
        var ingrType2 = await UnitConversion.getUnitType(ingr.data[0].pkg_size);
        console.log("here" + ingrType)
        console.log("here" + ingrType2)
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
        this.setState({ formula_item: item })
    }

    validatePositive(qty){
        var qty_arr = qty.match(/^(-?[0-9]+(?:[\.][0-9]{0,20})?|\.[0-9]{1,20}) (oz|ounce|pound|lb|ton|g|gram|kilogram|kg|floz|fluidounce|pint|pt|quart|qt|gallon|gal|milliliter|ml|liter|l|ct|count)$/);
        if(Number(qty_arr[1]) < 0) return false;
        return true;
    }

    async handleSubmit(e, opt) {
        console.log("this is the handlesubmit");
        console.log("this is the prev formula:  "+ JSON.stringify(this.state.formula_item));
        //var formulaItemToSubmit = await this.formatFormulaItem();
        var formulaItemToSubmit = this.state.formula_item;

        if (![Constants.details_save, Constants.details_create].includes(opt)) {
            this.props.handleDetailViewSubmit(e, this.state.item, formulaItemToSubmit, opt);
            return;
        }
        await this.validateInputs();
        let alert_string = 'Invalid Fields';
        let inv = this.state.invalid_inputs;
        console.log("made is the invalid fields: "+JSON.stringify(inv));

        if (inv.length === 0) this.props.handleDetailViewSubmit(e, this.state.item, formulaItemToSubmit, opt)
        else {
            if (inv.includes('case_upc_num') && !inv.includes('case_upc') && this.state.item['case_upc'].length > 11)
                alert_string += '\nTry Case UPC: ' + CheckDigit.apply(this.state.item['case_upc'].slice(0,11));
            if (inv.includes('unit_upc_num') && !inv.includes('unit_upc') && this.state.item['unit_upc'].length > 11)
                alert_string += '\nTry Unit UPC: ' + CheckDigit.apply(this.state.item['unit_upc'].slice(0,11));
            if (inv.includes('formula_name') && opt == Constants.details_create)
                alert_string += '\nYou must select or create a formula when creating a SKU.';
            if (inv.includes('formula_name_length'))
                alert_string += '\nThe formula name cannot be longer than 32 characters.';
            if (inv.includes('formula_name_length_short'))
                alert_string += '\nThe formula name must have at least one character';
            if (inv.includes('setup_cost'))
                alert_string += '\nThe setup cost must be a valid currency expression (i.e. 5.00, 2.44, 4.33, 5, 12)';
            if (inv.includes('run_cpc'))
                alert_string += '\nThe run cost must be a valid currency expression (i.e. 5.00, 2.44, 4.33, 5, 12)';
            alert(alert_string);
        } 
    }

    formatFormulaItem = async () => {
        var formItem = await ItemStore.getEmptyItem(Constants.formulas_page_name);
        if(this.state.formula_item!=undefined) {
            if(this.state.formula_item.ingredients!=undefined){
                var numIngs = this.state.formula_item.ingredients.length;
                formItem['name']=this.state.formula_item.name;
                formItem['num']=this.state.formula_item.num;
                formItem['comment']=this.state.formula_item.comment;
                for(let i = 0; i<numIngs;i++){
                    formItem['ingredients'].push(this.state.formula_item.ingredients[i]._id);
                    formItem['ingredient_quantities'].push(this.state.formula_item.ingredient_quantities[i]);

                }

            }
        }

        return formItem;

    }

    isNewSku(prop) {
        if (prop !== 'num') {
            return true
        }
        if (this.props.detail_view_options.includes(Constants.details_create)){
            return true
        }
        return false
    }


    async validateInputs() { 
        var inv_in = [];
        this.state.item_properties.map(prop => {
            if (!this.state.item[prop].toString().match(this.getPropertyPattern(prop))) inv_in.push(prop);
        })
        if (this.state.prod_line_item.name === undefined) inv_in.push('prod_line');
        if (!CheckDigit.isValid(this.state.item['case_upc'])) inv_in.push('case_upc_num');
        if (!CheckDigit.isValid(this.state.item['unit_upc'])) inv_in.push('unit_upc_num');

        this.state.formProps.item_properties.map(prop => {
            if (!this.state.formula_item[prop].toString().match(this.getPropertyPattern(prop))) inv_in.push("formula_"+prop);
        })
        if (this.state.formula_item.name === undefined) inv_in.push('formula');
        if (this.state.formula_item['name'].length > 32) inv_in.push('formula_name_length');
        if (this.state.formula_item['name'].length == 0) inv_in.push('formula_name_length_short');
        await this.setState({ invalid_inputs: inv_in });
    }

    injectProperties = () => {
        if (this.state.item){
            return this.state.item_properties.map(prop => 
                <FormGroup key={prop}>
                    <Label>{this.getPropertyLabel(prop)}</Label>
                    <Input 
                        type={this.getPropertyFieldType(prop)}
                        value={ this.state.item[prop] }
                        invalid={ this.state.invalid_inputs.includes(prop) }
                        onChange={ (e) => this.onPropChange(e.target.value, this.state.item, prop)}
                        disabled = {(AuthRoleValidation.checkRole(this.props.user, Constants.admin) || AuthRoleValidation.checkRole(this.props.user, Constants.product_manager)) && this.isNewSku(prop) ? "" : "disabled"}
                   />
                </FormGroup>
            )
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
                <ModifyManuLines
                    item={this.state.item}
                    label={Constants.modify_manu_lines_label}
                    handleModifyManuLines={this.onModifyManuLines}
                    disabled = {AuthRoleValidation.checkRole(this.props.user, Constants.admin) 
                        || AuthRoleValidation.checkRole(this.props.user, Constants.product_manager) ? "" : "disabled"}                    
                    user = {this.props.user}
                />
                <ItemSearchInput
                    curr_item={this.state.prod_line_item}
                    item_type={Constants.prod_line_label}
                    invalid_inputs={this.state.invalid_inputs}
                    handleSelectItem={this.onSelectProductLine}
                    disabled = {AuthRoleValidation.checkRole(this.props.user, Constants.admin) 
                        || AuthRoleValidation.checkRole(this.props.user, Constants.product_manager) ? "" : "disabled"}                    
                    user = {this.props.user}
                />
                <SkuFormulaDetails
                    item = {this.state.item}
                    formula_item = {this.state.formula_item}
                    handleFormulaPropChange={this.onFormulaPropChange}
                    handleModifyList={this.onModifyList}
                    detail_view_action = {this.props.detail_view_action}
                    handleSelectFormulaItem = {this.onSelectFormula}
                    existingFormulaSelected = {this.state.existingFormulaSelected}
                    invalid_inputs={this.state.invalid_inputs}
                    user = {this.props.user}
                />

            </div>
            <div/>
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

SKUDetails.propTypes = {
    item: PropTypes.object,
    formula_item: PropTypes.object,
    detail_view_options: PropTypes.arrayOf(PropTypes.string),
    detail_view_action: PropTypes.string,
    handleDetailViewSubmit: PropTypes.func
  };