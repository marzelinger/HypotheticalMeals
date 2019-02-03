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
import DataStore from './../../helpers/DataStore'
import DetailsViewSkuTable from './DetailsViewSkuTable'


export default class IngredientDetails extends React.Component {
    constructor(props) {
        super(props);

        let {
            item_properties, 
            item_property_labels } = DataStore.getIngredientData();

        this.state = {
            item_properties,
            item_property_labels
        }
    }

    getPropertyLabel = (prop) => {
        return this.state.item_property_labels[this.state.item_properties.indexOf(prop)];
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
        return null;
    }
    
    render() {
        return (
        <div className='item-details'>
            <div className='item-title'>
                <h1>{ this.props.item  ? this.props.item.name : Constants.undefined }</h1>
            </div>
            <div className='item-properties'>
                { this.injectProperties() }
                <DetailsViewSkuTable id='1' ingredient={this.props.item}/>
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

IngredientDetails.propTypes = {
    item: PropTypes.object,
    detail_view_options: PropTypes.arrayOf(PropTypes.string),
    handlePropChange: PropTypes.func,
    handleDetailViewSubmit: PropTypes.func
  };