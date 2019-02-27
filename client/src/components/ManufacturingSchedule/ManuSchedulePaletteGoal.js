// ManuSchedulePaletteGoal.js

import React, { Component } from "react";
import PropTypes from "prop-types";
import * as Constants from '../../resources/Constants';
import { Button } from 'reactstrap'

export default class ManuSchedulePaletteGoal extends Component {
    constructor (props) {
        super(props)

    }

    render() {
        return (
            <div className='goal-container'>
                <h6 className="u-position-relative">{this.props.goal.name}
                    <div className="accordion__arrow" role="presentation"/> 
                </h6>
            </div>
        )
    }
}

ManuSchedulePaletteGoal.propTypes = {
    goal: PropTypes.object
}