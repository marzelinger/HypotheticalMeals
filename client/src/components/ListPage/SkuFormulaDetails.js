// ItemSearchModifyListQuantity.js
// Riley
// Individual search component to add/delete items to a list

import React from 'react'
import PropTypes from 'prop-types';
import { 
    Button,
    Input,
    Label,
    FormGroup, 
    ListGroup,
    ListGroupItem} from 'reactstrap';
import * as Constants from '../../resources/Constants';
import SubmitRequest from '../../helpers/SubmitRequest'
import FormulaDetails from '../ListPage/FormulaDetails';
import IngredientsViewSimple from './IngredientsViewSimple'
import ItemSearchInput from './ItemSearchInput';
import ItemSearchModifyListQuantity from './ItemSearchModifyListQuantity';
import printFuncFront from '../../printFuncFront';
import DataStore from '../../helpers/DataStore'



import Filter from './Filter'

const currentUserIsAdmin = require("../auth/currentUserIsAdmin");


export default class SkuFormulaDetails extends React.Component {
    constructor(props) {
        super(props);

        let {
            formula_item_properties, 
            formula_item_property_labels,
            formula_item_property_patterns,
            formula_item_property_field_type } = DataStore.getSkuFormulaDetailsData();

        this.toggleFocus = this.toggleFocus.bind(this);
        this.toggleBlur = this.toggleBlur.bind(this);
        this.onFilterValueChange = this.onFilterValueChange.bind(this);
        this.state = {
            width: 100,
            focus: false,
            substr: '',
            value: '',
            qty: 0,
            assisted_search_results: [],
            newFormula: false,
            existingFormula: false,
            formula_item: null,
            // sku: {this.props.sku}
            item: Object.assign({}, this.props.item),
            formula_item: Object.assign({}, props.formula_item),
            formula_item_properties,
            formula_item_property_labels,
            formula_item_property_patterns,
            formula_item_property_field_type,
            invalid_inputs: [],
            // assisted_search_results: [],
            // prod_line_item: {},
            // to_undo: {}
        };
    }

    async componentDidUpdate (prevProps, prevState) {
        if (prevState.substr !== this.state.substr) {
            await this.updateResults();
        }

    }

    async updateResults() {
        if (this.props.item_type === Constants.details_modify_ingredient && this.state.substr.length > 0) {
            var res = await SubmitRequest.submitGetIngredientsByNameSubstring(this.state.substr);
        }
        if (this.props.item_type === Constants.modify_manu_lines_label && this.state.substr.length > 0) {
            var res = await SubmitRequest.submitGetManufacturingLinesByNameSubstring(this.state.substr);
        }
        // if (this.props.item_type === Constants.details_modify_formula && this.state.substr.length > 0) {
        //     var res = await SubmitRequest.submitGetIngrByNameSubstring(this.state.substr);
        // }

        else {
            var res = {};
            res.data = []
        }
        if (res === undefined || !res.success) res.data = [];
        this.setState({ assisted_search_results: res.data });
    }

    toggleFocus() {
        if (this){
            this.setState({
                focus: true
            })
        }
    }

    toggleBlur() {
        if (this){
            this.setState({
                focus: false
            })
        }
    }

    onFilterValueChange = (value, e) => {
        if (e.action === 'input-change'){
            this.setState({
                substr: value
            });
            return value;
        }
        return this.setState.substr;
    }

    onQuantityChange = (e) => {
        this.setState({
            qty: e.target.value
        });
    }

    getFormulaPropertyLabel = (prop) => {
        return this.state.formula_item_property_labels[this.state.formula_item_properties.indexOf(prop)];
    }

    

    getFormulaPropertyPattern = (prop) => {
        return this.state.formula_item_property_patterns[this.state.formula_item_properties.indexOf(prop)];
    }

    getFormulaPropertyFieldType = (prop) => {
        return this.state.formula_item_property_field_type[this.state.formula_item_properties.indexOf(prop)];
    }

    async onFilterValueSelection (name, value, e) {
        console.log(value);
        this.setState({value: value});
    }

    determineButtonDisplay(state, option) {
        switch (option) {
            case Constants.details_add:
                return (state.value === '' || (state.qty <= 0 && this.props.qty_disable !== true))
            case Constants.details_remove:
                return (state.value === '' || (state.qty <= 0 && this.props.qty_disable !== true))
        }
    }

    createNewFormula = () => {
        // this.setState({
        //     newFormula: true
        // });

        //want to show the formula details module.


    }

    addExistingFormula = () => {
        // this.setState({
        //     existingFormula: true
        // });

    }

    onPropChange = (value, item, prop) => {
        item[prop] = value
        this.setState({ item: item });
    };


    onModifyList = (option, value, qty) => {
        if(currentUserIsAdmin().isValid){
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


    removeIngredient(item, value, qty) {
        
        let ind = -1;
        qty = parseInt(qty);
        item.ingredients.map((ing, index) => {
            if (ing._id === value._id)
                ind = index;
        });
        if (ind > -1) {
            let curr_qty = item.ingredient_quantities[ind];
            curr_qty = curr_qty - qty;
            if (curr_qty > 0) item.ingredient_quantities[ind] = curr_qty;
            else {
                item.ingredients.splice(ind,1);
                item.ingredient_quantities.splice(ind,1);
            }
        }
        this.setState({ item: item })
    }

    addIngredient(item, value, qty) {
        let ind = -1;
        qty = parseInt(qty);
        printFuncFront("this is the current item trying to add to: "+JSON.stringify(item));
        item.ingredients.map((ing, index) => {
            if (ing._id === value._id)
                ind = index;
        });
        console.log()
        if (ind > -1){
            let curr_qty = item.ingredient_quantities[ind];
            curr_qty = curr_qty + qty;
            item.ingredient_quantities[ind] = curr_qty;
        }
        else {
            item.ingredients.push(value);
            item.ingredient_quantities.push(qty);
        }
        this.setState({ item: item })
    }

   injectFormulaProperties = () => {
    if (this.state.formula_item){
        printFuncFront('this is the item in the injecting formulaprops: '+JSON.stringify(this.state.formula_item));
        //let formula = await SubmitRequest.submitGetFormulaByID(this.state.item.formula);
        //printFuncFront('this is the formula: '+JSON.stringify(formula));

        return (this.state.formula_item_properties.map(prop => 
            <FormGroup key={prop}>
                <Label>{this.getFormulaPropertyLabel(prop)}</Label>
                <Input 
                    type={this.getFormulaPropertyFieldType(prop)}
                    value={ this.state.formula_item[prop] }
                    invalid={ this.state.invalid_inputs.includes(prop) }
                    onChange={ (e) => this.onPropChange(e.target.value, this.state.formula_item, prop)}
                    disabled = {currentUserIsAdmin().isValid ? "" : "disabled"}
               />
            </FormGroup>));
    }
    return;
}

    render() {
        return (
        <div className='item-properties'>
        <div>Formula</div>
        <Button color="primary" onClick = {this.createNewFormula()}>Create New Formula</Button>{' '}
        <Button color="secondary" onClick = {this.addExistingFormula()}>Add Existing Formula</Button>{' '}
        {/* {this.switchFormula()} */}
        { this.injectFormulaProperties() }
        <ItemSearchModifyListQuantity
                    api_route={Constants.ingredients_page_name}
                    item_type={Constants.details_modify_ingredient}
                    options={[Constants.details_add, Constants.details_remove]}
                    handleModifyList={this.onModifyList}
                    disabled = {currentUserIsAdmin().isValid ? false : true}
                />
        <IngredientsViewSimple 
                    formula={this.state.formula_item} 
                    handlePropChange={this.onPropChange}
                    disabled={currentUserIsAdmin().isValid ? false : true}
                />
        </div>
        );
    }
}

SkuFormulaDetails.propTypes = {
    item: PropTypes.object,
    formula_item: PropTypes.object,
    //options: PropTypes.arrayOf(PropTypes.string),
    //handleModifyList: PropTypes.func,
    //qty_disable: PropTypes.bool,
    //disabled: PropTypes.bool
  };