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
import DetailsViewSkuTable from './DetailsViewSkuTable'
import { Form, FormText } from 'reactstrap';


const currentUserIsAdmin = require("../auth/currentUserIsAdmin");



export default class UserDetails extends React.Component {
    constructor(props) {
        super(props);

        let {
            item_properties, 
            item_property_labels,
            item_property_patterns,
            item_property_field_type } = DataStore.getUserData();

        this.state = {
            item: props.item,
            item_properties,
            item_property_labels,
            item_property_patterns,
            item_property_field_type,
            invalid_inputs: []
        }
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
        item[prop] = value;
        this.setState({ item: item });
    };

    async handleSubmit(e, opt) {
        if (![Constants.details_save, Constants.details_create].includes(opt)) {
            this.props.handleDetailViewSubmit(e, this.props.item, opt);
            return;
        }
        await this.validateInputs();
        if (this.state.invalid_inputs.length === 0) {
            this.props.handleDetailViewSubmit(e, this.props.item, opt);
        }
        else alert('Invalid Fields');
    }

    async validateInputs() { 
        var inv_in = [];
        this.state.item_properties.map(prop => {
            if (!this.props.item[prop].toString().match(this.getPropertyPattern(prop))) {
                inv_in.push(prop);
            }
        })
        await this.setState({ invalid_inputs: inv_in });
    }

    injectProperties = () => {
        if (this.props.item){
            return (this.state.item_properties.map(prop => 
                <FormGroup key={prop}>
                    <Label>{this.getPropertyLabel(prop)}</Label>
                    <Input 
                        type={this.getPropertyFieldType(prop)}
                        value={ this.props.item[prop] }
                        invalid={ this.state.invalid_inputs.includes(prop) }
                        onChange={ (e) => this.onPropChange(e.target.value, this.props.item, prop) }
                        disabled = {currentUserIsAdmin().isValid ? "" : "disabled"}
                    />
                </FormGroup>));
        }
        return null;
    }
    
    render() {
        return (
        <div className='item-details'>
            <div className='item-title'>
                <h1>{ this.props.item  ? this.props.item.name : Constants.undefined }</h1>
            </div>
            <FormGroup check inline>
          <Label check>
            <Input type="checkbox" /> Some input
          </Label>
        </FormGroup>
            <div className='item-properties'>
                { this.injectProperties() }
                {/* <DetailsViewSkuTable id='1' ingredient={this.props.item}/> */}
            </div>
            <div className= 'privilege'>
            <FormGroup check>
              <Label check>
                <Input type="checkbox" id="checkbox2" />{' '}
                Check me out1
              </Label>
            </FormGroup>
            <FormGroup check>
              <Label check>
                <Input type="checkbox" id="checkbox2" />{' '}
                Check me out
              </Label>
            </FormGroup>
            <FormGroup check>
              <Label check>
                <Input type="checkbox" id="checkbox2" />{' '}
                Check me out
              </Label>
            </FormGroup>
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

UserDetails.propTypes = {
    item: PropTypes.object,
    detail_view_options: PropTypes.arrayOf(PropTypes.string),
    handleDetailViewSubmit: PropTypes.func
  };