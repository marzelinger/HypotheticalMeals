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
    DropdownItem,
    ListGroup,
    ListGroupItem} from 'reactstrap';
import Select from 'react-select';


export default class Filter extends React.Component {
    constructor(props) {
        super(props);

        this.toggleDropDown = this.toggleDropDown.bind(this);
        this.toggleFocus = this.toggleFocus.bind(this);
        this.toggleBlur = this.toggleBlur.bind(this);
        this.state = {
            width: 100,
            dropdownOpen: false,
            focus: false
        };
    }
    
    toggleDropDown() {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen
        });
    }

    toggleFocus() {
        if (this){
            this.setState({
                focus: true
            })
        }
    }

    toggleBlur() {
        if (this){
            this.setState({
                focus: false
            })
        }
    }

    keyDown(e) {
        if (this.state.focus){
            this.props.handleKeyDown(e, this.props.id)
        }
    }

    render() {
        return (
        <div className='filter-item' style={{width: this.state.width + '%'}}>
            <ListGroup>
                {(this.props.assisted_search_results.map(res => 
                <ListGroupItem
                    key={res.name}
                    tag="button"
                    onClick={(e) => this.props.handleFilterValueSelection(e, res, this.props.id)}
                >{res.name}</ListGroupItem>
            ))}
            </ListGroup>
            <InputGroup id = 'inputGroup'>
                <Input 
                    type="text"
                    value={this.props.value}
                    onChange={(e) => this.props.handleFilterValueChange(e, this.props.id)}
                    onFocus={this.toggleFocus}
                    onBlur={this.toggleBlur}
                    onKeyDown={(e) => this.keyDown(e, this.props.id)}
                />
                <InputGroupButtonDropdown addonType="append" isOpen={this.state.dropdownOpen} toggle={this.toggleDropDown}>
                    <DropdownToggle caret>
                        {this.props.selection}
                    </DropdownToggle>
                    <DropdownMenu>
                        {this.props.categories.map(cat => 
                            <DropdownItem 
                                key={cat}
                                onClick={e => this.props.handleFilterSelection(e, cat, this.props.id)}
                            >{cat}</DropdownItem>
                        )}
                    </DropdownMenu>
                </InputGroupButtonDropdown>
            </InputGroup>
            {/* {this.renderOptions()} */}
        </div>
        );
    }
}

Filter.propTypes = {
    id: PropTypes.number,
    value: PropTypes.string,
    selection: PropTypes.string,
    assisted_search_results: PropTypes.arrayOf(PropTypes.object),
    categories: PropTypes.arrayOf(PropTypes.string),
    handleFilterValueChange: PropTypes.func,
    handleFilterValueSelection: PropTypes.func,
    handleFilterSelection: PropTypes.func,
    handleKeyDown: PropTypes.func
  };