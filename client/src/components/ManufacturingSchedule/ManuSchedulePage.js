// ManuSchedulePage.js

import React, { Component } from "react";
import Timeline from 'react-visjs-timeline'
import SubmitRequest from "../../helpers/SubmitRequest";
import * as Constants from '../../resources/Constants';
import ManuSchedulePalette from './ManuSchedulePalette'
import './../../style/ManuSchedulePage.css';
const jwt_decode = require('jwt-decode');

export default class ManuSchedulePage extends Component {
    constructor(props) {
        super(props)
        
        this.state = {
            user: '',
            options: {},
            lines: [],
            activities: [],
            goals: [],
            loaded: false
        }
        if(localStorage != null){
            if(localStorage.getItem("jwtToken")!= null){
                this.state.user = jwt_decode(localStorage.getItem("jwtToken")).username;
            }
        }
    }

    async componentDidMount() {
        let activities = await SubmitRequest.submitGetData(Constants.manu_activity_page_name);
        activities.data.map(act => {
            this.scheduleOrPalette(act);
        })
        let lines = await SubmitRequest.submitGetData(Constants.manu_line_page_name);
        lines.data.map(line => {
            groups.push({ id: line._id, content: line.name })
        })
        let goals = await SubmitRequest.submitGetManuGoalsData(this.state.user);
        this.setState({
            activities: activities.data,
            lines: lines.data,
            goals: goals.data,
            loaded: true
        })
    }

    scheduleOrPalette(act) {
        if (act.scheduled) {
            let start = new Date(act.start);
            let end = new Date(start.getTime() + (act.duration * 60 * 60 * 1000));
            items.push({
                start: start,
                end: end,
                content: 'SKU: ' + act.sku.name,
                title: 'SKU: ' + act.sku.name,
                group: act.manu_line._id,
                _id: act._id
            });
        }
        else {

        }
    }

    clickHandler(e) {
        console.log(items)
    }

    render() {
        return (
        <div>
            <div className={'scheduler-container'}>
                {this.state.loaded ? (<Timeline 
                    options={options}
                    items={items}
                    groups={groups}
                    clickHandler={this.clickHandler.bind(this)}
                />) : null}
                <ManuSchedulePalette
                    goals={this.state.goals}
                    activities={this.state.activities}
                    lines={this.state.lines}
                />
            </div>
        </div>
        );
    }
}

var items = [];
var groups = [];

const options = {
    width: '100%',
    maxHeight: 50 + 10*40 + 'px',
    stack: false,
    showMajorLabels: true,
    showCurrentTime: true,
    zoomMin: 86400000,
    zoomMax: 5256000000,
    format: {
        minorLabels: {
            minute: 'h:mma',
            hour: 'ha'
        }
    },
    selectable: true,
    editable: {
        add: false,
        remove: true,
        updateGroup: true,
        updateTime: true,
    },
    groupEditable: {
        order: true
    }, 
    onMove: async function(item, callback) {
        let act = await SubmitRequest.submitGetManufacturingActivityByID(item._id)
        let end = new Date(item.end)
        let start = new Date(item.start)
        if ((end.getTime()-start.getTime())/(60*60*1000) !== act.data[0].duration) {
            alert('You cannot change activity duration on the schedule directly!')
            return callback(null)
        }
        act.data[0].start = item.start;
        act.data[0].manu_line = { _id: item.group };
        let ok = await SubmitRequest.submitUpdateItem(Constants.manu_activity_page_name, act.data[0])
        callback(item)
    },
    onRemove: async function(item, callback) {
        let act = await SubmitRequest.submitGetManufacturingActivityByID(item._id)
        act.data[0].start = null;
        act.data[0].scheduled = false;
        act.data[0].manu_line = null;
        let ok = await SubmitRequest.submitUpdateItem(Constants.manu_activity_page_name, act.data[0])
        callback(item)
    }
}

