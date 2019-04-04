// ManuSchedulePalette.js

import React, { Component } from "react";
import PropTypes from "prop-types";
import DataStore from "../../helpers/DataStore"
import {
    Table,
    Input,
    FormGroup,
    Label,
    Button
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
import Checkbox from '@material-ui/core/Checkbox';


export default class ManuSchedulePalette extends Component {
    constructor (props) {
        super(props)

        let {
            item_properties,
            item_property_labels } = DataStore.getActivityData();

        this.state = {
            item_properties,
            item_property_labels,
            tooltipOpen: false,
            selected: {}
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

    onToggle(act, e) {
        console.log(e)
        let sel = Object.assign({}, this.state.selected)
        sel[act._id] = !sel[act._id]
        this.setState({ selected: sel })
        this.props.handleToggleActivity(act)
    }

    populateSelected(act) {
        if (this.state.selected[act._id] === undefined) {
            let sel = Object.assign({}, this.state.selected)
            sel[act._id] = false
            this.setState({ selected: sel })
        }
    }
    
    injectActivityData(act) {
        console.log(this.state.selected)
        return (
            <tr>
                <Checkbox
                    checked={this.state.selected[act._id]}
                    onChange={() => console.log('change')}//{(e) => this.onToggle(act, e)}
                    value={act._id}
                    color="primary"
                />
                {this.state.item_properties.map(prop => {
                if (prop === 'sku'){
                    return (<td>{act[prop].name + ': ' + act[prop].unit_size + ' * ' + act.quantity}</td>)
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
                if (prop === 'duration'){
                    return (<td>{act[prop] + ' hours'}</td>)
                }
            })}
            </tr>)
    }

    render() {
        return (
            <div>
                <Button>
                    Autoschedule
                </Button>
                <Accordion accordian={false}>
                    {this.props.goals.map(goal => 
                        <AccordionItem key={goal.name}>
                            <AccordionItemTitle>
                                <ManuSchedulePaletteGoal goal={goal} />
                            </AccordionItemTitle>
                            <AccordionItemBody>
                                <Table borderless size="sm" className='accordian-table goal-table'>
                                    <thead>
                                    <tr>
                                        <th>
                                            <Input type="checkbox" />
                                        </th>
                                        {this.state.item_properties.map(prop =>
                                            <th>{this.getPropertyLabel(prop)}</th>
                                        )}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {goal.activities.map(act => {
                                        this.populateSelected(act)
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
    prepareAddActivity: PropTypes.func,
    selected_activities: PropTypes.array,
    handleToggleActivity: PropTypes.func
}