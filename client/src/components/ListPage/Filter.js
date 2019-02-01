// Filter.js
// Riley
// Individual Filter component for ListPage Component

import React from 'react'
import PropTypes from 'prop-types';
import { 
    Input,
    InputGroupAddon,
    InputGroup, 
    ListGroup,
    ListGroupItem} from 'reactstrap';


export default class Filter extends React.Component {
    constructor(props) {
        super(props);

        this.toggleFocus = this.toggleFocus.bind(this);
        this.toggleBlur = this.toggleBlur.bind(this);
        this.state = {
            width: 100,
            focus: false
        };
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
                <InputGroupAddon addonType="append">{this.props.filter_category}</InputGroupAddon>
            </InputGroup>
            {/* {this.renderOptions()} */}
        </div>
        );
    }
}

Filter.propTypes = {
    id: PropTypes.number,
    value: PropTypes.string,
    filter_category: PropTypes.string,
    assisted_search_results: PropTypes.arrayOf(PropTypes.object),
    handleFilterValueChange: PropTypes.func,
    handleFilterValueSelection: PropTypes.func,
    handleKeyDown: PropTypes.func
  };