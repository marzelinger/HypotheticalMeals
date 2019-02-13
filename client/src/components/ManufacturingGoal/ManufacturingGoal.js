// Comment.js
import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import { UncontrolledCollapse, CardBody, Card } from 'reactstrap';
import deleteButton from'./../../resources/delete.png';
import ManufacturingGoalCalculator from'./ManufacturingGoalCalculator';
import ManuGoalsTables from './../ListPage/ManuGoalsTables';
export default class ManufacturingGoal extends React.Component{
  constructor(props){
    super(props);
  }

  onQuantityChange = (event, sku_index) => {
      this.props.quantities[sku_index] = Number(event.target.value);
      this.props.handleUpdateGoal(this.props.id);
  }

  render() {
    return (
      <div id="singleGoal">
        <div className="textContent">
          <div className="singleGoalContent hoverable" id={'goal' + this.props.id}>
            <h3>{this.props.name}</h3>
          </div>
          <UncontrolledCollapse toggler={'#goal' + this.props.id}>
                <Card>
                    <CardBody>
                        <ManuGoalsTables onQuantityChange = {this.onQuantityChange} query = {`api/manugoals/${this.props.user}/${this.props.id}/skus`}></ManuGoalsTables>
                    </CardBody>
                </Card>
            </UncontrolledCollapse>
        </div>
          <div className="singleGoalButtons">
            {/* <a onClick={() => { props.handleUpdateGoal(props.id); }}>update</a> */}
            <img className = "hoverable" id ="deleteButton" onClick={() => {this.props.handleDeleteGoal(this.props.id); }} src= {deleteButton}></img>
            <ManufacturingGoalCalculator name = {this.props.name} skus = {this.props.skus} quantities = {this.props.quantities}></ManufacturingGoalCalculator>
          </div>
      </div>
    )
  }

}

ManufacturingGoal.propTypes = {
  user: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  skus: PropTypes.array.isRequired,
  quantities: PropTypes.array.isRequired,
  id: PropTypes.string.isRequired,
  handleUpdateGoal: PropTypes.func.isRequired,
  handleDeleteGoal: PropTypes.func.isRequired,
};