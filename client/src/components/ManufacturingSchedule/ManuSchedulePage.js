// ManuSchedulePage.js

import React, { Component } from "react";
import { 
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button } from 'reactstrap';
import Timeline from 'react-visjs-timeline'
import SubmitRequest from "../../helpers/SubmitRequest";
import CheckErrors from '../../helpers/CheckErrors'
import * as Constants from '../../resources/Constants';
import ManuSchedulePalette from './ManuSchedulePalette'
import './../../style/ManuSchedulePageStyle.css';
import GeneralNavBar from '../GeneralNavBar';
import ManuActivityErrors from './ManuActivityErrors';
import ManuSchedHelp from '../../resources/ManuSchedHelp.png'
const jwt_decode = require('jwt-decode');
const currentUserIsAdmin = require("../auth/currentUserIsAdmin");

export default class ManuSchedulePage extends Component {
    constructor(props) {
        super(props)
        this.range = {};
        
        this.state = {
            user: '',
            options: {},
            lines: [],
            activities: [],
            unscheduled_goals: [],
            activity_to_schedule: null,
            selected_activities: [],
            loaded: false,
            modal: false,
            modal_type : '',
            error_change: false
        }
        if(localStorage != null){
            if(localStorage.getItem("jwtToken")!= null){
                this.state.user = jwt_decode(localStorage.getItem("jwtToken")).username;
            }
        }
        this.prepareAddActivity = this.prepareAddActivity.bind(this);
        this.doubleClickHandler = this.doubleClickHandler.bind(this);
        this.selectHandler = this.selectHandler.bind(this);
        this.onMove = this.onMove.bind(this);
        this.onRemove = this.onRemove.bind(this);
        this.onAdd = this.onAdd.bind(this);
        this.updateRange = this.updateRange.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
    }

    async componentDidMount() {
        await this.loadScheduleData();
    }

    async loadScheduleData() {
        items.length = 0;
        groups.length = 0;
        let activities = await SubmitRequest.submitGetData(Constants.manu_activity_page_name);
        await activities.data.forEach(async(activity) => await CheckErrors.updateActivityErrors(activity))
        let goals = await SubmitRequest.submitGetManuGoalsByFilter('_', '_', '_');
        activities.data.map(act => {
            this.scheduleOrPalette(act, goals);
        });
        let unscheduled_goals = goals.data.filter(goal => {
            let not_all_scheduled = false;
            console.log(goal)
            goal.activities.map(act => {
                if (act.unscheduled_enabled) not_all_scheduled = true
            })
            return not_all_scheduled
        })
        let lines = await SubmitRequest.submitGetData(Constants.manu_line_page_name);
        lines.data.map(line => {
            groups.push({ id: line._id, content: line.name });
        });
        await this.setState({
            activities: activities.data,
            lines: lines.data,
            unscheduled_goals: unscheduled_goals,
            loaded: true
        });
    }

    scheduleOrPalette(act, goals) {
        if (act.scheduled) {
            if (items.find(i => i._id === act._id) === undefined) {
                let start = new Date(act.start);
                let end = new Date(start.getTime() + Math.floor(act.duration/10)*24*60*60*1000 + (act.duration%10 * 60 * 60 * 1000));
                let assoc_goal = null;
                goals.data.map(goal => {
                    if(goal.activities.find(a => a._id === act._id)){
                        assoc_goal = goal
                    }
                })
                let cName = '';
                if (act.orphaned) cName = 'orphaned';
                else {
                    if (act.over_deadline) cName += 'over_deadline';
                    if (act.overwritten) cName += ' ' + 'overwritten';
                }
                let dl = new Date(assoc_goal.deadline);
                items.push({
                    start: start,
                    end: end,
                    content: act.sku.name + ': ' + act.sku.unit_size + ' * ' + act.quantity,
                    title: 'Goal: ' + assoc_goal.name + '<br>Deadline: ' + (parseInt(dl.getMonth())+1) + '/' + dl.getDate() + '/' + 
                        dl.getFullYear() + ' ' + dl.getHours() + ':' + (dl.getMinutes()<10 ? ('0'+dl.getMinutes()) : dl.getMinutes()),
                    group: act.manu_line._id,
                    className: cName,
                    _id: act._id
                });
            }
        }
    }

    async toggleModal(type) {
        await this.setState(prevState => ({
          modal: !prevState.modal,
          modal_type: type
        }));
      }

    async doubleClickHandler(e) {
        if (e.item !== null) {
            let clicked_item = items.filter(i => {return i.id === e.item})
            let clicked_activity = this.state.activities.filter(a => {return a._id === clicked_item[0]._id})
            console.log(clicked_activity[0])
            if (window.confirm('Revert the overridden duration of ' + clicked_activity[0].duration + ' hours to the calculated ' + 
               (clicked_activity[0].sku.manu_rate*clicked_activity[0].quantity) + ' hours?')) {
                    clicked_activity[0].overwritten = false
                    await CheckErrors.updateActivityErrors(clicked_activity[0]);
                    await this.loadScheduleData();
            }
        }
    }

    async selectHandler(items, event) {
        await this.setState({ selected_activities: items })
        return(items)
    }

    prepareAddActivity(activity) {
        let new_act = null
        if (this.state.activity_to_schedule === null) {
            new_act = activity
            alert('Double click to place on the schedule!')
        }
        this.setState({
            activity_to_schedule: new_act
        })
        
    }

    getContainerStyle() {
        if (this.state.activity_to_schedule){
            return { cursor : "copy" } //!important doesn't work...
        }
        return {}
    }

    async onMove(item, callback) {
        let act = await SubmitRequest.submitGetManufacturingActivityByID(item._id)
        let end = new Date(item.end)
        let start = new Date(item.start)
        let duration = parseInt(act.data[0].duration);
        let hour_difference = (end.getTime()-start.getTime())/(60*60*1000);
        if (hour_difference !== duration && (hour_difference !== Math.floor(duration/10)*24 + (duration%10))) {
            if (currentUserIsAdmin().isValid){
                act.data[0].start = item.start
                act.data[0].duration = Math.floor(hour_difference/24)*10 + (hour_difference%24)
                act.data[0].overwritten = true
                console.log("here 1")
                await CheckErrors.updateActivityErrors(act.data[0]);
                console.log("here 2")
                callback(item)
                console.log("here 3")
                await this.loadScheduleData();
                console.log("here 4")
                await this.setState({error_change: true})
                return
            }
            else {
                alert('Only Admins can override durations!')
                callback(null)
                return
            }
        }
        if (!this.checkWithinHoursAndOverlap(item, callback) || 
            !this.checkManuLineIsValid(item, act.data[0].sku.manu_lines, callback)) {
            return
        }
        act.data[0].start = item.start;
        act.data[0].manu_line = { _id: item.group };
        await CheckErrors.updateActivityErrors(act.data[0]);
        callback(item)
        await this.loadScheduleData();
        await this.setState({error_change: true})
    }

    checkManuLineIsValid(item, sku_manu_lines, callback) {
        if (!sku_manu_lines.includes(item.group)){
            let lines = this.state.lines.filter(l => { return sku_manu_lines.includes(l._id) } )
            lines = lines.map(l => "'" + l.name + "'");
            let lines_str = lines.join(', ')
            alert('This activity can only be placed on ' + lines_str)
            callback(null)
            return false;
        }
        return true;
    }

    checkWithinHoursAndOverlap(item, callback) {
        if (item.start.getHours() < 8 || (item.end.getHours() === 18 && item.end.getMinutes() > 0) || (item.end.getHours() > 18)) {
            alert("Activities can't be scheduled outside working hours!");
            callback(null);
            return false;
        }
        let toReturn = true
        items.map(i => {
            if (item.group === i.group && item.id !== i.id) {
                if ((i.start < item.end && i.start > item.start) ||
                    (i.end > item.start && i.end < item.end) ||
                    (i.start <= item.start && i.end >= item.end)){
                        alert("Activities can't overlap!");
                        callback(null)
                        toReturn = false
                    }
            }
        })
        return toReturn
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
            activity.duration = Math.round(activity.duration)
            end.setTime(start.getTime() + activity.duration*60*60*1000)
            item.end = end
            if (!this.checkWithinHoursAndOverlap(item, callback) || 
                !this.checkManuLineIsValid(item, this.state.activity_to_schedule.sku.manu_lines, callback)) {
                return
            }
            await CheckErrors.updateActivityErrors(activity);
            await this.loadScheduleData();
            await this.setState({ 
                activity_to_schedule: null,
                error_change: true
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

        console.log(this.state.error_change)
        await CheckErrors.updateActivityErrors(act.data[0]);
        await this.loadScheduleData();
        callback(item)
        await this.setState({error_change: true})
    }

    snap(date, scale, step) {
        // var clone = new Date(date.valueOf());
        // if (clone.getMinutes() > 30){
        //     clone.setHours(clone.getHours() + 1)
        // }
        // clone.setMinutes(0)
        // clone.setMilliseconds(0)
        // return clone
        var hour = 60 * 60 * 1000;
        return Math.round(date / hour) * hour;
    }

    getModalElements() {
        if (this.state.modal_type === 'palette') {
            return (
                <img
                    className='manu-sched-help'
                    src={ManuSchedHelp}
                />
            )
        }
    }

    getModalTitle() {
        if (this.state.modal_type === 'palette') {
            return 'Manufacturing Schedule Help'
        }
        else if (this.state.modal_type === 'errors') {
            return 'Manufacturing Errors Help'
        }
    }

    getOptions() { 
        return {
        width: '100%',
        maxHeight: 60 + 'vh',
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
        multiselect: true,
        editable: {
            add: true,
            remove: true,
            updateGroup: true,
            updateTime: true,
        },
        verticalScroll: true,
        onMove: this.onMove,
        onRemove: this.onRemove,
        onAdd: this.onAdd,
        snap: this.snap
    }}

    updateRange =  (event) => {
        // this.setState({start: event.start})
        this.range['start'] = event.start
        this.range.end = event.end;
    }

    updatedErrors = async() => {
        await this.setState({error_change: false})
    }

    render() {
        return (
        <div>
            <GeneralNavBar></GeneralNavBar>
            <div className={'scheduler-container'} style={this.getContainerStyle()}>
                <div className='timeline-container'>
                    {this.state.loaded ? (
                    <Timeline 
                        options={this.getOptions()}
                        items={items.length ? items : [
                            {
                                start: new Date(),
                                group: groups[0]._id,
                            }
                        ]}
                        groups={groups}
                        doubleClickHandler={this.doubleClickHandler.bind(this)}
                        rangechangeHandler = {this.updateRange}
                        // selectHandler={this.selectHandler.bind(this)}
                    />) : null}
                </div>
                <div className = "belowTimeline">
                    <div className='palette-container'>
                        <h6 className='palette-title'>Unscheduled Activities</h6>
                        <div 
                            className = "info-modal-button" 
                            onClick={(e) => this.toggleModal('palette')}
                        >?</div>
                        <ManuSchedulePalette
                            goals={this.state.unscheduled_goals}
                            activities={this.state.activities}
                            lines={this.state.lines}
                            activity_to_schedule={this.state.activity_to_schedule}
                            prepareAddActivity={this.prepareAddActivity}
                        />
                    </div>
                    <div className='errors-container'>
                        <h6 className='errors-title'>Activity Errors</h6>
                        <ManuActivityErrors 
                            update = {this.state.error_change}
                            onUpdate = {this.updatedErrors}
                            className = "errors" 
                            range = {this.range} 
                            activities = {this.state.activities.filter((activity) => activity.scheduled)}
                        />
                    </div>
                </div>
                <Modal isOpen={this.state.modal} toggle={this.toggleModal} className={this.props.className}>
                    <ModalHeader toggle={this.toggleModal}>{this.getModalTitle()}</ModalHeader>
                    <ModalBody>
                        {this.getModalElements()}                          
                    </ModalBody>
                    <ModalFooter>
                        <Button className='detailButtons' onClick={this.toggleModal}>Close</Button>
                    </ModalFooter>
                </Modal>
            </div>
        </div>
        );
    }
}

var items = [];
var groups = [];




