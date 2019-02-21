// ManuSchedulePage.js

import React, { Component } from "react";
import PropTypes from "prop-types";
import Timeline from 'react-visjs-timeline'
import SubmitRequest from "../../helpers/SubmitRequest";
import * as Constants from '../../resources/Constants';
const jwt_decode = require('jwt-decode');

export default class ManuSchedulePage extends Component {
    constructor(props) {
        super(props)
        
        this.state = {
            user: '',
            groups : [],
            items: [],
            options: {},
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
        console.log(activities.data)
        console.log(goals.data)
        console.log(lines.data)
        let groups = lines.data.map(line => {
            return { id: line._id, content: line.name }
        })
        let items = activities.data.map(act => {
            let start = new Date(act.start)
            let end = new Date(start.getTime() + (act.duration*60*60*1000));
            return { 
                start: start,
                end: end, 
                content: act.sku.name,
                title: act.manu_line.name,
                group: act.manu_line._id
            }
        })
        console.log(items)
        console.log(groups)
        this.setState({
            groups: groups,
            items: items,
            loaded: true
        })
    }

    render() {
        return (
        <div>
            {this.state.loaded ? (<Timeline 
                options={options}
                items={this.state.items}
                groups={this.state.groups}
            />) : null}
        </div>
        );
    }
}

const def_items = [
    {
        start: new Date(2019, 2, 19, 8, 30),
        end: new Date(2019, 2, 19, 10, 45), 
        content: 'Biology',
        title: '202L',
        group: 1
    },
    {
        start: new Date(2019, 2, 19, 10, 30),
        end: new Date(2019, 2, 19, 11, 45),  
        content: 'Maths',
        title: '216D',
        group: 2
    },
    {
        start: new Date(2019, 2, 19, 13, 30),
        end: new Date(2019, 2, 19, 15, 45), 
        content: 'EGR',
        title: '201L',
        group: 2
    }
]
const def_groups = [
    {
        id: 1,
        content: 'Group A',
    },
    {
        id: 2,
        content: 'Group B',
    },
    {
        id: 3,
        content: 'Group C',
    },
    {
        id: 4,
        content: 'Group D',
    }
]

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
    editable: true,
    groupEditable: true, 
    onMove: function(item, callback) {
          console.log(item.start)
        }
}

