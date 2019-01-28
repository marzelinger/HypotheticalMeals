import React from 'react';
import PropTypes from 'prop-types';

const GoalForm = props => (
  <form onSubmit={props.handleSubmit}>
    <input
      type="text"
      name="name"
      placeholder="New Goal Name.."
      value={props.name}
      onChange={props.handleChangeText}
    />
    <button type="submit">Submit</button>
  </form>
);

GoalForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  handleChangeText: PropTypes.func.isRequired,
  name: PropTypes.string,
};

GoalForm.defaultProps = {
  name: 'New Goal',
};

export default GoalForm;