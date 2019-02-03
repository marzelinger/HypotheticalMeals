
import React from 'react';
import PropTypes from 'prop-types';
import ManufacturingGoal from './ManufacturingGoal';
import GoalForm from './ManufacturingGoalForm';

const ManufacturingGoalList = (props) => {
  const goalNodes = props.data.map(goal => (
    <ManufacturingGoal
      user={goal.user}
      key={goal._id}
      id={goal._id}
      name={goal.name}
      skus={goal.skus}
      handleUpdateGoal={props.handleUpdateGoal}
      handleDeleteGoal={props.handleDeleteGoal}
      quantities = {goal.quantities}
    >
      { goal.name}
    </ManufacturingGoal>
  ));
  return (
    <div>
      { goalNodes }
    </div>
  );
};

ManufacturingGoalList.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    user: PropTypes.string,
    id: PropTypes.string,
    name: PropTypes.string,
    skus: PropTypes.array
  })),
  handleDeleteGoal: PropTypes.func,
  handleUpdateGoal: PropTypes.func,
};

ManufacturingGoalList.defaultProps = {
  data: [],
};

export default ManufacturingGoalList;