
import React from 'react';
import PropTypes from 'prop-types';
import ManufacturingLine from './ManufacturingLine';

const ManufacturingLineList = (props) => {
  const LineNodes = props.data.map(line => (
    <ManufacturingLine
      key={line._id}
      id={line._id}
      name={line.name}
      handleUpdateManuLine={props.handleUpdateManuLine}
      handleDeleteManuLine={props.handleDeleteManuLine}
      handleReportSelect={props.handleReportSelect}
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
  handleReportSelect: PropTypes.func
};

ManufacturingLineList.defaultProps = {
  data: [],
};

export default ManufacturingLineList;