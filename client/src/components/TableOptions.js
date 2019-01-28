// TableOptions.js
// Riley
// Dropdown options bar for ListPage component

import React from 'react'
import PropTypes from 'prop-types';
import * as Constants from './../resources/Constants';
import { 
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle } from 'reactstrap';


export default class TableOptions extends React.Component {
    constructor(props) {
        super(props);

        this.toggleDropDown = this.toggleDropDown.bind(this);
        this.state = {
            dropdownOpen: false
        };
    }

    toggleDropDown() {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen
        });
    }
    
    render() {
        return (
        <div className="table-options"> 
            <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggleDropDown}>
                <DropdownToggle caret>
                    {Constants.options}
                </DropdownToggle>
                <DropdownMenu right>
                    {this.props.table_options.map(opt => 
                        <DropdownItem 
                            key={opt}
                            onClick={e => this.props.handleTableOptionSelection(e, opt)}
                        >{opt}</DropdownItem>
                    )}
                </DropdownMenu>
            </Dropdown>
        </div>
        );
    }
}

TableOptions.propTypes = {
    table_options: PropTypes.arrayOf(PropTypes.string),
    handleTableOptionSelection: PropTypes.func
  };