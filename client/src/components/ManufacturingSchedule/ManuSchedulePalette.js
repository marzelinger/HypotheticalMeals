// ManuSchedulePalette.js

import React, { Component } from "react";
import PropTypes from "prop-types";
import SubmitRequest from "../../helpers/SubmitRequest";
import * as Constants from '../../resources/Constants';
import {
    Accordion,
    AccordionItem,
    AccordionItemTitle,
    AccordionItemBody,
} from 'react-accessible-accordion';
import 'react-accessible-accordion/dist/fancy-example.css';
import ManuSchedulePaletteGoal from "./ManuSchedulePaletteGoal";
// import 'react-accessible-accordion/dist/minimal-example.css';

export default class ManuSchedulePalette extends Component {
    constructor (props) {
        super(props)
    }

    render() {
        return (
            <div>
                <Accordion>
                    {this.props.goals.map(goal => 
                        <AccordionItem key={goal.name}>
                            <AccordionItemTitle>
                                <ManuSchedulePaletteGoal
                                    goal={goal}
                                />
                            </AccordionItemTitle>
                            <AccordionItemBody>
                                <p>Body content</p>
                            </AccordionItemBody>
                        </AccordionItem>
                    )}
                </Accordion>
            </div>
        )
    }
}

ManuSchedulePalette.propTypes = {
    goals: PropTypes.arrayOf(PropTypes.object),
    activities: PropTypes.arrayOf(PropTypes.object),
    lines: PropTypes.arrayOf(PropTypes.object)
}