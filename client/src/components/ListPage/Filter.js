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

    renderOptions() {
        if (this.props){
            console.log(this.props.assisted_search_results);
            return (this.props.assisted_search_results.map(res => 
                <ul>
                    {res}
                </ul>
            ));
        }
        return {};
    }

    render() {
        return (
        <div className='filter-item' style={{width: this.state.width + '%'}}>
            <InputGroup id = 'inputGroup'>
                <Input 
                    type="text"
                    value={this.props.value}
                    onChange={this.props.handleFilterValueChange}>
                </Input>
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
            {this.renderOptions}
        </div>
        );
    }
}

const options = [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'vanilla', label: 'Vanilla' }
  ];

Filter.propTypes = {
    value: PropTypes.string,
    selection: PropTypes.string,
    assisted_search_results: PropTypes.arrayOf(PropTypes.string),
    categories: PropTypes.arrayOf(PropTypes.string),
    handleFilterValueChange: PropTypes.func,
    handleFilterSelection: PropTypes.func
  };