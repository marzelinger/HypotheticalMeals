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

const currentUserIsAdmin = require("../auth/currentUserIsAdmin");



export default class SKUDetails extends React.Component {
    constructor(props) {
        super(props);

        let {
            item_properties, 
            item_property_labels,
            item_property_patterns,
            item_property_field_type } = DataStore.getSkuData();

        this.state = {
            item: Object.assign({}, props.item),
            formula_item: Object.assign({}, props.formula_item),
            item_properties,
            item_property_labels,
            item_property_patterns,
            item_property_field_type,
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
        if(currentUserIsAdmin().isValid){
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
        if(currentUserIsAdmin().isValid){
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
        if(currentUserIsAdmin().isValid){
            var newItem = Object.assign({}, this.state.item);
            newItem['manu_lines'] = list;
            this.setState({
                item: newItem
            })
        }
    }

    onPropChange = (value, item, prop) => {
        item[prop] = value
        this.setState({ item: item });
    };


    onFormulaPropChange = (value, formula_item, prop) => {
        console.log("this is the value: "+value);
        console.log("this is the formula_item: "+JSON.stringify(formula_item));
        console.log("this is the prop: "+prop);
        console.log("PROPS BEING CHANGED IN FORMULA SKUDETAILS");
        formula_item[prop] = value
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


        if(currentUserIsAdmin().isValid){
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


    removeIngredient(formula_item, value, qty) {
        
        let ind = -1;
        qty = parseInt(qty);
        formula_item.ingredients.map((ing, index) => {
            if (ing._id === value._id)
                ind = index;
        });
        if (ind > -1) {
            let curr_qty = formula_item.ingredient_quantities[ind];
            curr_qty = curr_qty - qty;
            if (curr_qty > 0) formula_item.ingredient_quantities[ind] = curr_qty;
            else {
                formula_item.ingredients.splice(ind,1);
                formula_item.ingredient_quantities.splice(ind,1);
            }
        }
        this.setState({ formula_item: formula_item})
    }


    addIngredient(formula_item, value, qty) {
        let ind = -1;
        //qty = parseInt(qty);
        formula_item.ingredients.map((ing, index) => {
            if (ing._id === value._id)
                ind = index;
        });
        console.log("this is after the mapping");
        if (ind > -1){
            let curr_qty = formula_item.ingredient_quantities[ind];
            curr_qty = curr_qty + qty;
            formula_item.ingredient_quantities[ind] = curr_qty;
        }
        else {
            formula_item.ingredients.push(value);
            formula_item.ingredient_quantities.push(qty);
        }
        //THIS IS WHERE THE VALIDATION NEEDS TO HAPPEN FOR 

        this.setState({ formula_item: formula_item })
    }

    async handleSubmit(e, opt) {
        console.log("this is the handlesubmit");
        console.log("this is the prev formula:  "+ JSON.stringify(this.state.formula_item));
        // var formulaItemToSubmit = await this.formatFormulaItem();
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
            if (inv.includes('case_upc') && this.state.item['case_upc'].length > 11)
                alert_string += '\nTry Case UPC: ' + CheckDigit.apply(this.state.item['case_upc'].slice(0,11));
            if (inv.includes('unit_upc') && this.state.item['unit_upc'].length > 11)
                alert_string += '\nTry Unit UPC: ' + CheckDigit.apply(this.state.item['unit_upc'].slice(0,11));
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


    async validateInputs() { 
        var inv_in = [];
        this.state.item_properties.map(prop => {
            if (!this.state.item[prop].toString().match(this.getPropertyPattern(prop))) inv_in.push(prop);
        })
        if (this.state.prod_line_item.name === undefined) inv_in.push('prod_line');
        if (!CheckDigit.isValid(this.state.item['case_upc'])) inv_in.push('case_upc');
        if (!CheckDigit.isValid(this.state.item['unit_upc'])) inv_in.push('unit_upc');
        console.log(inv_in)
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
                        disabled = {currentUserIsAdmin().isValid ? "" : "disabled"}
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
                <ModifyManuLines
                    item={this.state.item}
                    label={Constants.modify_manu_lines_label}
                    handleModifyManuLines={this.onModifyManuLines}
                    disabled = {!currentUserIsAdmin().isValid}
                />
                <ItemSearchInput
                    curr_item={this.state.prod_line_item}
                    item_type={Constants.prod_line_label}
                    invalid_inputs={this.state.invalid_inputs}
                    handleSelectItem={this.onSelectProductLine}
                    disabled = {!currentUserIsAdmin().isValid}
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