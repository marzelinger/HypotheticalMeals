// Comment.js
import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import { UncontrolledCollapse, CardBody, Card } from 'reactstrap';
import deleteButton from'../../../resources/delete.png';
import ManufacturingGoalCalculator from'./ManufacturingGoalCalculator';
import ManuGoalsTables from '../../ListPage/ManuGoalsTables';
import SubmitRequest from '../../../helpers/SubmitRequest';
export default class ManufacturingGoal extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      disabled: false,
      name: this.props.name
    }
  }

  onNameChange = (event) => {
    this.setState({name: event.target.value})
  }

  onNameSubmit = (event) => {
    console.log(event.charCode)
    if(event.charCode == 13){
      this.props.handleUpdateGoal(this.props.id, this.state.name);
    }
  }
  

  onQuantityChange = async (event, activity_index) => {
      console.log(this.props.activities)

      var {_id, sku, scheduled, start, end, duration, error} = this.props.activities[activity_index]
      console.log({_id, sku, scheduled, start, end, duration, error, quantity: Number(event.target.value) })
      await SubmitRequest.submitUpdateItem('manuactivities', {_id, sku, scheduled, start, end, duration, error, quantity: Number(event.target.value) })
      // this.props.handleUpdateGoal(this.props.id);
  }

  handleDeleteActivities = async(selectedActivitiesIndexes) => {
    console.log("deleting")
    if(selectedActivitiesIndexes == undefined){
      return;
    }
    for(var i = 0; i < selectedActivitiesIndexes.length; i ++){
      await SubmitRequest.submitDeleteItem('manuactivities', this.props.activities[i]);
      this.props.activities.splice(i, 1);
    }
    //submit request to delete 
    // this.props.handleUpdateGoal(this.props.id);
  }

  onEnabled = () => {
    this.props.goal['enabled'] = !this.props.goal['enabled']
    this.props.handleUpdateGoal(this.props.id, this.state.name)
    SubmitRequest.submitEnableUpdate(this.props.activities, this.props.goal['enabled']);
  }

  render() {
    return (
      <div id="singleGoal">
        <div className = {`hoverable enablebutton ${this.props.goal.enabled ? 'enabled' : 'disabled'}`} onClick = {() => this.onEnabled()}></div>
        <div className="textContent">
          <div className="singleGoalContent hoverable" id={'goal' + this.props.id}>
            <input onKeyPress = {(event) => this.onNameSubmit(event)} type = "text" value = {this.state.name} onChange = {(event) => this.onNameChange(event)}></input>
          </div>
          <UncontrolledCollapse toggler={'#goal' + this.props.id}>
                <Card>
                    <CardBody>
                        <ManuGoalsTables handleDeleteActivities = {this.handleDeleteActivities} onQuantityChange = {this.onQuantityChange} activities = {this.props.activities}></ManuGoalsTables>
                    </CardBody>
                </Card>
            </UncontrolledCollapse>
        </div>
          <div className="singleGoalButtons">
            <img className = "hoverable" id ="deleteButton" onClick={() => {this.props.handleDeleteGoal(this.props.id); }} src= {deleteButton}></img>
            <ManufacturingGoalCalculator name = {this.props.name} activities = {this.props.activities}></ManufacturingGoalCalculator>
          </div>
      </div>
    )
  }

}

ManufacturingGoal.propTypes = {
  user: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  activities: PropTypes.array.isRequired,
  id: PropTypes.string.isRequired,
  enabled: PropTypes.bool.isRequired,
  handleUpdateGoal: PropTypes.func.isRequired,
  handleDeleteGoal: PropTypes.func.isRequired
};