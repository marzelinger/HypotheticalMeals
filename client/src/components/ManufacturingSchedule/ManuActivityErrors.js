// ManuSchedulePalette.js

import React, { Component } from "react";
import PropTypes from "prop-types";
import * as Constants from '../../resources/Constants';

// import 'react-accessible-accordion/dist/minimal-example.css';

export default class ManuSchedulePalette extends Component {
    constructor (props) {
        super(props)
    }

    render() {
        // will iterate through all of the scheduled activities in the viewable time range and display the correct errors for them.
    }
}

ManuSchedulePalette.propTypes = {
    goals: PropTypes.arrayOf(PropTypes.object),
    activities: PropTypes.arrayOf(PropTypes.object),
    lines: PropTypes.arrayOf(PropTypes.object)
}