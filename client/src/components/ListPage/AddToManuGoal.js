// Comment.js
import React from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import PropTypes from 'prop-types';
import SelectGoal from './SelectGoal';
import SelectQuantities from './SelectQuantities';
import '../../style/ManufacturingGoalsBox.css'
import * as Constants from '../../resources/Constants';
import { ModalBase } from 'office-ui-fabric-react';

export default class AddToManuGoal extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            currentScreen: 'selection',
            goal: {},
            quantities: []
        }
    }

    handleGoalSelection = (goal) => {
        this.setState({currentScreen: 'quantities', goal: goal})
    }

    resetState = () => {
        this.setState({currentScreen: 'selection', goal: {}, quantities: []});
    }

    handleSubmit = (quantities) => {
        var goal = this.state.goal;
        console.log(goal);
        Object.keys(quantities).forEach( (key) => {
            if(!goal.skus.includes(key)){
                goal.quantities.push(quantities[key]);
                goal.skus.push(key);
            }
            else{
                console.log('found it');
                var index = goal.skus.indexOf(key);
                goal.quantities[index] = goal.quantities[index]+ quantities[key];
            }
          });
        console.log(goal);
        fetch(`/api/manugoals/${goal._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(goal),
        }).then(res => res.json()).then((res) => {
          if (!res.success) this.setState({ error: res.error.message || res.error });
          else this.setState({ name: '', skus: '', user: '', error:null });
        });
        this.resetState();
        this.props.toggle(Constants.manu_goals_modal);
    }

    selectScreen = () => {
        switch (this.state.currentScreen) {
            case 'selection':
                return <SelectGoal toggle = {this.props.toggle} data = {this.props.manu_goals_data} handleGoalSelection = {this.handleGoalSelection}></SelectGoal>
            case 'quantities':
                return <SelectQuantities data = {this.props.selected_skus} handleSubmit= {(quantities) => this.handleSubmit(quantities)}></SelectQuantities>
        }
    }

    render(){
        return (
        <Modal isOpen={this.props.isOpen} toggle={() =>  this.props.toggle(Constants.manu_goals_modal)} id="popup" className='item-details'>
            <ModalHeader toggle={() =>  this.props.toggle(Constants.manu_goals_modal)}>Add SKUs to Manufacturing Goal</ModalHeader>
            <ModalBody>
                {this.selectScreen()}
            </ModalBody>
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