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
            item_property_labels } = DataStore.getSkuData();

        this.state = {
            item_properties,
            item_property_labels,
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

    onSelectProductLine = (pl) => {
        this.props.handlePropChange(pl._id, this.props.item, 'prod_line');
        this.setState({
            prod_line_item: pl
        })
    }

    onModifyList = (option, value) => {
        var item = this.props.item;
        switch (option) {
            case Constants.details_add:
                this.addIngredient(item, value);
                break;
            case Constants.details_remove:
                this.removeIngredient(item, value);
                break;
        }
        this.setState({ item: item })
    }

    removeIngredient(item, value) {
        let ind = -1;
        item.ingredients.map((ing, index) => {
            if (ing._id === value._id)
                ind = index;
        });
        if (ind > -1) {
            item.ingredients.splice(ind, 1);
        }
    }

    addIngredient(item, value) {
        let contains = false;
        item.ingredients.map(ing => {
            if (ing._id === value._id)
                contains = true;
        });
        if (!contains)
            item.ingredients.push(value);
    }

    injectProperties = () => {
        if (this.props.item){
            return (this.state.item_properties.map(prop => 
                <FormGroup key={prop}>
                    <Label>{this.getPropertyLabel(prop)}</Label>
                    <Input 
                        value={ this.props.item[prop] }
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
                    item_type={Constants.ingredient_label}
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
                    <Button key={opt} onClick={(e) => this.props.handleDetailViewSubmit(e, this.props.item, opt)}>
                        {opt}
                    </Button>
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