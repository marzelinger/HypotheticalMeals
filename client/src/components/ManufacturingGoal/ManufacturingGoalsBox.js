import React, { Component } from 'react';
import 'whatwg-fetch';
import ManufacturingGoalList from './ManufacturingGoalList';
import ManufacturingGoalForm from './ManufacturingGoalForm';
import '../../style/ManufacturingGoalsBox.css';
import * as Constants from '../../resources/Constants';
import SubmitRequest from '../../helpers/SubmitRequest';
const jwt_decode = require('jwt-decode');

class ManufacturingGoalsBox extends Component {
  constructor() {
    super();
    this.state = {
      data: [],
      error: null,
      name: '',
      skus: [],
      user: '',
      quantities: []
    };
    if(localStorage != null){
      if(localStorage.getItem("jwtToken")!= null){
        this.state.user = jwt_decode(localStorage.getItem("jwtToken")).id;
      }
    }

    this.pollInterval = null;
    this.submitNewGoal = this.submitNewGoal.bind(this);
    this.onDeleteGoal = this.onDeleteGoal.bind(this);
    this.loadGoalsFromServer = this.loadGoalsFromServer.bind(this);
    this.submitUpdatedGoal = this.submitUpdatedGoal.bind(this);
  }

  onChangeText = (e) => {
    const newState = { ...this.state };
    newState[e.target.name] = e.target.value;
    this.setState(newState);
  }

  onUpdateGoal = async (id) => {
    console.log('updating goal')
    const oldGoal = this.state.data.find(c => c._id === id);
    console.log(oldGoal.quantities)
    if (!oldGoal) return;
    await this.setState({
        name: oldGoal.name,
        skus: oldGoal.skus,
        updateId: id,
        quantities: oldGoal.quantities
    });
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
    e.preventDefault();
    const { name, updateId } = this.state;
    if (!name) return;
    if (updateId) {
      this.submitUpdatedGoal();
    } else {
      this.submitNewGoal();
    }
  }

  async submitNewGoal() {
    const { name, skus, user } = this.state;
    let res = await SubmitRequest.submitCreateItem(Constants.manugoals_page_name, { name, skus, user });
    if (!res.success) {
      this.setState({ error: res.error });
    }
    else {
      this.setState({ name: '', skus: '', error: null });
    }
  }

  async submitUpdatedGoal() {
    const { name, skus, user, updateId, quantities } = this.state;
    let item = { name, skus, user, quantities };
    let res = await SubmitRequest.submitUpdateGoal(user, updateId, item);
    if (!res.success) {
      this.setState({ error: res.error});
    }
    else {
      this.setState({ name: '', skus: '', quantities: '', error: null })
    }
  }

  componentDidMount() {
    this.loadGoalsFromServer();
    if (!this.pollInterval) {
      this.pollInterval = setInterval(this.loadGoalsFromServer, 2000);
    }
  }

  componentWillUnmount() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.pollInterval = null;
  }

  async loadGoalsFromServer() {
    let res = await SubmitRequest.submitGetManuGoalsData(this.state.user);
    if (!res.success) {
      this.setState({ error: res.error });
    }
    else {
      this.setState({ data: res.data})
    }
  }

  render() {
    return (
      <div className = "goalsbox">
              <h1 id = "manufacturing_goals_title">{Constants.MANUFACTURING_TITLE}</h1>
        <div className="goals">
          <ManufacturingGoalList
            data={this.state.data}
            handleDeleteGoal={this.onDeleteGoal}
            handleUpdateGoal={this.onUpdateGoal}
          />
        </div>
        <div className="form">
          <ManufacturingGoalForm
            name={this.state.name}
            user={this.state.user}
            skus={this.state.skus}
            handleChangeText={this.onChangeText}
            handleSubmit={this.submitGoal}
          />
        </div>
        {this.state.error && <p>{this.state.error}</p>}
      </div>
    );
  }
}

export default ManufacturingGoalsBox;