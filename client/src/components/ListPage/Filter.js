// Filter.js
// Riley
// Individual Filter component for ListPage Component

import React from 'react'
import PropTypes from 'prop-types';
import * as Constants from '../../resources/Constants';
import { 
    Input,
    InputGroup, 
    InputGroupButtonDropdown,
    DropdownToggle, 
    DropdownMenu, 
    DropdownItem } from 'reactstrap';
import Select from 'react-select';


export default class Filter extends React.Component {
    constructor(props) {
        super(props);

        this.toggleDropDown = this.toggleDropDown.bind(this);
        this.state = {
            width: 100,
            dropdownOpen: false
        };
    }
    
    toggleDropDown() {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen
        });
    }

    onValueChange = (event) => {
        this.props.handleFilterValueChange(event);
    }
    
    render() {
        return (
        <div className='filter-item' style={{width: this.state.width + '%'}}>
            <InputGroup id = 'inputGroup'>
                {/* <Select
                    value={this.props.value}
                    onChange={this.onValueChange}
                    options={options}
                /> */}
                <InputGroupButtonDropdown addonType="append" isOpen={this.state.dropdownOpen} toggle={this.toggleDropDown}>
                    <DropdownToggle caret>
                        {this.props.selection}
                    </DropdownToggle>
                    <DropdownMenu>
                        {this.props.categories.map(cat => 
                            <DropdownItem 
                                key={cat}
                                onClick={e => this.props.handleFilterSelection(e, cat)}
                            >{cat}</DropdownItem>
                        )}
                    </DropdownMenu>
                </InputGroupButtonDropdown>
            </InputGroup>
        </div>
        );
    }
}

Filter.propTypes = {
    value: PropTypes.string,
    selection: PropTypes.string,
    categories: PropTypes.arrayOf(PropTypes.string),
    handleFilterValueChange: PropTypes.func,
    handleFilterSelection: PropTypes.func
  };