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
        this.state.items = [
            {
                start: new Date(2019, 2, 19, 8, 30),
                end: new Date(2019, 2, 19, 10, 45), 
                content: 'Biology',
                title: '202L',
                group: 1,
                editable: true
            },
            {
                start: new Date(2019, 2, 19, 10, 30),
                end: new Date(2019, 2, 19, 11, 45),  
                content: 'Maths',
                title: '216D',
                group: 2,
                editable: true
            },
            {
                start: new Date(2019, 2, 19, 13, 30),
                end: new Date(2019, 2, 19, 15, 45), 
                content: 'EGR',
                title: '201L',
                group: 2,
                editable: true
            }
        ]
        this.state.groups = [
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
        this.state.options = {
            width: '100%',
            maxHeight: 50 + 4*35 + 'px',
            stack: false,
            showMajorLabels: true,
            showCurrentTime: true,
            zoomMin: 1000000,
            type: 'box',
            format: {
                minorLabels: {
                    minute: 'h:mma',
                    hour: 'ha'
                }
            },
            selectable: true,
            onMove: function(item, callback) {
                  console.log(item.start)
                }
        }
    }

    onRemove() {
        alert('no!')
    }

    render() {
        return (
        <div>
            <Timeline 
                options={this.options}
                items={this.state.items}
                groups={this.state.groups}
            />
        </div>
        );
    }
}
