import React from 'react'
import { 
    Input,
    InputGroup, 
    InputGroupButtonDropdown,
    DropdownToggle, 
    DropdownMenu, 
    DropdownItem } from 'reactstrap';


export default class Filter extends React.Component {
    constructor(props) {
        super(props);

        this.toggleDropDown = this.toggleDropDown.bind(this);
        this.state = {
            width: 30,
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
        <div classname='filter-item' style={{width: this.state.width + '%'}}>
            <InputGroup>
                <Input />
                <InputGroupButtonDropdown addonType="append" isOpen={this.state.dropdownOpen} toggle={this.toggleDropDown}>
                <DropdownToggle caret>
                    Category
                </DropdownToggle>
                <DropdownMenu>
                    <DropdownItem>Keyword</DropdownItem>
                    <DropdownItem>SKU</DropdownItem>
                </DropdownMenu>
                </InputGroupButtonDropdown>
            </InputGroup>
        </div>
        );
    }
}
