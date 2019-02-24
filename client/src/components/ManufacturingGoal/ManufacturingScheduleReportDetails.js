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
import SubmitRequest from '../../helpers/SubmitRequest';
const currentUserIsAdmin = require("../auth/currentUserIsAdmin");



export default class ManufacturingScheduleReportDetails extends React.Component {
    constructor(props) {
        super(props);

        // let {
        //     item_properties, 
        //     item_property_labels,
        //     item_property_patterns,
        //     item_property_field_type } = DataStore.getSkuData();

        this.state = {
            manu_line: Object.assign({}, props.manu_line),
            // item_properties,
            // item_property_labels,
            // item_property_patterns,
            // item_property_field_type,
            invalid_inputs: [],
            assisted_search_results: [],
            to_undo: {}
        }
    }

    async componentDidMount() {
        //await this.fillProductLine();
        console.log("modal mounted");
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

    getPropertyLabel = (prop) => {
        return this.state.item_property_labels[this.state.item_properties.indexOf(prop)];
    }

    getPropertyPattern = (prop) => {
        return this.state.item_property_patterns[this.state.item_properties.indexOf(prop)];
    }

    getPropertyFieldType = (prop) => {
        return this.state.item_property_field_type[this.state.item_properties.indexOf(prop)];
    }

    // onSelectProductLine = (pl) => {
    //     if(currentUserIsAdmin().isValid){
    //         var newItem = Object.assign({}, this.state.item);
    //         newItem['prod_line'] = pl._id;
    //         this.setState({
    //             item: newItem,
    //             prod_line_item: pl
    //         })
    //     }
    //     console.log('this is the prod_line_item: '+JSON.stringify(this.state.prod_line_item));
    // }

    // onModifyManuLines = (list) => {
    //     if(currentUserIsAdmin().isValid){
    //         var newItem = Object.assign({}, this.state.item);
    //         newItem['manu_lines'] = list;
    //         this.setState({
    //             item: newItem
    //         })
    //     }
    // }

    onPropChange = (value, item, prop) => {
        item[prop] = value
        this.setState({ item: item });
    };


    // onModifyList = (option, value, qty) => {
    //     if(currentUserIsAdmin().isValid){
    //         var formula_item = Object.assign({}, this.state.formula_item);
    //         console.log("this is the current formula"+ JSON.stringify(formula_item));
    //         console.log("this is the option"+ JSON.stringify(option));

    //         switch (option) {
    //             case Constants.details_add:
    //                 this.addIngredient(formula_item, value, qty);
    //                 break;
    //             case Constants.details_remove:
    //                 this.removeIngredient(formula_item, value, qty);
    //                 break;
    //         }
    //         console.log("this is the current formula after"+ JSON.stringify(this.state.formula_item));
    //         this.setState({ 
    //             formula_item: formula_item
    //         })
    //         console.log("this is formula in onmodifylist after"+ JSON.stringify(this.state.formula_item));

    //     }
    // }


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
        qty = parseInt(qty);
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
        this.setState({ formula_item: formula_item })
    }

    async handleSubmit(e, opt) {
        if (![Constants.details_save, Constants.details_create].includes(opt)) {
            this.props.handleDetailViewSubmit(e, this.state.manu_line, opt);
            return;
        }
        //await this.validateInputs();
        let alert_string = 'Invalid Fields';
        let inv = this.state.invalid_inputs;
        // if (inv.length === 0) this.props.handleDetailViewSubmit(e, this.state.manu_line, this.state.formula_item, opt)
        // else {
        //     if (inv.includes('case_upc') && this.state.manu_line['case_upc'].length > 11)
        //         alert_string += '\nTry Case UPC: ' + CheckDigit.apply(this.state.manu_line['case_upc'].slice(0,11));
        //     if (inv.includes('unit_upc') && this.state.manu_line['unit_upc'].length > 11)
        //         alert_string += '\nTry Unit UPC: ' + CheckDigit.apply(this.state.manu_line['unit_upc'].slice(0,11));
        //     alert(alert_string);
        // } 
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
        <div className='manu-schedule-report-details'>
            <div className='item-title'>
                <h1>{ this.state.manu_line  ? this.state.manu_line.name : Constants.undefined }</h1>
            </div>
            {/* <div className='item-properties'>
                { this.injectProperties() }
                <ModifyManuLines
                    item={this.state.item}
                    label={Constants.modify_manu_lines_label}
                    handleModifyManuLines={this.onModifyManuLines}
                    disabled = {currentUserIsAdmin().isValid ? false : true}
                />
                <ItemSearchInput
                    curr_item={this.state.prod_line_item}
                    item_type={Constants.prod_line_label}
                    invalid_inputs={this.state.invalid_inputs}
                    handleSelectItem={this.onSelectProductLine}
                    disabled = {currentUserIsAdmin().isValid ? false : true}
                />

            </div>
            <div/> */}
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

ManufacturingScheduleReportDetails.propTypes = {
    manu_line: PropTypes.object,
    detail_view_options: PropTypes.arrayOf(PropTypes.string),
    detail_view_action: PropTypes.string,
    handleDetailViewSubmit: PropTypes.func
  };