// ManuSchedulePaletteActivity.js

import React, { Component } from "react";
import PropTypes from "prop-types";
import * as Constants from '../../resources/Constants';
import { Button } from 'reactstrap'

export default class ManuSchedulePaletteActivity extends Component {
    constructor (props) {
        super(props)

    }

    render() {
        return (
            <div type='box' draggable='true' className='item'>
                <h5>{this.props.activity.sku.name}</h5>
            </div>
        )
    }
}

ManuSchedulePaletteActivity.propTypes = {
    activity: PropTypes.object
}

