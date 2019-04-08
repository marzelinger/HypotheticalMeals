
import React from 'react';
import PropTypes from 'prop-types';
import ManufacturingLine from './ManufacturingLine';

const ManufacturingLineList = (props) => {
  const LineNodes = props.data.map(line => (
    <ManufacturingLine
      manu_line = {line}
      key={line._id}
      id={line._id}
      name={line.name}
      handleUpdateManuLine={props.handleUpdateManuLine}
      handleDeleteManuLine={props.handleDeleteManuLine}
      handleReportSelect={props.handleReportSelect}
      handleDetailViewSelect = {props.handleDetailViewSelect}
      handleDetailViewSubmit = {props.handleDetailViewSubmit}
      validateShortName = {props.validateShortName}
      user = {props.user}
    >
      { line.name}
    </ManufacturingLine>
  ));
  return (
    <div>
      { LineNodes }
    </div>
  );
};

ManufacturingLineList.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
  })),
  handleDeleteManuLine: PropTypes.func,
  handleUpdateManuLine: PropTypes.func,
  handleReportSelect: PropTypes.func,
  handleDetailViewSelect: PropTypes.func,
  handleDetailViewSubmit: PropTypes.func
};

ManufacturingLineList.defaultProps = {
  data: [],
};

export default ManufacturingLineList;