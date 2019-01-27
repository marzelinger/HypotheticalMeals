// ItemDetails.js
// Riley
// Item details popup that is used for viewing, editing and creating items

import React from 'react'
import PropTypes from 'prop-types';
import * as Constants from '../resources/Constants';
import { 
    Input,
    InputGroup,
    InputGroupAddon} from 'reactstrap';


export default class ItemDetails extends React.Component {
    constructor(props) {
        super(props);
    }

    getPropertyLabel = (prop) => {
        return this.props.item_property_labels[this.props.item_properties.indexOf(prop)];
    }

    getPropertyPlaceholder = (prop) => {
        return this.props.item_property_placeholder[this.props.item_properties.indexOf(prop)];
    }

    injectProperties = () => {
        if (this.props.item){
            return (this.props.item_properties.map(prop => 
                <InputGroup key={prop}>
                    <InputGroupAddon addonType="prepend">{this.getPropertyLabel(prop)}</InputGroupAddon>
                    <Input 
                        placeholder={ this.getPropertyPlaceholder(prop) } 
                        value={ this.props.item[prop] }
                        /*onChange={}*/
                    />
                </InputGroup>));
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
            </div>
        </div>
        );
    }
}

ItemDetails.propTypes = {
    item: PropTypes.object,
    item_properties: PropTypes.arrayOf(PropTypes.string),
    item_property_labels: PropTypes.arrayOf(PropTypes.string),
    item_property_placeholder: PropTypes.arrayOf(PropTypes.string)
  };