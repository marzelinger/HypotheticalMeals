// ManuSchedulePalette.js

import React, { Component } from "react";
import PropTypes from "prop-types";
import * as Constants from '../../resources/Constants';
import CheckErrors from "../../helpers/CheckErrors";
import '../../style/ManuActivityErrors.css'

// import 'react-accessible-accordion/dist/minimal-example.css';

export default class ManuSchedulePalette extends Component {
    constructor (props) {
        super(props)
        this.state  = {
            range:{},
            prevRange:{},
            error_info:[],
            updated_messages: false
        }
    }

    componentDidMount() {
        setInterval(() => {this.setState({range: this.props.range })}, 1000);
    }

    shouldComponentUpdate(nextProps){
        if(this.props.update){
            this.props.onUpdate();
            this.updateInfo(false);
            return true;
        }
        var Datenext =  Date.parse(this.state.range.start);
        var Dateprev =  Date.parse(this.state.prevRange.start);
        if(!Datenext && !Dateprev){
            return false;
        }
        if(Datenext != Dateprev){
            this.setState({prevRange: {...this.props.range}})
            this.updateInfo(true);
            return true;
        }
        if(this.state.updated_messages){
            this.setState({updated_messages: false})
            return true;
        }
        return false;
    }

    async updateInfo(moved) {
        var current_activities = this.props.activities.filter((activity) => {
            var activityStart = new Date(activity.start);
            var activityEnd = CheckErrors.getEndTime(activity);
            var timelineStart = new Date(this.state.range.start);
            var timelineEnd = new Date(this.state.range.end);
            // console.log(`${activity.sku.name} ==> Timeline: ${timelineStart} - ${timelineEnd}, Activity: ${activityStart} - ${activityEnd}`)
            return ((activityEnd >= timelineStart) &&  (activityStart <= timelineEnd))
        })
        var error_info = [];
         console.log("current act"+current_activities);
        for(var i = 0; i < current_activities.length; i ++){
            if(moved) await CheckErrors.updateActivityErrors(current_activities[i])
            let info = await CheckErrors.getErrorMessages(current_activities[i])
            if(info)error_info.push(info);
            // console.log(info);
        }
        this.setState({error_info, updated_messages: true})
    }

    render(){
        // console.log("re rendered");
        let errors;
        // console.log(this.state.error_info)
        var messages = this.state.error_info.map((info) => {
            return (
                <div className = "error_messages" key = {info.name}>
                    <h3 className = "activityname"> {info.name}</h3>
                    <div className = "activityerror">
                        {info.error_messages.map((message) => <p className = {message.key}>{message.message}</p>)}
                    </div>
                </div>
            )
        })
        return (
        <div>
            {messages}
        </div>
        )
    }
}

ManuSchedulePalette.propTypes = {
    goals: PropTypes.arrayOf(PropTypes.object),
    activities: PropTypes.arrayOf(PropTypes.object),
    lines: PropTypes.arrayOf(PropTypes.object)
}