// Comment.js
import React from 'react';
import { Modal } from 'reactstrap';
import PropTypes from 'prop-types';
import SelectGoal from './SelectGoal';
import SelectQuantities from './SelectQuantities';
import '../../style/ManufacturingGoalsBox.css'

export default class AddToManuGoal extends React.Component {
    constructor(props){
        super(props);
    }

    render(){
        const goalNodes = this.props.data.map(goal => (
            <div onClick = {() => this.props.handleGoalSelection(goal)} className="singleGoalContent" key={goal._id}>
                <h3>{goal.name}</h3>
            </div>
          ));
        return (
            <div>
               {goalNodes}
            </div>
        );
    };
}

AddToManuGoal.propTypes = {
    data: PropTypes.array,
    handleGoalSelection: PropTypes.func,
    toggle: PropTypes.func
}