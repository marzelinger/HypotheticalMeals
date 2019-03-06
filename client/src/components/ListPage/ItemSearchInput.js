// ItemSearchInput.js
// Riley
// Individual search component to add to field

import React from 'react'
import PropTypes from 'prop-types';
import { 
    Label,
    FormGroup} from 'reactstrap';
import * as Constants from '../../resources/Constants';
import SubmitRequest from './../../helpers/SubmitRequest'
import ReactSelect from 'react-select'
import Filter from './Filter';


export default class ItemSearchInput extends React.Component {
    constructor(props) {
        super(props);

        this.onFilterValueChange = this.onFilterValueChange.bind(this);
        this.state = {
            width: 100,
            focus: false,
            substr: '',
            value: '',
            assisted_search_results: []
        };
    }

    //TODO MAKE SURE THAT THE CURITEM SENDING FROM FORMULADETAILS IS THE POPULATED ONE.
    async componentDidUpdate (prevProps, prevState) {
        if (prevState.substr !== this.state.substr) {
            await this.updateResults();
        }
        if (this.props.curr_item.name !== undefined && this.state.substr != this.props.curr_item.name) {
            this.setState({
                substr: this.props.curr_item.name,
                value: this.props.curr_item._id,
                assisted_search_results: []
            })
        }
    }

    async updateResults() {
        console.log("this is the item type: "+this.props.item_type);
        if (this.props.item_type === Constants.ingredient_label && this.state.substr.length > 0) {
            var res = await SubmitRequest.submitGetIngredientsByNameSubstring(this.state.substr);
        }
        else if (this.props.item_type === Constants.prod_line_label && this.state.substr.length > 0) {
            var res = await SubmitRequest.submitGetProductLinesByNameSubstring(this.state.substr,0,0);
        }
        else if (this.props.item_type === Constants.formula_label && this.state.substr.length > 0) {
            var res = await SubmitRequest.submitGetFormulasByNameSubstring(this.state.substr);
        }
        else if (this.props.item_type === Constants.customer_label && this.state.substr.length > 0) {
            console.log("in the update results for hte get customer by sub");
            var res = await SubmitRequest.submitGetCustomersByNameSubstring(this.state.substr);
        }
        else if (this.props.item_type === Constants.sku_label && this.state.substr.length > 0) {
            console.log("in the update results for hte get customer by sub");
            var res = await SubmitRequest.submitGetSkusByNameSubstring(this.state.substr);
        }
        else {
            var res = {};
            res.data = []
        }
        if (res === undefined || !res.success) res.data = [];
        this.setState({ assisted_search_results: res.data });
    }

    onFilterValueChange = (value, e) => {
        if (e.action === 'input-change'){
            var new_item = this.props.curr_item
            if (new_item !== value){
                new_item = {};
            }
            this.props.handleSelectItem(new_item);
            this.setState({
                substr: value
            });
            return value
        }
        return this.state.substr;
    }

    getType = () => {
        if(this.props.item_type ===Constants.ingredient_label){
            return Constants.ingredients_page_name;
        }
        else if(this.props.item_type ===Constants.prod_line_label){
            return Constants.prod_line_page_name;
        }
        else if(this.props.item_type ===Constants.formula_label){
            return Constants.formulas_page_name;
        }
        else if(this.props.item_type ===Constants.customer_label){
            return Constants.customers_page_name;
        }
        else if(this.props.item_type ===Constants.sku_label){
            return Constants.skus_page_name;
        }

    }
    onFilterValueSelection (label, value) {
        this.setState({
            substr: label,
            value: value,
            assisted_search_results: []
        });
        this.props.handleSelectItem({name: label, _id: value});
    }

    render() {
        return (
        <div className='filter-item detailsfilter' style={{width: this.state.width + '%'}}>
            <FormGroup>
                <Label>{this.props.item_type}</Label>
                <Filter
                    handleFilterValueSelection = {(opt, e) => this.onFilterValueSelection(opt.label, opt.value._id)}
                    type = {this.getType()}
                    multi = {false}
                    place_holder = {this.props.curr_item}
                    disabled = {this.props.disabled}
                    invalid={this.props.invalid_inputs.includes('prod_line')}
                />
            </FormGroup>
        </div>
        );
    }
}

ItemSearchInput.propTypes = {
    curr_item: PropTypes.object,
    item_type: PropTypes.string,
    invalid_inputs: PropTypes.arrayOf(PropTypes.string),
    handleSelectItem: PropTypes.func,
    disabled: PropTypes.bool
  };