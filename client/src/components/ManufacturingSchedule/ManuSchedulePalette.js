// ManuSchedulePalette.js

import React, { Component } from "react";
import PropTypes from "prop-types";
import DataStore from "../../helpers/DataStore"

import {
    Table,
    TableBody,
    TableFooter,
    TableHeader,
    TableHeaderColumn,
    TableRow,
    TableRowColumn
  } from 'material-ui/Table';
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
        let sel = Object.assign({}, this.state.selected)
        sel[act._id] = !sel[act._id]
        this.setState({ selected: sel })
        this.props.handleToggleActivity(act)
    }

    determineSelected= (a_index, g_index) => {
        console.log('Determine Selected: ' + g_index + ' ' + a_index)
        if(this.props.selected_indexes[g_index]){
            var resp =  this.props.selected_indexes[g_index].includes(a_index);
            console.log(resp)
            return resp;
        }
        return false;
    }
    
    injectActivityData(act, a_index, g_index) {
        // console.log(this.state.selected)
        return (
            <TableRow selectable = {this.props.showSelect} selected = {this.determineSelected(a_index, g_index)}>
                {this.state.item_properties.map(prop => {
                if (prop === 'sku'){
                    return (<TableRowColumn>{act[prop].name + ': ' + act[prop].unit_size + ' * ' + act.quantity}</TableRowColumn>)
                }
                if (prop === 'add_to_schedule' && this.props.user.roles.includes('plant_manager')){
                    return (
                        <TableRowColumn>
                            <div 
                                onClick={(e) => this.props.prepareAddActivity(act)}
                                style = {{backgroundColor: this.props.activity_to_schedule ? (this.props.activity_to_schedule._id === act._id ? '#98edf3' : '#d7fbfd') : '#d7fbfd'}}
                                className='add_to_schedule'
                                disabled={this.props.activity_to_schedule ? (this.props.activity_to_schedule._id === act._id ? false : true) : false}
                            >{this.props.activity_to_schedule ? (this.props.activity_to_schedule._id === act._id ? 'x' : '+') : '+'}</div>
                        </TableRowColumn>
                    )
                }
                // change how this is shown
                if (prop === 'duration'){
                    return (<TableRowColumn>{act[prop] + ' hours'}</TableRowColumn>)
                }
            })}
            </TableRow>)
    }

    getActivities = (goal, g_index) => {
        var rowI = 0;
        return goal.activities.map((act) => {
            if (!act.scheduled){
                var data = this.injectActivityData(act, rowI, g_index);
                rowI++;
                return data;
            } 
        })
    }

    render() {
        return (
            <div>
                <Accordion allowMultipleExpanded={true} allowZeroExpanded={true}>
                    {this.props.goals.map((goal, g_index) => 
                        <AccordionItem key={goal.name}>
                            <AccordionItemTitle>
                                <ManuSchedulePaletteGoal goal={goal} />
                            </AccordionItemTitle>
                            <AccordionItemBody>
                                <Table borderless size="sm" className='accordian-table goal-table' 
                                    multiSelectable={this.props.showSelect}
                                    onRowSelection = {(res) => this.props.handleSelect(res, g_index)}
                                >
                                    <TableHeader  
                                        displaySelectAll={this.props.showSelectAll}
                                        adjustForCheckbox={this.props.showSelect}
                                        enableSelectAll={this.props.showSelectAll}>
                                    <TableRow>
                                        {this.state.item_properties.map(prop =>
                                            <TableHeaderColumn>{this.getPropertyLabel(prop)}</TableHeaderColumn>
                                        )}
                                    </TableRow>
                                    </TableHeader>
                                    <TableBody
                                        deselectOnClickaway={false}
                                        displayRowCheckbox={this.props.showSelect}
                                    >
                                    {this.getActivities(goal, g_index)}
                                    </TableBody>
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
    handleToggleActivity: PropTypes.func,
    user: PropTypes.object
}