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
                <h5>{this.props.goal.name}</h5>
                <Button>More</Button>
            </div>
        )
    }
}

ManuSchedulePaletteGoal.propTypes = {
    goal: PropTypes.object
}