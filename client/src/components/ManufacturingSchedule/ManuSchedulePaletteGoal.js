// ManuSchedulePaletteGoal.js

import React, { Component } from "react";
import PropTypes from "prop-types";
import * as Constants from '../../resources/Constants';
import {
    Accordion,
    AccordionItem,
    AccordionItemTitle,
    AccordionItemBody,
} from 'react-accessible-accordion';
import 'react-accessible-accordion/dist/fancy-example.css';
// import 'react-accessible-accordion/dist/minimal-example.css';
import { Button } from 'reactstrap'

export default class ManuSchedulePaletteGoal extends Component {
    constructor (props) {
        super(props)

    }

    render() {
        return (
            <div>
                <h4 className="u-position-relative">{this.props.goal.name}
                    <div className="accordion__arrow" role="presentation"/> 
                </h4>
                <Button size="sm">...</Button>
            </div>
        )
    }
}

ManuSchedulePaletteGoal.propTypes = {
    goal: PropTypes.object
}