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
import ManuAutoSchedule from "./ManuAutoShedule";
const jwt_decode = require('jwt-decode');
const currentUserIsAdmin = require("../auth/currentUserIsAdmin");

export default class ManuSchedulePage extends Component {
    constructor(props) {
        super(props)
        this.range = {};
        
        let today = new Date()
        today.setHours(8)
        today.setMinutes(0)
        today.setSeconds(0)
        today.setMilliseconds(0)
        let tomorrow = new Date(today.getTime())
        tomorrow.setHours(18)
        tomorrow.setMinutes(0)
        tomorrow.setSeconds(0)
        tomorrow.setMilliseconds(0)
        tomorrow.setDate(today.getDate() + 1)

        this.state = {
            user: '',
            options: {},
            lines: [],
            activities: [],
            unscheduled_goals: [],
            activity_to_schedule: null,
            autoselect_activities: [],
            loaded: false,
            modal: false,
            modal_type : '',
            error_change: false,
            autoschedule: false,
            autoschedule_dateRange: { 
                'startdate': today, 
                'enddate': tomorrow 
            },
            autoschedule_toggle_button: 'Autoschedule',
            selected_indexes: {},
            selected_items: [],
            all_selected: false,
            uncommitted_items: [],
            autoschedule_warning: ''
        }

        this.prepareAddActivity = this.prepareAddActivity.bind(this);
        this.doubleClickHandler = this.doubleClickHandler.bind(this);
        this.onMove = this.onMove.bind(this);
        this.onRemove = this.onRemove.bind(this);
        this.onAdd = this.onAdd.bind(this);
        this.updateRange = this.updateRange.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.onSelectAutoselectActivities = this.onSelectAutoselectActivities.bind(this);
        this.toggleAutoschedule = this.toggleAutoschedule.bind(this);
        this.onDateRangeSelect = this.onDateRangeSelect.bind(this)
        this.handleSelect = this.handleSelect.bind(this);
        this.generateAutoschedule = this.generateAutoschedule.bind(this);
        this.onAutoscheduleDecision = this.onAutoscheduleDecision.bind(this);
    }

    async componentDidMount() {
        console.log("mounting")
        await this.loadScheduleData();
    }

    async loadScheduleData() {
        items.length = 0;
        groups.length = 0;
        let initial_activities = await SubmitRequest.submitGetData(Constants.manu_activity_page_name);
        let lines = await SubmitRequest.submitGetData(Constants.manu_line_page_name);
        lines.data.map(line => {
            groups.push({ id: line._id, content: line.name });
        });
        console.log(initial_activities)
        let activities = []
        for(var i = 0; i < initial_activities.data.length; i ++){
            let activity = initial_activities.data[i];
            activities.push(await CheckErrors.updateActivityErrors(activity))
        }
        let goals = await SubmitRequest.submitGetManuGoalsByFilter('_', '_', '_');
        activities.map(act => {
            this.scheduleOrPalette(act, goals);
        });
        this.state.uncommitted_items.map(ui => {
            items.push(ui)
        })
        let unscheduled_goals = goals.data.filter(goal => {
            let not_all_scheduled = false;
            goal.activities.map(act => {
                if (act.unscheduled_enabled) not_all_scheduled = true
            })
            return not_all_scheduled
        })
        await this.setState({
            activities: activities,
            lines: lines.data,
            unscheduled_goals: unscheduled_goals,
            loaded: true
        });
        console.log(items)
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
                if(act.manu_line!=null){
                    items.push({
                        start: start,
                        end: end,
                        content: act.sku.name + ': ' + act.sku.unit_size + ' * ' + act.quantity,
                        title: 'Goal: ' + assoc_goal.name + '<br>Deadline: ' + (parseInt(dl.getMonth())+1) + '/' + dl.getDate() + '/' + dl.getFullYear(),
                        group: act.manu_line._id,
                        className: cName,
                        _id: act._id
                    }); 
                }
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
            let prompt_str = 'This activity '
            if (clicked_activity[0].overwritten) {
                prompt_str += 'has been overriden to a duration of ' + clicked_activity[0].duration + ' hours from the calculated ' + 
                Math.round(clicked_activity[0].sku.manu_rate*clicked_activity[0].quantity) + ' hours. ';
            }
            else {
                prompt_str += 'has a calculated duration of ' + 
                Math.round(clicked_activity[0].sku.manu_rate*clicked_activity[0].quantity) + ' hours. ';
            }
            prompt_str += 'Please enter an integer duration to replace the current.'
            let val = window.prompt(prompt_str, clicked_activity[0].duration)
            if (parseInt(val)) {
                let start = new Date(clicked_item[0].start)
                let end = new Date()
                let duration = parseInt(val)
                end.setTime(start.getTime() + (Math.floor(duration/10)*24 + (duration%10))*60*60*1000)
                clicked_item[0].start = start
                clicked_item[0].end = end
                if (!this.checkWithinHoursAndOverlap(clicked_item[0])) {
                    return
                }
                else {
                    clicked_activity[0].overwritten = !(parseInt(val) === Math.round(clicked_activity[0].sku.manu_rate*clicked_activity[0].quantity))
                    clicked_activity[0].duration = parseInt(val)
                    await CheckErrors.updateActivityErrors(clicked_activity[0]);
                    await this.loadScheduleData();
                }
            }
            else if (val === NaN) {
                alert('Duration must be an integer!')
            }
        }
    }

    prepareAddActivity(activity) {
        let new_act = null
        if (this.state.activity_to_schedule === null) {
            new_act = activity
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
        console.log(item)
        if (!this.checkWithinHoursAndOverlap(item) || 
            !this.checkManuLineIsValid(item, act.data[0].sku.manu_lines)) {
            callback(null);
            return
        }
        let duration = parseInt(act.data[0].duration);
        let hour_difference = (end.getTime()-start.getTime())/(60*60*1000);
        console.log('hour diff: ' + hour_difference)
        if (hour_difference !== duration && (hour_difference !== Math.floor(duration/10)*24 + (duration%10))) {
            //removing drag to change duration functionality because of duration calculations
            callback(null)
            return 
            act.data[0].start = item.start
            this.determineWorkHours(start, end)
            act.data[0].duration = Math.floor(hour_difference/24)*10 + (hour_difference%24)
            act.data[0].overwritten = true
        }
        else {
            act.data[0].start = item.start;
            act.data[0].manu_line = { _id: item.group };
        }
        console.log(act.data[0])
        await CheckErrors.updateActivityErrors(act.data[0]);
        callback(item)
        await this.loadScheduleData();
        await this.setState({error_change: true})
    }

    checkManuLineIsValid(item, sku_manu_lines) {
        if (!sku_manu_lines.includes(item.group)){
            let lines = this.state.lines.filter(l => { return sku_manu_lines.includes(l._id) } )
            lines = lines.map(l => "'" + l.name + "'");
            if (lines.length === 0){
                alert("This activity's SKU does not have any Manufacturing Lines!")
            }
            else {
                let lines_str = lines.join(', ')
                alert('This activity can only be placed on ' + lines_str)
            }
            return false;
        }
        return true;
    }

    checkWithinHoursAndOverlap(item) {
        if (item.start.getHours() < 8 || (item.end.getHours() === 18 && item.end.getMinutes() > 0) || (item.end.getHours() > 18)) {
            alert("Activities can't be scheduled outside working hours!");
            return false;
        }
        let toReturn = true
        items.map(i => {
            if (item.group === i.group && item.id !== i.id) {
                if ((i.start < item.end && i.start > item.start) ||
                    (i.end > item.start && i.end < item.end) ||
                    (i.start <= item.start && i.end >= item.end)){
                        alert("Activities can't overlap!");
                        toReturn = false
                    }
            }
        })
        return toReturn
    }

    async onAdd(item, callback) {
        if (this.state.activity_to_schedule) {
            let activity = this.state.activity_to_schedule;
            let start = new Date(item.start)
            let end = new Date()
            let duration = Math.round(activity.duration)
            end.setTime(start.getTime() + (Math.floor(duration/10)*24 + (duration%10))*60*60*1000)
            item.end = end
            if (!this.checkWithinHoursAndOverlap(item) || 
                !this.checkManuLineIsValid(item, this.state.activity_to_schedule.sku.manu_lines)) {
                callback(null)
                return
            }
            activity.duration = duration
            Object.assign(activity, {
                scheduled: true,
                start: item.start,
                manu_line: { _id: item.group }
            })
            console.log(activity)
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
        zoomMax: 630700000000,
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
        this.range.start = event.start
        this.range.end = event.end;
    }

    updatedErrors = async() => {
        await this.setState({error_change: false})
    }

    async onSelectAutoselectActivities(act) {
        console.log(act)
        let asa = Object.assign([], this.state.autoselect_activities)
        let ind = asa.find(res => res._id === act._id)
        if (ind > -1) {
            asa.splice(ind, 1)
        }
        else {
            asa.push(act)
        }
        console.log(asa)
        await this.setState({
            autoselect_activities: asa
        })
    }

    async toggleAutoschedule() {
        let str = this.state.autoschedule ? 'Autoschedule' : 'Cancel' 
        await this.setState({ 
            autoschedule: !this.state.autoschedule,
            autoschedule_toggle_button: str,
            uncommitted_items: []
        })
    }

    async onDateRangeSelect(event, type) {
        let newRange = Object.assign({}, this.state.autoschedule_dateRange)
        if (['startdate', 'enddate'].includes(type)) {
            let oldDate = newRange[type]
            let newDate = new Date(event.target.value)
            oldDate.setFullYear(newDate.getFullYear())
            oldDate.setMonth(newDate.getMonth())
            oldDate.setDate(newDate.getDate()+1)
            newRange[type] = oldDate
        }
        // else {
        //     let oldDate = newRange[type.substr(0,type.length-4) + 'date']
        //     oldDate.setHours(event.target.value.substr(0,2))
        //     oldDate.setMinutes(event.target.value.substr(3,5))
        //     newRange[type.substr(0,type.length-4) + 'date'] = oldDate
        // }
        await this.setState({
            dateRange: newRange
        })
    }

    async generateAutoschedule() {
        let TEMP_acts = []
        this.state.unscheduled_goals.map(goal => {
            goal.activities.map(act => {
                if (!act.scheduled) {
                    act['deadline'] = goal.deadline
                    TEMP_acts.push(act)
                }
            })
        })
        TEMP_acts.sort(function(a, b){
            let aDate = new Date(a.deadline)
            let bDate = new Date(b.deadline)
            if (aDate.getTime() !== bDate.getTime()) return aDate.getTime() - bDate.getTime()
            else return a.duration - b.duration
        })
        console.log(TEMP_acts)
        let start = this.state.autoschedule_dateRange.startdate
        let end = this.state.autoschedule_dateRange.enddate
        console.log(start)
        // filter to only items that end after range_start
        let rel_items= items.filter(it => {
            let it_end = new Date(it.end)
            return (it_end.getTime() > start.getTime())
        })
        // sort items by end time, earliest to latest
        rel_items.sort(function(a,b) {
            let aDate = new Date(a.end)
            let bDate = new Date(b.end)
            return aDate.getTime() - bDate.getTime()
        })
        console.log(rel_items)
        let new_items = []
        let unscheduled_activities = []
        while (TEMP_acts.length > 0) {
            let curr = TEMP_acts[0]
            let mlines = Object.assign([], curr.sku.manu_lines) //need to filter out lines not owned by self
            let final_item = null
            //try placing items at start of time range
            mlines.some(ml => {
                final_item = this.verifyPlacement(curr, start, mlines[0], rel_items, end)
                if (final_item !== null) return true
            })
            console.log(final_item)
            //if that didn't work, iterate through sorted list of items
            if (final_item === null) {
                rel_items.some(it => {
                    if (curr.sku.manu_lines.includes(it.group)) {
                        final_item = this.verifyPlacement(curr, new Date(it.end), it.group, rel_items, end)
                        console.log(final_item)
                        if (final_item !== null) return true
                    }
                })
            }
            //if that didn't work, push to unscheduled items
            if (final_item === null) unscheduled_activities.push(curr)
            else {
                final_item.id = curr.id
                new_items.push(final_item)
                this.insertItem(final_item, rel_items);
            }
            TEMP_acts.splice(0, 1)
        }
        console.log(new_items)
        console.log(unscheduled_activities)
        if (new_items.length === 0) {
            alert('No selected activities could be scheduled!')
        }
        else {
            var str = ''
            if (unscheduled_activities.length > 0) {
                str = 'The following activities could not be scheduled: '
                unscheduled_activities.map(ua => {
                    str += ua.sku.name + ': ' + ua.sku.unit_size + ' * ' + ua.quantity + ','
                })
                str.substr(0, str.length - 1)
            }
            await this.setState({
                uncommitted_items: new_items,
                autoschedule_warning: str
            })
            await this.loadScheduleData()
        }
    }

    insertItem(final_item, rel_items) {
        let last_end = new Date();
        let curr_end = new Date(final_item.end);
        let final_ind = -1;
        rel_items.some((ri, ind) => {
            let next_end = new Date(ri.end);
            if (curr_end.getTime() >= last_end.getTime() && curr_end <= next_end.getTime()) {
                final_ind = ind;
            }
            last_end = new Date(ri.end);
        });
        if (final_ind > -1) {
            rel_items.splice(final_ind, 0, final_item);
        }
        else {
            rel_items.push(final_item);
        }
    }

    verifyPlacement(act, start, mline, rel_items, auto_end) {
        let end = new Date(start.getTime() + Math.floor(act.duration/10)*24*60*60*1000 + (act.duration%10 * 60 * 60 * 1000));
        let item = {
            start: start,
            end: end,
            content: act.sku.name + ': ' + act.sku.unit_size + ' * ' + act.quantity,
            title: 'Uncommitted',
            group: mline,
            className: 'uncommitted',
            _id: act._id
        };
        console.log(item)
        if (item.start.getHours() < 8 || (item.end.getHours() === 18 && item.end.getMinutes() > 0) || (item.end.getHours() > 18)) {
            return null;
        }
        if (end.getTime() > auto_end.getTime()) return null //this needs to be tested
        let toReturn = item
        console.log('START') 
        rel_items.map(i => {
            console.log(i)
            if (item.group === i.group && item.id !== i.id) {
                console.log(item.group + ': ' + item.id)
                console.log(i.group + ': ' + i.id)
                if ((i.start < item.end && i.start >= item.start) ||
                    (i.end > item.start && i.end <= item.end) ||
                    (i.start <= item.start && i.end >= item.end)){
                        console.log(2)
                        toReturn = null
                    }
            }
        })
        console.log('END')
        console.log(toReturn)
        return toReturn
    }

    handleSelect = async (rowIndexes, g_index) => {
        console.log(rowIndexes)
        var selected = this.state.selected_indexes;
        if(rowIndexes == 'all'){
            var indexes = []
            for(var i = 0; i < this.state.unscheduled_goals[g_index].activities.length; i ++){
                indexes.push(i);
            }
            selected[g_index] = indexes;
           
        }
        else if(rowIndexes == 'none'){
            selected[g_index] = [];
        }
        else{
            selected[g_index] = rowIndexes
        }

        await this.setState({selected_indexes: selected});
        console.log(this.state.selected_indexes);
        return;
    };

    async onAutoscheduleDecision(decision) {
        if (decision) {
            console.log('before map')
            for(var i = 0; i < this.state.uncommitted_items.length; i ++){
                var ui = this.state.uncommitted_items[i];
                let ua = this.state.activities.find(a => a._id === ui._id)
                Object.assign(ua, {
                    scheduled: true,
                    start: ui.start,
                    manu_line: { _id: ui.group }
                })
                console.log(i);
                let res = await CheckErrors.updateActivityErrors(ua);
                console.log(i);
                console.log(res);
            }
            console.log('after map')
        }
        await this.setState({
            uncommitted_items: [],
            error_change: true
        })
        await this.loadScheduleData()
    }

    render() {
        return (
        <div>
            <GeneralNavBar title = {Constants.ManuScheduleTitle}></GeneralNavBar>
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
                    />) : null}
                </div>
                <div className = "belowTimeline">
                    <div className='palette-container'>
                        <h6 className='palette-title'>Unscheduled Activities</h6>
                        <div 
                            className = "info-modal-button" 
                            onClick={(e) => this.toggleModal('palette')}
                        >?</div>
                        <Button
                            onClick={this.toggleAutoschedule}
                        >
                            {this.state.autoschedule_toggle_button}
                        </Button>
                        {this.state.autoschedule && this.state.loaded ? 
                            <Button
                                onClick={this.generateAutoschedule}
                            >Generate Autoschedule</Button> :
                            null
                        }
                        {this.state.autoschedule ? 
                            <ManuAutoSchedule
                                dateRange={this.state.autoschedule_dateRange}
                                handleDateRangeSelect={this.onDateRangeSelect}
                                uncommitted_items={this.state.uncommitted_items}
                                handleAutoscheduleDecision={this.onAutoscheduleDecision}
                                warning={this.state.autoschedule_warning}
                            /> : 
                            <ManuSchedulePalette
                                goals={this.state.unscheduled_goals}
                                activities={this.state.activities}
                                lines={this.state.lines}
                                handleSelect = {this.handleSelect}
                                selected_indexes = {this.state.selected_indexes}
                                selected_items = {this.state.selected_items}
                                activity_to_schedule={this.state.activity_to_schedule}
                                prepareAddActivity={this.prepareAddActivity}
                                selected_activities={this.state.autoselect_activities}
                                handleToggleActivity={this.onSelectAutoselectActivities}
                            />
                        }
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




