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
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import * as Constants from '../../resources/Constants';
import Select from 'react-select'


export default class Filter extends React.Component {
    constructor(props) {
        super(props);

        this.toggleFocus = this.toggleFocus.bind(this);
        this.toggleBlur = this.toggleBlur.bind(this);
        this.state = {
            width: 100,
            focus: false,
            open: false,
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

    openPopout(e) {
        if (!this.state.open){
            this.setState({
                open: true,
                anchorEl: e.currentTarget,
            })
        }
    }

    closePopout() {
        this.setState({
            open: false
        })
    }

    render() {
        return (
        <div className='filter-item' style={{width: this.state.width + '%'}}>
            <Select 
                inputValue={this.props.value}
                onChange={(opt, e) => this.props.handleFilterValueSelection(opt.label, opt.value, e, this.props.id)}
                onInputChange={(val, e) => this.props.handleFilterValueChange(val, e, this.props.id)} 
                options={this.props.assisted_search_results.map(res => ({ label: res.name, value: res._id }))}
                noOptionsMessage={() => null}
            />
            <InputGroupAddon addonType="append">{this.props.filter_category}</InputGroupAddon>
            <Button color="secondary" onClick={(e) => this.props.handleRemoveFilter(e, this.props.id)}> 
                {Constants.remove_filter_label}
            </Button>
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
    handleRemoveFilter: PropTypes.func
  };