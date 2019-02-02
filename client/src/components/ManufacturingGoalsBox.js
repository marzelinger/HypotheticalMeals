import React, { Component } from 'react';
import 'whatwg-fetch';
import ManufacturingGoalList from './ManufacturingGoalList';
import ManufacturingGoalForm from './ManufacturingGoalForm';
import '../style/ManufacturingGoalsBox.css';
import * as Constants from '../resources/Constants';
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

  onDeleteGoal= (id) => {
    const i = this.state.data.findIndex(c => c._id === id);
    const data = [
      ...this.state.data.slice(0, i),
      ...this.state.data.slice(i + 1),
    ];
    this.setState({ data });
    fetch(`api/manugoals/${id}`, { method: 'DELETE' })
      .then(res => res.json()).then((res) => {
        if (!res.success) this.setState({ error: res.error });
      });
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

  submitNewGoal = () => {
    const { name, skus, user } = this.state;
    fetch('/api/manugoals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, skus, user }),
    }).then(res => res.json()).then((res) => {
      if (!res.success) this.setState({ error: res.error.message || res.error });
      else this.setState({ name: '', skus: '', error: null });
    });
  }

  submitUpdatedGoal = () => {
    const { name, skus, user, updateId, quantities} = this.state;
    fetch(`/api/manugoals/${this.state.user}/${updateId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, skus, user, quantities }),
    }).then(res => res.json()).then((res) => {
      if (!res.success) this.setState({ error: res.error.message || res.error });
      else this.setState({ name: '', skus: '', quantities: '', error:null });
    });
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

  loadGoalsFromServer = () => {
    // fetch returns a promise. If you are not familiar with promises, see
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
    fetch(`/api/manugoals/${this.state.user}`)
      .then(data => data.json())
      .then((res) => {
        if (!res.success) this.setState({ error: res.error });
        else this.setState({ data: res.data });
      });
  }

  render() {
    return (
      <div className="container">
        <div className="goals">
          <h2>Current Goals:</h2>
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