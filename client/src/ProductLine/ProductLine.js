// Comment.js
import React from 'react';
import PropTypes from 'prop-types';
import { UncontrolledCollapse, CardBody, Card } from 'reactstrap';
import deleteButton from'./../resources/delete.png';
import ProductLineTables from './ProductLineTables';
import SubmitRequest from './../helpers/SubmitRequest';

export default class ProductLine extends React.Component{
  constructor(props){
    super(props);
  }

  onProdLineChange = async (newval, sku, action) => {
          let updated_sku = this.props.skus[sku];
          updated_sku.prod_line = newval.value;
          await SubmitRequest.submitUpdateItem('skus', updated_sku);
  }

  render() {
    return (
      <div id="singleGoal">
        <div className="textContent">
          <div className="singleGoalContent" id={'prodline' + this.props.id}>
            <h3>{this.props.name}</h3>
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
            {/* <a onClick={() => { props.handleUpdateGoal(props.id); }}>update</a> */}
            <img id ="deleteButton" onClick={() => {this.props.handleDeleteProdLine(this.props.id); }} src= {deleteButton}></img>
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