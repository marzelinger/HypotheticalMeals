// Comment.js
import React from 'react';
import PropTypes from 'prop-types';
import { UncontrolledCollapse, CardBody, Card } from 'reactstrap';
import deleteButton from'../../resources/delete.png';
import ProductLineTables from './ProductLineTables';
import SubmitRequest from '../../helpers/SubmitRequest';
import editButton from '../../resources/edit.png';
import * as Constants from '../../resources/Constants';
import ProductLineDetails from './ProductLineDetails';
import AuthRoleValidation from '../auth/AuthRoleValidation';




export default class ProductLine extends React.Component{
  constructor(props){
    super(props);
  }

  onProdLineChange = async (newval, sku, action) => {
          console.log('updating here');
          let updated_sku = this.props.skus[sku];
          updated_sku.prod_line = newval.value;
          await SubmitRequest.submitUpdateItem('skus', updated_sku);
  }

  handleDetailViewSubmit = async(event, item, option)=> {
    console.log('here')
      return await this.props.handleDetailViewSubmit(event, item, option);
  }

  render() {
    return (
      <div id="singleGoal">
        <div className="textContent">
          <div className="singleGoalContent" id={'prodline' + this.props.id}>
          <h3>{this.props.name}</h3>
          {/* <input onKeyPress = {(event) => this.onNameSubmit(event)} type = "text" value = {this.state.name} onChange = {(event) => this.onNameChange(event)}></input> */}
          </div>
          <UncontrolledCollapse toggler={'#prodline' + this.props.id}>
                <Card>
                    <CardBody>
                        <ProductLineTables prod_lines = {this.props.prod_lines} data = {this.props.skus} onProdLineChange = {this.onProdLineChange} user = {this.props.user}></ProductLineTables>
                    </CardBody>
                </Card>
            </UncontrolledCollapse>
        </div>
        <div className="singleGoalButtons">
          <div className = "editform" className="form">
                <ProductLineDetails
                item = {this.props.line}
                buttonImage = {editButton}
                handleDetailViewSubmit = {this.handleDetailViewSubmit}
                options = {AuthRoleValidation.checkRole(this.props.user, Constants.product_manager) ? [Constants.details_save, Constants.details_delete, Constants.details_cancel] : [Constants.details_cancel]}
                user = {this.props.user}
                ></ProductLineDetails>
          </div>
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
  handleDetailViewSubmit: PropTypes.func.isRequired,
  prod_lines: PropTypes.array.isRequired,
  line: PropTypes.object
};