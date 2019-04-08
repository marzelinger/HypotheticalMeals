import React from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import addButton from '../../../resources/add.png';
import * as Constants from '../../../resources/Constants';

import AuthRoleValidation from '../../auth/AuthRoleValidation';

class GoalForm extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      modal: false
    };

    this.toggle = this.toggle.bind(this);
  }
  
  toggle() {
    this.setState({
      modal: !this.state.modal
    });
  }

  render(){
    return (
      <div>
        {AuthRoleValidation.checkRole(this.props.user, Constants.business_manager) ?
        <div>
        <img className = "hoverable" id = "button" src={addButton} onClick={this.toggle}></img>
        <Modal isOpen={this.state.modal} toggle={this.toggle} id="popup" className={this.props.className}>
          <ModalHeader toggle={this.toggle}>Create New Manufacturing Goal</ModalHeader>
          <form onSubmit={this.props.handleSubmit}>
          <ModalBody>
            <input
              type="text"
              name="name"
              placeholder="New Goal Name.."
              value={this.props.name}
              onChange={this.props.handleChangeText}
            />
          </ModalBody>
          <ModalFooter>
            <Button id = "submitbutton" type="submit" color="primary" onClick={this.toggle}>Submit</Button>{' '}
          </ModalFooter>
          </form>
        </Modal>
        </div>
        :
        <div/>
        }
      </div>
    )
  }
}

GoalForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  handleChangeText: PropTypes.func.isRequired,
  name: PropTypes.string,
};

GoalForm.defaultProps = {
  name: 'New Goal',
};

export default GoalForm;