// ItemDetails.js
// Riley
// Item details popup that is used for viewing, editing and creating items

import React from 'react'
import PropTypes from 'prop-types';
import * as Constants from '../resources/Constants';
import {  } from 'reactstrap';


export default class ItemDetails extends React.Component {
    constructor(props) {
        super(props);
    }
    
    render() {
        return (
        <div className='item-details'>
            
        </div>
        );
    }
}

ItemDetails.propTypes = {
    value: PropTypes.string,
    selection: PropTypes.string,
    categories: PropTypes.arrayOf(PropTypes.string),
    handleValueChange: PropTypes.func,
    handleFilterSelection: PropTypes.func
  };