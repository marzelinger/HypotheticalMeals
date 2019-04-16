// AddToManuGoal.js
import React from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import PropTypes from 'prop-types';
import SelectGoal from './SelectGoal';
import SelectQuantities from './SelectQuantities';
import '../../style/ManufacturingGoalsBox.css'
import * as Constants from '../../resources/Constants';
import { ModalBase } from 'office-ui-fabric-react';
import SubmitRequest from './../../helpers/SubmitRequest';

export default class AddToManuGoal extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            currentScreen: 'selection',
            goal: {},
            quantities: []
        }
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleGoalSelection = (goal) => {
        this.setState({currentScreen: 'quantities', goal: goal})
    }

    cancel = () => {
        this.resetState();
        this.props.toggle(Constants.manu_goals_modal);
    }

    resetState = () => {
        this.setState({currentScreen: 'selection', goal: {}, quantities: []});
        
    }

    async handleSubmit(quantities) {
        var goal = this.state.goal;
        console.log(goal);
        let skus = goal.activities.map(activity => activity.sku._id);
        console.log(skus);
        console.log(goal.activities);
        for(const skustring in quantities){
            //TODO fix error
            var sku = JSON.parse(skustring);
            var skukey = sku._id
            if(!skus.includes(skukey)){
                let activity = await SubmitRequest.submitCreateItem('manuactivities', {sku: sku, quantity: quantities[skustring]})
                goal['activities'].push(activity.data);
            }
            else{
                console.log('found it')
                var index = skus.indexOf(skukey);
                goal.activities[index]['quantity'] = goal.activities[index]['quantity']+ quantities[skustring];
                await SubmitRequest.submitUpdateItem('manuactivities', goal.activities[index]);
            }
        };
        console.log(goal);
        let res = await SubmitRequest.submitUpdateGoal(goal.user, goal._id, goal);
        if (!res.success) {
            this.setState({ error: res.error});
        }
        else {
            this.setState({ name: '', skus: '', user: '', error: null })
        }
        this.resetState();
        this.props.toggle(Constants.manu_goals_modal);
    }

    selectHeader = () => {
        switch (this.state.currentScreen) {
            case 'selection':
                return 'Add SKUs to Manufacturing Goal'
            case 'quantities':
                return 'Input SKU Quantities'
        }
    }

 

    selectScreen = () => {
        switch (this.state.currentScreen) {
            case 'selection':
                return <SelectGoal cancel = {this.cancel} data = {this.props.manu_goals_data} handleGoalSelection = {this.handleGoalSelection}></SelectGoal>
            case 'quantities':
                return <SelectQuantities cancel = {this.cancel} data = {this.props.selected_skus} handleSubmit= {(quantities) => this.handleSubmit(quantities)}></SelectQuantities>
        }
    }

    render(){
        return (
        <Modal isOpen={this.props.isOpen} toggle={() =>  this.props.toggle(Constants.manu_goals_modal)} id="popup" className='item-details'>
            <ModalHeader toggle={() =>  this.props.toggle(Constants.manu_goals_modal)}>{this.selectHeader()}</ModalHeader>
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