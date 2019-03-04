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
import CheckErrors from '../../../helpers/CheckErrors';
import ManufacturingGoalDetails from './ManufacturingGoalDetails';
import * as Constants from '../../../resources/Constants';
import editButton from '../../../resources/edit.png';

export default class ManufacturingGoal extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      disabled: false,
      name: this.props.name,
      original_enable: this.props.goal.enabled
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
  
  handleDeleteGoal = async () => {
    //if any activities are scheduled
    if(this.props.goal.enabled){
      alert("You cannot delete an enabled manufacturing goal")
      console.log("return false")
      return false;
    }
    else{
      if(this.props.activities.filter((activity => activity.scheduled)).length != 0){
        if(window.confirm("Deleting this goal will remove all orphaned activities from the schedule, are you sure you want to delete?")){
          for(var i = 0; i < this.props.activities.length; i ++){
            await SubmitRequest.submitDeleteItem('manuactivities', this.props.activities[i]);
            this.props.activities.splice(i, 1);
          }
          this.props.handleDeleteGoal(this.props.id)
          return true;
        }
        return false;
      }
      else{
        for(var i = 0; i < this.props.activities.length; i ++){
          console.log('deleting activity')
          await SubmitRequest.submitDeleteItem('manuactivities', this.props.activities[i]);
          this.props.activities.splice(i, 1);
        }
        this.props.handleDeleteGoal(this.props.id)
        return true;
      }
    }
  }

  handleDeleteActivities = async(selectedActivitiesIndexes) => {
    if(selectedActivitiesIndexes == undefined){
      return;
    }
    else if(window.confirm("Are you sure you want to delete these activities? It will remove them from the schedule")){
      for(var i = 0; i < selectedActivitiesIndexes.length; i ++){
        await SubmitRequest.submitDeleteItem('manuactivities', this.props.activities[selectedActivitiesIndexes[i]]);
        this.props.activities.splice(i, 1);
      }
    }
    //submit request to delete 
    // this.props.handleUpdateGoal(this.props.id);
  }

  handleDetailViewSubmit = async(event, item, option)=> {
    if(option == Constants.details_delete){
      return await this.handleDeleteGoal();
    }else{
      console.log("calling function")
      return await this.props.handleDetailViewSubmit(event, item, option);
    }
  }

  onEnabled = async() => {
    console.log("updating");
    this.props.goal['enabled'] = !this.props.goal['enabled']
    await this.props.handleUpdateGoal(this.props.id, this.state.name)
    await this.props.activities.forEach(async(activity) => {
      await CheckErrors.updateActivityErrors(activity);
    })
    console.log("done updating");
  }

  render() {
    return (
      <div id="singleGoal">
        <div className={`textContent ${this.props.goal.enabled ? 'enabled' :'disabled'}`}>
          <div className="singleGoalContent hoverable" id={'goal' + this.props.id}>
            <h3>{this.props.goal.name}</h3>
            {/* <input onKeyPress = {(event) => this.onNameSubmit(event)} type = "text" value = {this.props.goal.name} onChange = {(event) => this.onNameChange(event)}></input> */}
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
            {/* <img className = "hoverable" id ="deleteButton" onClick={() => {this.handleDeleteGoal()}} src= {deleteButton}></img> */}
            <div className = "editform" className="form">
              <ManufacturingGoalDetails
              onEnabled = {this.onEnabled}
              enabled = {this.props.goal.enabled}
              item = {this.props.goal}
              buttonImage = {editButton}
              handleDetailViewSubmit = {this.handleDetailViewSubmit}
              options = {[Constants.details_save, Constants.details_delete, Constants.details_cancel]}
              ></ManufacturingGoalDetails>
            </div>
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