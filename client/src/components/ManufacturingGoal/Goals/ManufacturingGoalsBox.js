import React, { Component } from 'react';
import 'whatwg-fetch';
import ManufacturingGoalList from './ManufacturingGoalList';
import ManufacturingGoalForm from './ManufacturingGoalForm';
import '../../../style/ManufacturingGoalsBox.css';
import * as Constants from '../../../resources/Constants';
import SubmitRequest from '../../../helpers/SubmitRequest';
import ManufacturingGoalDetails from './ManufacturingGoalDetails';
import ItemStore from '../../../helpers/ItemStore';
import TextField from 'material-ui/TextField';
import SearchIcon from 'material-ui/svg-icons/action/search'
import currentUserIsAdmin from '../../auth/currentUserIsAdmin'
const jwt_decode = require('jwt-decode');

class ManufacturingGoalsBox extends Component {
  constructor() {
    super();
    this.state = {
      page_name: 'manugoals',
      data: [],
      activities: [],
      error: null,
      name: '',
      user: '',
      enabled: false,
      date: '',
      isAdmin: currentUserIsAdmin(),
      filters: {
        'username':'_',
        'name':'_'
      }
    };
    if(localStorage != null){
      if(localStorage.getItem("jwtToken")!= null){
        this.state.user = jwt_decode(localStorage.getItem("jwtToken")).username;
        console.log(jwt_decode(localStorage.getItem("jwtToken")).username);
      }
    }

    this.pollInterval = null;
    this.submitNewGoal = this.submitNewGoal.bind(this);
    this.onDeleteGoal = this.onDeleteGoal.bind(this);
    this.loadGoalsFromServer = this.loadGoalsFromServer.bind(this);
    this.submitUpdatedGoal = this.submitUpdatedGoal.bind(this);
    this.onDetailViewSubmit = this.onDetailViewSubmit.bind(this);
  }

  onChangeText = (e) => {
    const newState = { ...this.state };
    newState[e.target.name] = e.target.value;
    this.setState(newState);
  }

  onUpdateGoal = async (id,new_name) => {
    console.log('updating goal')
    console.log(new_name);
    const oldGoal = this.state.data.find(c => c._id === id);
    if (!oldGoal) return;
    await this.setState({
        name: new_name || oldGoal.name,
        activities: oldGoal.activities,
        updateId: id,
        enabled: oldGoal.enabled,
        deadline: oldGoal.deadline
    });
    console.log(this.state.name);
    this.submitUpdatedGoal();
  }

  async onDeleteGoal(id) {
    const i = this.state.data.findIndex(c => c._id === id);
    let item = this.state.data[i];
    const data = [
      ...this.state.data.slice(0, i),
      ...this.state.data.slice(i + 1),
    ];
    this.setState({ data });

    let res = await SubmitRequest.submitDeleteItem(Constants.manugoals_page_name, item);
    if (!res.success) {
      this.setState({ error: res.error });
    }
  }

  submitGoal = (e) => {
    console.log('in submit goal')
    e.preventDefault();
    const { name, updateId } = this.state;
    if (!name) return;
    if (updateId) {
      this.submitUpdatedGoal();
    } else {
      this.submitNewGoal();
    }
  }

  submitNewActivity = async(activities) => {
    console.log('submit new activity');
    console.log('submit')
    let created_activities = [];
    for(const activity of activities) {
      try{
        let new_activity = await SubmitRequest.submitCreateItem('manuactivities', activity);
        created_activities.push(new_activity.data)
      } catch (e){
        console.log(e);
      }
    }
    console.log('all done')
    return created_activities;
  }

  async submitNewGoal() {
    console.log('submitting new goal')
    const { name, activities, user, deadline } = this.state;
    console.log(deadline);
    console.log(activities);
    let created_activities = await this.submitNewActivity(activities);
    let res = await SubmitRequest.submitCreateItem(Constants.manugoals_page_name, { name, activities: created_activities, user, deadline });
    if (!res.success) {
      console.log('not a success')
      this.setState({ error: res.error });
    }
    else {
      this.setState({ name: '', activities: [], error: null });
    }
  }



  async submitUpdatedGoal() {
    const { name, activities, user, updateId, enabled, deadline} = this.state;
    let item = { name, activities, user, enabled, deadline };
    let res = await SubmitRequest.submitUpdateGoal(user, updateId, item);
    if (!res.success) {
      console.log(res.error);
      this.setState({ error: res.error});
    }
    else {
      this.setState({ name: '', activities: '', enabled: false, error: null })
      this.loadGoalsFromServer();
    }
  }

  componentDidMount() {
    this.loadGoalsFromServer();
    if (!this.pollInterval) {
      this.pollInterval = setInterval(this.loadGoalsFromServer, 1000);
    }
  }

  componentWillUnmount() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.pollInterval = null;
  }

  async loadGoalsFromServer() {
    // let res = await SubmitRequest.submitGetManuGoalsData(this.state.user);
    // pass in the actual user if the current user is NOT an admin.
    var res = await SubmitRequest.submitGetManuGoalsByFilter(this.state.filters.name,this.state.filters.username, this.state.isAdmin ? '_' : this.state.user);
    if (!res.success) {
      this.setState({ error: res.error });
    }
    else {
      this.setState({ data: res.data})
    }
  }

  async onDetailViewSubmit(event, item, option) {
    var newData = this.state.data;
    console.log(item)
    console.log(item);
    switch (option) {
        case Constants.details_create:
            let activities = [];
            newData.push({name: item.name, activities: activities});
            item.skus.forEach((sku, index) => {
              activities.push({sku: sku, quantity: item.quantities[index]});
            })
            await this.setState({
              name: item.name,
              activities,
              deadline: item.deadline
            })
            console.log(this.state.deadline);
            this.submitNewGoal();
            break;
        case Constants.details_cancel:
            break;
    }
      this.setState({ 
          data: newData,
      });
      this.loadGoalsFromServer();
      return true;
  }

  onFilterValueChange = (e, value, filterType) => {
    var filters = this.state.filters;
    filters[filterType] = value;
    this.setState({filters: filters, filterChange: true}) ;
}

  render() {
    return (
      <div className = "goalsbox">
      <h1 id = "manufacturing_goals_title">{Constants.MANUFACTURING_TITLE}</h1>
      <div className = "searches">
      {this.state.isAdmin ? 
      (<div className = "searchfield">
      <SearchIcon style = {{width: '20px', height: '20px'}}></SearchIcon>
      <TextField
        hintText="Username Search"
        onChange = {(e, val) => this.onFilterValueChange(e, val, 'username')}
      />
      </div>) : <div></div>
      }
      <div className = "searchfield">
      <SearchIcon style = {{width: '20px', height: '20px'}}></SearchIcon>
      <TextField
        hintText="Goal Name Search"
        onChange = {(e, val) => this.onFilterValueChange(e, val, 'name')}
      />
      </div>
      </div>
        <div className="goals">
          <ManufacturingGoalList
            data={this.state.data}
            handleDeleteGoal={this.onDeleteGoal}
            handleUpdateGoal={this.onUpdateGoal}
          />
        </div>
        <div className="form">
          <ManufacturingGoalDetails
          handleDetailViewSubmit = {this.onDetailViewSubmit}
          ></ManufacturingGoalDetails>
        </div>
        {this.state.error && <p>{this.state.error}</p>}
      </div>
    );
  }
}

export default ManufacturingGoalsBox;