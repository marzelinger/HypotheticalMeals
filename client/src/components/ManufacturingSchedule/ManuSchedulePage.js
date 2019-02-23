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
            activity_to_schedule: null,
            loaded: false
        }
        if(localStorage != null){
            if(localStorage.getItem("jwtToken")!= null){
                this.state.user = jwt_decode(localStorage.getItem("jwtToken")).username;
            }
        }
        this.prepareAddActivity = this.prepareAddActivity.bind(this);
        this.clickHandler = this.clickHandler.bind(this);
        this.onRemove = this.onRemove.bind(this);
        this.onAdd = this.onAdd.bind(this);
    }

    async componentDidMount() {
        await this.loadScheduleData();
    }

    async loadScheduleData() {
        items.length = 0;
        groups.length = 0;
        console.log(items)
        let activities = await SubmitRequest.submitGetData(Constants.manu_activity_page_name);
        activities.data.map(act => {
            this.scheduleOrPalette(act);
        });
        let lines = await SubmitRequest.submitGetData(Constants.manu_line_page_name);
        lines.data.map(line => {
            groups.push({ id: line._id, content: line.name });
        });
        let goals = await SubmitRequest.submitGetManuGoalsData(this.state.user);
        this.setState({
            activities: activities.data,
            lines: lines.data,
            goals: goals.data,
            loaded: true
        });
    }

    scheduleOrPalette(act) {
        if (act.scheduled) {
            if (items.find(i => i._id === act._id) === undefined) {
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
            
        }
        else {
            // let pa = this.state.palette_activities.slice()
            // if (!pa.includes(act)) {
            //     pa.push(act)
            //     this.setState({ palette_activities : pa })
            // }
        }
    }

    async clickHandler(e) {
        
        // else {
        //     await this.loadScheduleData();
        // }
    }

    prepareAddActivity(activity) {
        this.setState({
            activity_to_schedule: activity
        })
        alert('Double click to place on the schedule!')
    }

    getContainerStyle() {
        if (this.state.activity_to_schedule){
            return { "cursor" : "copy" }
        }
        return {}
    }

    async onMove(item, callback) {
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
        console.log(ok)
        callback(item)
    }

    async onAdd(item, callback) {
        if (this.state.activity_to_schedule) {
            let activity = this.state.activity_to_schedule;
            Object.assign(activity, {
                scheduled: true,
                start: item.start,
                manu_line: { _id: item.group }
            })
            let start = new Date(activity.start)
            let end = new Date()
            end.setTime(start.getTime() + activity.duration*60*60*1000)
            if (start.getHours() < 8 || (end.getHours() === 18 && end.getMinutes() > 0) || (end.getHours() > 18)) {
                alert("Activities can't be scheduled outside working hours!")
                callback(null)
                return;
            }
            let ok = await SubmitRequest.submitUpdateItem(Constants.manu_activity_page_name, activity)
            console.log(ok)

            item = {
                end: end.toString(),
                content: 'SKU: ' + activity.sku.name,
                title: 'SKU: ' + activity.sku.name,
                _id: activity._id
            }
            await this.loadScheduleData();
            await this.setState({ 
                activity_to_schedule: null
            })
        }
        else {
            callback(null)
        }
    }

    async onRemove(item, callback) {
        let act = await SubmitRequest.submitGetManufacturingActivityByID(item._id)
        act.data[0].start = null;
        act.data[0].scheduled = false;
        act.data[0].manu_line = null;
        let ok = await SubmitRequest.submitUpdateItem(Constants.manu_activity_page_name, act.data[0])
        await this.loadScheduleData();
        callback(item)
    }

    getOptions() { 
        return {
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
        hiddenDates: {
            start: '2018-02-01 18:00:00', 
            end: '2018-02-02 08:00:00', 
            repeat:'daily'
        },
        selectable: true,
        editable: {
            add: true,
            remove: true,
            updateGroup: true,
            updateTime: true,
        },
        groupEditable: {
            order: true
        }, 
        onMove: this.onMove,
        onRemove: this.onRemove,
        onAdd: this.onAdd
    }}

    render() {
        return (
        <div>
            <div className={'scheduler-container'} style={this.getContainerStyle()}>
                {this.state.loaded ? console.log('loaded') : console.log('not loaded')}
                {this.state.loaded ? (<Timeline 
                    options={this.getOptions()}
                    items={items}
                    groups={groups}
                    clickHandler={this.clickHandler.bind(this)}
                />) : null}
                <ManuSchedulePalette
                    goals={this.state.goals}
                    activities={this.state.activities}
                    lines={this.state.lines}
                    activity_to_schedule={this.state.activity_to_schedule}
                    prepareAddActivity={this.prepareAddActivity}
                />
            </div>
        </div>
        );
    }
}

var items = [];
var groups = [];




