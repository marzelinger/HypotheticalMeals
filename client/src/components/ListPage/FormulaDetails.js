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
const currentUserIsAdmin = require("../auth/currentUserIsAdmin");

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

    async handleSubmit(e, opt) {
        if (![Constants.details_save, Constants.details_create].includes(opt)) {
            this.props.handleDetailViewSubmit(e, this.state.item, opt);
            return;
        }
        await this.validateInputs();
        let alert_string = 'Invalid Fields';
        let inv = this.state.invalid_inputs;
        if (inv.length === 0) this.props.handleDetailViewSubmit(e, this.state.item, opt)
        else {
            if(inv.includes('name')){
                alert_string += '\nThe formula name provided is too long';
            }
            alert(alert_string);
        } 
    }

    async validateInputs() { 
        var inv_in = [];
        this.state.item_properties.map(prop => {
            if (!this.state.item[prop].toString().match(this.getPropertyPattern(prop))) inv_in.push(prop);
        })
        if (this.state.item['name'].length > 32) inv_in.push('name');
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

                <ItemSearchModifyListQuantity
                    api_route={Constants.ingredients_page_name}
                    item_type={Constants.details_modify_ingredient}
                    options={[Constants.details_add, Constants.details_remove]}
                    handleModifyList={this.onModifyList}
                    disabled = {currentUserIsAdmin().isValid ? false : true}
                />
                <IngredientsViewSimple 
                    sku={this.state.item} 
                    handlePropChange={this.onPropChange}
                    disabled={currentUserIsAdmin().isValid ? false : true}
                />
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