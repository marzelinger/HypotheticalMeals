// Comment.js
import React from 'react';
import PropTypes from 'prop-types';
import { UncontrolledCollapse, CardBody, Card } from 'reactstrap';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import deleteButton from'../../../resources/delete.png';
// import ManufacturingLineTables from './ManufacturingLineTables';
import SubmitRequest from '../../../helpers/SubmitRequest';
import ManufacturingLineDetails from './ManufacturingLineDetails';
import editButton from '../../../resources/edit.png';
import * as Constants from '../../../resources/Constants';



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

  onReportClick = (e) => {
    this.props.handleReportSelect(e, this.props.id);
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
            {/* <img className = "hoverable" id ="deleteButton" onClick={() => {this.handleDeleteGoal()}} src= {deleteButton}></img> */}
            <div id = "editform" className="form">
              <ManufacturingLineDetails
              onEnabled = {this.onEnabled}
              // enabled = {this.props.goal.enabled}
              item = {this.props.manu_line}
              buttonImage = {editButton}
              handleDetailViewSubmit = {this.props.handleDetailViewSubmit}
              options = {[Constants.details_save, Constants.details_delete, Constants.details_cancel]}
              validateShortName = {this.props.validateShortName} 

              ></ManufacturingLineDetails>
            {/* <a onClick={() => { props.handleUpdateGoal(props.id); }}>update</a> */}
            <Button id = "manuLineScheduleButton" color="primary" onClick={(e) => this.onReportClick(e)}  > Report</Button>{' '}
            <img id ="deleteButton" onClick={() => {this.props.handleDeleteManuLine(this.props.id); }} src= {deleteButton}></img>
          </div>
          </div>
      </div>
    )
  }

}

ManufacturingLine.propTypes = {
  manu_line: PropTypes.object,
  name: PropTypes.string.isRequired,
  skus: PropTypes.array.isRequired,
  id: PropTypes.string.isRequired,
  handleUpdateManuLine: PropTypes.func.isRequired,
  handleDeleteManuLine: PropTypes.func.isRequired,
  handleReportSelect: PropTypes.func.isRequired,
  manu_lines: PropTypes.array.isRequired,
  handleDetailViewSelect: PropTypes.func
};