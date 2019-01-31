// Comment.js
import React from 'react';
import { Modal } from 'reactstrap';
import PropTypes from 'prop-types';
import SelectGoal from './SelectGoal';
import SelectQuantities from './SelectQuantities';
import '../../style/ManufacturingGoalsBox.css'
import DataStore from '.././../helpers/DataStore';
import * as Constants from '../../resources/Constants';

export default class AddToManuGoal extends React.Component {
    constructor(props){
        super(props);
    }

    render(){
        

        return (
        <h3>Quants</h3>
        )
    };
}

AddToManuGoal.propTypes = {
}