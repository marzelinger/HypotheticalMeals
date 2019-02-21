// ManuSchedulePage.js

import React, { Component } from "react";
import PropTypes from "prop-types";
import Timeline from 'react-visjs-timeline'

export default class ManuSchedulePage extends Component {
    constructor(props) {
        super(props)
        
        this.state = {
            groups : [],
            items: [],
            options: {}
        }
        this.initiateData();
    }

    initiateData() {
    }

    render() {
        return (
        <div>
            <Timeline 
                options={options}
                items={items}
                groups={groups}
            />
        </div>
        );
    }
}

const items = [
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
const groups = [
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
    maxHeight: 50 + 4*40 + 'px',
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

