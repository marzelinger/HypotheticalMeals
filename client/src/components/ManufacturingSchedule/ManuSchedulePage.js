// ManuSchedulePage.js

import React, { Component } from "react";
import PropTypes from "prop-types";
import Timeline from 'react-visjs-timeline'
import SubmitRequest from "../../helpers/SubmitRequest";
import * as Constants from '../../resources/Constants';
import {
    Accordion,
    AccordionItem,
    AccordionItemTitle,
    AccordionItemBody,
} from 'react-accessible-accordion';
import 'react-accessible-accordion/dist/fancy-example.css';
const jwt_decode = require('jwt-decode');

export default class ManuSchedulePage extends Component {
    constructor(props) {
        super(props)
        
        this.state = {
            user: '',
            options: {},
            lines: [],
            activities: [],
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
        let goals = await SubmitRequest.submitGetManuGoalsData(this.state.user);
        let lines = await SubmitRequest.submitGetData(Constants.manu_line_page_name);
        lines.data.map(line => {
            groups.push({ id: line._id, content: line.name })
        })
        activities.data.map(act => {
            this.scheduleOrPalette(act);
        })
        this.setState({
            activities: activities.data,
            lines: lines.data,
            loaded: true
        })
    }

    scheduleOrPalette(act) {
        if (act.scheduled) {
            let start = new Date(act.start);
            let end = new Date(start.getTime() + (act.duration * 60 * 60 * 1000));
            console.log(act);
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
            {this.state.loaded ? (<Timeline 
                options={options}
                items={items}
                groups={groups}
                clickHandler={this.clickHandler.bind(this)}
                // changedHandler={this.clickHandler.bind(this)}
                // itemoutHandler={this.outHandler.bind(this)}
            />) : null}
            {/* <Accordion>
                <AccordionItem>
                    <AccordionItemTitle>
                        <h3>Simple title</h3>
                    </AccordionItemTitle>
                    <AccordionItemBody>
                        <p>Body content</p>
                    </AccordionItemBody>
                </AccordionItem>
                <AccordionItem>
                    <AccordionItemTitle>
                        <h3>Complex title</h3>
                        <div>With a bit of description</div>
                    </AccordionItemTitle>
                    <AccordionItemBody>
                        <p>Body content</p>
                    </AccordionItemBody>
                </AccordionItem>
            </Accordion> */}
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

