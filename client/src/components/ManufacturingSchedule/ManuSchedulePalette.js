// ManuSchedulePalette.js

import React, { Component } from "react";
import PropTypes from "prop-types";
import SubmitRequest from "../../helpers/SubmitRequest";
import DataStore from "../../helpers/DataStore"
import * as Constants from '../../resources/Constants';
import {
    Button,
    Table,
    Tooltip
} from 'reactstrap'
import {
    Accordion,
    AccordionItem,
    AccordionItemTitle,
    AccordionItemBody,
} from 'react-accessible-accordion';
import 'react-accessible-accordion/dist/fancy-example.css';
// import 'react-accessible-accordion/dist/minimal-example.css';
import ManuSchedulePaletteGoal from "./ManuSchedulePaletteGoal";
import ManuSchedulePaletteActivity from './ManuSchedulePaletteActivity'


export default class ManuSchedulePalette extends Component {
    constructor (props) {
        super(props)

        let {
            item_properties,
            item_property_labels } = DataStore.getActivityData();

        this.state = {
            item_properties,
            item_property_labels,
            tooltipOpen: false
        }

        this.toggle = this.toggle.bind(this);
    }

    toggle() {
        this.setState({
            tooltipOpen: !this.state.tooltipOpen
        });
    }

    getPropertyLabel = (prop) => {
        return this.state.item_property_labels[this.state.item_properties.indexOf(prop)];
    }
    
    injectActivityData(act) {
        console.log(act)
        return (
            <tr>
                {this.state.item_properties.map(prop => {
                if (prop === 'sku'){
                    return (<td>{act[prop].name}</td>)
                }
                if (prop === 'add_to_schedule'){
                    return (
                        <td>
                            <Button onClick={(e) => this.props.prepareAddActivity(act)}>{'+'}</Button>
                        </td>
                    )
                }
                return (<td>{act[prop]}</td>)}
                )}
            </tr>)
    }

    render() {
        return (
            <div>
                <Accordion>
                    {this.props.goals.map(goal => 
                        <AccordionItem key={goal.name}>
                            <AccordionItemTitle>
                                <ManuSchedulePaletteGoal goal={goal} />
                            </AccordionItemTitle>
                            <AccordionItemBody>
                                <Table>
                                    <thead>
                                    <tr>
                                        {this.state.item_properties.map(prop =>
                                            <th>{this.getPropertyLabel(prop)}</th>
                                        )}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {goal.activities.map(act => {
                                        if (!act.scheduled) return this.injectActivityData(act)
                                    })}
                                    </tbody>
                                </Table>
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
    lines: PropTypes.arrayOf(PropTypes.object),
    prepareAddActivity: PropTypes.func
}