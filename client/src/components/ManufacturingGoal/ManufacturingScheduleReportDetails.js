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
import {Form, FormText } from 'reactstrap';

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
            to_undo: {},
            start_date:'',
            duration: '',
            errors: {}

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

    onPropChange = (value, item, prop) => {
        item[prop] = value
        this.setState({ item: item });
    };

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
        let reportData = {
            manu_line: this.state.manu_line,
            duration: this.state.duration,
            start_date: this.state.start_date
        }
        
        
        if (![Constants.details_save, Constants.details_export, Constants.details_create].includes(opt)) {
            this.props.handleDetailViewSubmit(e, reportData, opt);
            return;
        }
        await this.validateInputs();
        let alert_string = 'Invalid Field for duration or start date';
        let inv = this.state.invalid_inputs;
        console.log("this is the reportData in handle_submit: "+JSON.stringify(reportData));
        if (inv.length === 0) this.props.handleDetailViewSubmit(e, reportData, opt)
        else {
            alert(alert_string);
        } 
    }

    async validateInputs() { 
        var inv_in = [];
        if (this.state.start_date === undefined) inv_in.push('start_date');
        if((this.state.duration === undefined) || this.state.duration < 1 ) inv_in.push('duration');
        await this.setState({ invalid_inputs: inv_in });
    }
    onStartChange = async (value) => {
        await this.setState({ start_date: value });
        console.log("this is the state of the date; "+this.state.start_date);

    };

    onDurChange = async (value) => {
        await this.setState({ duration: value });
        console.log("this is the state of the duration; "+this.state.duration);

    };


    render() {
        return (
        <div className='manu-schedule-report-details'>
            <div className='item-title'>
                <h1>{ this.state.manu_line  ? this.state.manu_line.name : Constants.undefined }</h1>
            </div>
            <div>Manufacturing Report Schedule Start Date</div> 
            <FormGroup>
                <Label for="startDate">Start Date</Label>
                    <Input
                    type="date"
                    name="date"
                    id="start_date"
                    placeholder="date placeholder"
                    onChange={this.onChange}
                    onChange={ (e) => this.onStartChange(e.target.value)}

                    value={this.state.start_date}
                    error={this.state.errors.start_date}
                />
            </FormGroup>
            <FormGroup>
          <Label for="numberDuration">Report Duration in Days</Label>
          <Input
            type="number"
            name="number"
            id="duration"
            placeholder="enter number of days"
            onChange={ (e) => this.onDurChange(e.target.value)}
            value={this.state.duration}
            error={this.state.errors.duration}
          />
        </FormGroup>
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