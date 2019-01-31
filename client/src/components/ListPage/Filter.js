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
    assisted_search_results: PropTypes.arrayOf(PropTypes.string),
    categories: PropTypes.arrayOf(PropTypes.string),
    handleFilterValueChange: PropTypes.func,
    handleFilterValueSelection: PropTypes.func,
    handleFilterSelection: PropTypes.func
  };