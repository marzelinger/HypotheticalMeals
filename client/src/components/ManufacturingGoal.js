// Comment.js
import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import { UncontrolledCollapse, CardBody, Card } from 'reactstrap';
import deleteButton from'../resources/delete.png';
import calculatorButton from'../resources/calculator.png';
import ManuGoalsTables from './ListPage/ManuGoalsTables';

const ManufacturingGoal = props => (
  <div id="singleGoal">
    <div className="textContent">
      <div className="singleGoalContent" id={'goal' + props.id}>
        <h3>{props.name}</h3>
      </div>
      <UncontrolledCollapse toggler={'#goal' + props.id}>
            <Card>
                <CardBody>
                    <ManuGoalsTables query = {`api/manugoals/${props.user}/${props.id}/skus`}></ManuGoalsTables>
                </CardBody>
            </Card>
        </UncontrolledCollapse>
    </div>
      <div className="singleGoalButtons">
        {/* <a onClick={() => { props.handleUpdateGoal(props.id); }}>update</a> */}
        <img id ="deleteButton" onClick={() => { props.handleDeleteGoal(props.id); }} src= {deleteButton}></img>
        <img id = "calculatorButton" src = {calculatorButton}></img>
      </div>

  </div>
);


ManufacturingGoal.propTypes = {
  user: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  skus: PropTypes.array.isRequired,
  id: PropTypes.string.isRequired,
  handleUpdateGoal: PropTypes.func.isRequired,
  handleDeleteGoal: PropTypes.func.isRequired,
};

export default ManufacturingGoal;