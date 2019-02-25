// ManuSchedulePalette.js

import React, { Component } from "react";
import PropTypes from "prop-types";
import DataStore from "../../helpers/DataStore"
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
// import 'react-accessible-accordion/dist/minimal-example.css';
import '../../style/accordianStyle.css';
import ManuSchedulePaletteGoal from "./ManuSchedulePaletteGoal";


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
        return (
            <tr>
                {this.state.item_properties.map(prop => {
                if (prop === 'sku'){
                    console.log(act)
                    return (<td>{act[prop].name}</td>)
                }
                if (prop === 'add_to_schedule'){
                    return (
                        <td>
                            <div 
                                onClick={(e) => this.props.prepareAddActivity(act)}
                                style = {{backgroundColor: this.props.activity_to_schedule ? (this.props.activity_to_schedule._id === act._id ? '#98edf3' : '#d7fbfd') : '#d7fbfd'}}
                                className='add_to_schedule'
                                disabled={this.props.activity_to_schedule ? (this.props.activity_to_schedule._id === act._id ? false : true) : false}
                            >{this.props.activity_to_schedule ? (this.props.activity_to_schedule._id === act._id ? 'x' : '+') : '+'}</div>
                        </td>
                    )
                }
                // change how this is shown
                return (<td>{act[prop]}</td>)}
                )}
            </tr>)
    }

    render() {
        return (
            <div>
                <Accordion accordian={false}>
                    {this.props.goals.map(goal => 
                        <AccordionItem key={goal.name}>
                            <AccordionItemTitle>
                                <ManuSchedulePaletteGoal goal={goal} />
                            </AccordionItemTitle>
                            <AccordionItemBody>
                                <Table className='accordian-table'>
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
    activity_to_schedule: PropTypes.object,
    prepareAddActivity: PropTypes.func
}