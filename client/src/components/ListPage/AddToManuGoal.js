// Comment.js
import React from 'react';
import { Modal } from 'reactstrap';
import PropTypes from 'prop-types';
import SelectGoal from './SelectGoal';
import SelectQuantities from './SelectQuantities';
import '../../style/ManufacturingGoalsBox.css'
import * as Constants from '../../resources/Constants';

export default class AddToManuGoal extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            currentScreen: 'selection',
        }
    }

    handleGoalSelection = (goal) => {
        goal.skus = goal.skus.concat(this.props.selected_skus);
        fetch(`/api/manugoals/${goal._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(goal),
        }).then(res => res.json()).then((res) => {
          if (!res.success) this.setState({ error: res.error.message || res.error });
          else this.setState({ name: '', skus: '', user: '', error:null });
        });
        this.props.toggle(Constants.manu_goals_modal);
    }

    selectScreen = () => {
        switch (this.state.currentScreen) {
            case 'selection':
                return <SelectGoal toggle = {this.props.toggle} data = {this.props.manu_goals_data} handleGoalSelection = {this.handleGoalSelection}></SelectGoal>
            case 'quantities':
                return <SelectQuantities></SelectQuantities>
        }
    }

    render(){
        return (
        <Modal isOpen={this.props.isOpen} toggle={this.props.toggle} id="popup" className='item-details'>
            {this.selectScreen()}
        </Modal>
        );
    };
}

AddToManuGoal.propTypes = {
    isOpen: PropTypes.bool,
    toggle: PropTypes.func,
    manu_goals_data: PropTypes.array,
    handleGoalSelection: PropTypes.func,
    selected_skus: PropTypes.array
}