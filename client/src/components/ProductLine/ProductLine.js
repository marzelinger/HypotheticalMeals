// Comment.js
import React from 'react';
import PropTypes from 'prop-types';
import { UncontrolledCollapse, CardBody, Card } from 'reactstrap';
import deleteButton from'../../resources/delete.png';
import ProductLineTables from './ProductLineTables';
import SubmitRequest from '../../helpers/SubmitRequest';
import editButton from '../resources/edit.png';
import * as Constants from '../../resources/Constants';
import ProductLineDetails from './ProductLineDetails';
const currentUserIsAdmin = require("../../components/auth/currentUserIsAdmin");



export default class ProductLine extends React.Component{
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
      this.props.handleUpdateProdLine(this.props.id, this.state.name);
    }
  }

  onProdLineChange = async (newval, sku, action) => {
          console.log('updating here');
          let updated_sku = this.props.skus[sku];
          updated_sku.prod_line = newval.value;
          await SubmitRequest.submitUpdateItem('skus', updated_sku);
  }

  render() {
    return (
      <div id="singleGoal">
        <div className="textContent">
          <div className="singleGoalContent" id={'prodline' + this.props.id}>
          <h3>{this.state.name}</h3>
          {/* <input onKeyPress = {(event) => this.onNameSubmit(event)} type = "text" value = {this.state.name} onChange = {(event) => this.onNameChange(event)}></input> */}
          </div>
          <UncontrolledCollapse toggler={'#prodline' + this.props.id}>
                <Card>
                    <CardBody>
                        <ProductLineTables prod_lines = {this.props.prod_lines} data = {this.props.skus} onProdLineChange = {this.onProdLineChange} ></ProductLineTables>
                    </CardBody>
                </Card>
            </UncontrolledCollapse>
        </div>
          <div className="singleGoalButtons">
          <div className = "editform" className="form">
              <ProductLineDetails
              onEnabled = {this.onEnabled}
              // enabled = {this.props.goal.enabled}
              item = {this.props.manu_line}
              buttonImage = {editButton}
              handleDetailViewSubmit = {this.props.handleDetailViewSubmit}
              options = {[Constants.details_save, Constants.details_delete, Constants.details_cancel]}
              validateShortName = {this.props.validateShortName} 
              ></ProductLineDetails>
            </div>
            {/* <a onClick={() => { props.handleUpdateGoal(props.id); }}>update</a> */}
            {currentUserIsAdmin().isValid ? (<img id ="deleteButton" onClick={() => {this.props.handleDeleteProdLine(this.props.id); }} src= {deleteButton}></img>):(<div/>)}
          </div>
      </div>
    )
  }

}

ProductLine.propTypes = {
  name: PropTypes.string.isRequired,
  skus: PropTypes.array.isRequired,
  id: PropTypes.string.isRequired,
  handleUpdateProdLine: PropTypes.func.isRequired,
  handleDeleteProdLine: PropTypes.func.isRequired,
  prod_lines: PropTypes.array.isRequired
};