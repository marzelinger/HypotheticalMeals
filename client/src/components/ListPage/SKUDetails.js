// IngredientItemDetails.js
// Riley
// Item details popup that is used for viewing, editing and creating Ingredients

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
import ItemSearchModifyList from './ItemSearchModifyList';
import SubmitRequest from '../../helpers/SubmitRequest';


export default class SkuDetails extends React.Component {
    constructor(props) {
        super(props);

        let {
            item_properties, 
            item_property_labels,
            item_property_patterns } = DataStore.getSkuData();

        this.state = {
            item_properties,
            item_property_labels,
            item_property_patterns,
            invalid_inputs: [],
            assisted_search_results: [],
            prod_line_item: {}
        }
    }

    async componentDidMount() {
        await this.fillProductLine();
    }

    async fillProductLine() {
        var res = {};
        if (this.props.item.prod_line !== null && this.props.item.prod_line !== '') {
            res = await SubmitRequest.submitGetProductLineByID(this.props.item.prod_line._id);
            if (res === undefined || !res.success) res.data[0] = {};
        }
        else {
            res.data = {}
            res.data[0] = {}
        }
        this.setState({ prod_line_item: res.data[0] });
    }

    getPropertyLabel = (prop) => {
        return this.state.item_property_labels[this.state.item_properties.indexOf(prop)];
    }

    getPropertyPattern = (prop) => {
        return this.state.item_property_patterns[this.state.item_properties.indexOf(prop)];
    }

    onSelectProductLine = (pl) => {
        this.props.handlePropChange(pl._id, this.props.item, 'prod_line');
        this.setState({
            prod_line_item: pl
        })
    }

    onModifyList = (option, value, qty) => {
        var item = this.props.item;
        switch (option) {
            case Constants.details_add:
                this.addIngredient(item, value, qty);
                break;
            case Constants.details_remove:
                this.removeIngredient(item, value, qty);
                break;
        }
        this.setState({ 
            item: item,
            item_changed: true 
        })

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
            console.log(curr_qty)
            if (curr_qty > 0) item.ingredient_quantities[ind] = curr_qty;
            else {
                item.ingredients.splice(ind,1);
                item.ingredient_quantities.splice(ind,1);
            }
        }
    }

    addIngredient(item, value, qty) {
        let ind = -1;
        qty = parseInt(qty);
        item.ingredients.map((ing, index) => {
            if (ing._id === value._id)
                ind = index;
        });
        if (ind > -1){
            let curr_qty = item.ingredient_quantities[ind];
            curr_qty = curr_qty + qty;
            item.ingredient_quantities[ind] = curr_qty;
        }
        else {
            item.ingredients.push(value);
            item.ingredient_quantities.push(qty);
        }
    }

    determineButtonDisplay(option) { //I need to get the cases of this function to actually fire
        var inv_in = this.state.invalid_inputs.slice();
        var ret = true;
        switch (option) {
            case Constants.details_save:
                ret = true;
                this.state.item_properties.map(prop => {
                    if (!this.props.item[prop].toString().match(this.getPropertyPattern(prop))) {
                        inv_in.push(prop);
                        ret = false;
                    }
                })
            case Constants.details_delete:
            case Constants.details_cancel:
                ret = false;
        }
        this.setState({ invalid_inputs: inv_in });
        return ret;
    }

    injectProperties = () => {
        if (this.props.item){
            return (this.state.item_properties.map(prop => 
                <FormGroup key={prop}>
                    <Label>{this.getPropertyLabel(prop)}</Label>
                    <Input 
                        value={ this.props.item[prop] }
                        valid={ this.state.invalid_inputs.includes(prop) }
                        onChange={ (e) => this.props.handlePropChange(e.target.value, this.props.item, prop) }
                    />
                </FormGroup>));
        }
        return;
    }

    render() {
        return (
        <div className='item-details'>
            <div className='item-title'>
                <h1>{ this.props.item  ? this.props.item.name : Constants.undefined }</h1>
            </div>
            <div className='item-properties'>
                { this.injectProperties() }
                <ItemSearchInput
                    curr_item={this.state.prod_line_item}
                    item_type={Constants.prod_line_label}
                    handleSelectItem={this.onSelectProductLine}
                />
                <ItemSearchModifyList
                    api_route={Constants.ingredients_page_name}
                    item_type={Constants.details_modify_ingredient}
                    options={[Constants.details_add, Constants.details_remove]}
                    handleModifyList={this.onModifyList}
                />
                <IngredientsViewSimple 
                    sku={this.props.item} 
                    handlePropChange={this.props.handlePropChange}
                />
            </div>
            <div className='item-options'>
                { this.props.detail_view_options.map(opt => 
                    <Button 
                        disabled={this.determineButtonDisplay(opt)}
                        key={opt} 
                        onClick={(e) => this.props.handleDetailViewSubmit(e, this.props.item, opt)}
                    >{opt}</Button>
                )}
            </div>
        </div>
        );
    }
}

SkuDetails.propTypes = {
    item: PropTypes.object,
    detail_view_options: PropTypes.arrayOf(PropTypes.string),
    handlePropChange: PropTypes.func,
    handleDetailViewSubmit: PropTypes.func
  };