// ManuSchedulePage.js

import React, { Component } from "react";
import { 
    FormGroup,
    Label,
    Input,
    Alert,
    Button } from 'reactstrap';
import SubmitRequest from "../../helpers/SubmitRequest";
import * as Constants from '../../resources/Constants';
import PropTypes from "prop-types";
import TextField from '@material-ui/core/TextField';
var moment = require('moment');

export default class ManuAutoSchedule extends Component {
    constructor(props) {
        super(props)

        this.state = {

        }
        
    }

    leadingZero(str) {
        str = '' + str
        return str.length == 2 ? str : '0' + str
    }


    render() {
        console.log(this.props.dateRange.startdate)
        return (
            <div>
                <FormGroup className='autoschedule-filter'>
                    <Label for="startdate">Start</Label>
                    <Input
                        type="date"
                        name="date"
                        id="startdate"
                        defaultValue={this.props.dateRange.startdate.toISOString().substr(0,10)}
                        onChange = {(e) => this.props.handleDateRangeSelect(e, 'startdate')}
                        max={moment(this.props.dateRange.enddate).format("YYYY-MM-DD")}
                    />
                </FormGroup>
                <FormGroup className='autoschedule-filter'>
                    <Label for="enddate">End</Label>
                    <Input
                        type="date"
                        name="date"
                        id="enddate"
                        defaultValue={this.props.dateRange.enddate.toISOString().substr(0,10)}
                        onChange = {(e) => this.props.handleDateRangeSelect(e, 'enddate')}
                        // max={moment(this.props.dateRange.enddate).format("YYYY-MM-DD")}
                    />
                </FormGroup>
                {this.props.uncommitted_items.length > 0 ? 
                    <div>
                        <Alert>idk</Alert>
                        <Button onClick={() => this.props.handleAutoscheduleDecision(true)}>Approve Autoschedule</Button>
                        <Button onClick={() => this.props.handleAutoscheduleDecision(false)}>Revert</Button>
                    </div> :
                    null
                }
            </div>
        )
    }
}

ManuAutoSchedule.propTypes = {
    dateRange: PropTypes.object,
    handleDateRangeSelect: PropTypes.func,
    uncommitted_items: PropTypes.array,
    handleAutoscheduleDecision: PropTypes.func
}