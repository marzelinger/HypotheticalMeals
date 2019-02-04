// Comment.js
import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import { UncontrolledCollapse, CardBody, Card } from 'reactstrap';
import deleteButton from'../resources/delete.png';
import ProductLineSkuTable from './ProductLineSkuTable';

const ProductLine = props => (
  <div id="singleProductLine">
    <div className="textContent">
      <div className="singleProductLineContent" id={'productLine' + props.id}>
        <h3>{props.name}</h3>
      </div>
      <UncontrolledCollapse toggler={'#productLine' + props.id}>
            <Card>
                <CardBody>
                    <ProductLineSkuTable id={props.id}></ProductLineSkuTable>
                </CardBody>
            </Card>
        </UncontrolledCollapse>
    </div>
      <div className="singleProductLineButtons">
        {/* <a onClick={() => { props.handleUpdateGoal(props.id); }}>update</a> */}
        <img id ="deleteButton" onClick={() => { props.handleDeleteProductLine(props.id); }} src= {deleteButton}></img>
      </div>

  </div>
);


ProductLine.propTypes = {
  name: PropTypes.string.isRequired,
  skus: PropTypes.array.isRequired,
  id: PropTypes.string.isRequired,
  handleUpdateProductLine: PropTypes.func.isRequired,
  handleDeleteProductLine: PropTypes.func.isRequired,
};

export default ProductLine;