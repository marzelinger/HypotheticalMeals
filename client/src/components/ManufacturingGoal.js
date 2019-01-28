// Comment.js
import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';

const ManufacturingGoal = props => (
  <div className="singleComment">
    <img alt="user_image" className="userImage" src={`https://picsum.photos/70?random=${props.id}`} />
    <div className="textContent">
      <div className="singleCommentContent">
        <h3>{props.user}</h3>
        <h3>{props.name}</h3>
      </div>
      <div className="singleCommentButtons">
        <a onClick={() => { props.handleUpdateGoal(props.id); }}>update</a>
        <a onClick={() => { props.handleDeleteGoal(props.id); }}>delete</a>
      </div>
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