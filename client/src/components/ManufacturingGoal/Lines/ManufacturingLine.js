// Comment.js
import React from 'react';
import PropTypes from 'prop-types';
import { UncontrolledCollapse, CardBody, Card } from 'reactstrap';
import deleteButton from'../../../resources/delete.png';
// import ManufacturingLineTables from './ManufacturingLineTables';
import SubmitRequest from '../../../helpers/SubmitRequest';

export default class ManufacturingLine extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      name: this.props.name
    }
  }

  onNameChange = (event) => {
    this.setState({name: event.target.value})
  }

  onNameSubmit = (event) => {
    console.log(event.charCode)
    if(event.charCode == 13){
      this.props.handleUpdateManuLine(this.props.id, this.state.name);
    }
  }

  onManuLineChange = async (newval, sku, action) => {
          console.log('updating here');
          let updated_sku = this.props.skus[sku];
          updated_sku.manu_line = newval.value;
          await SubmitRequest.submitUpdateItem('skus', updated_sku);
  }

  render() {
    return (
      <div id="singleGoal">
        <div className="textContent">
          <div className="singleGoalContent" id={'manuline' + this.props.id}>
          <input onKeyPress = {(event) => this.onNameSubmit(event)} type = "text" value = {this.state.name} onChange = {(event) => this.onNameChange(event)}></input>
          </div>
        </div>
          <div className="singleGoalButtons">
            {/* <a onClick={() => { props.handleUpdateGoal(props.id); }}>update</a> */}
            <img id ="deleteButton" onClick={() => {this.props.handleDeleteManuLine(this.props.id); }} src= {deleteButton}></img>
          </div>
      </div>
    )
  }

}

ManufacturingLine.propTypes = {
  name: PropTypes.string.isRequired,
  skus: PropTypes.array.isRequired,
  id: PropTypes.string.isRequired,
  handleUpdateManuLine: PropTypes.func.isRequired,
  handleDeleteManuLine: PropTypes.func.isRequired,
  manu_lines: PropTypes.array.isRequired
};