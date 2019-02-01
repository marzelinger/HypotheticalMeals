// Filter.js
// Riley
// Individual Filter component for ListPage Component

import React from 'react'
import PropTypes from 'prop-types';
import { 
    Button,
    Input,
    InputGroupAddon,
    InputGroup, 
    ListGroup,
    ListGroupItem} from 'reactstrap';
import * as Constants from '../../resources/Constants';


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
        if (this.state.focus && e.keyCode === 13){
            this.props.handleKeywordSubmit(this.props.id)
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
                    onKeyDown={(e) => this.keyDown(e)}
                />
                <InputGroupAddon addonType="append">{this.props.filter_category}</InputGroupAddon>
                <InputGroupAddon addonType="append">
                    <Button color="secondary" onClick={(e) => this.props.handleRemoveFilter(e, this.props.id)}> 
                        {Constants.remove_filter_label}
                    </Button>
                </InputGroupAddon>
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
    handleKeywordSubmit: PropTypes.func,
    handleRemoveFilter: PropTypes.func
  };