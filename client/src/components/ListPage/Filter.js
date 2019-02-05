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

    showResults = (state) => {
        if (state.focus){
            return (<ListGroup>
                {(this.props.assisted_search_results.map(res => 
                <ListGroupItem
                    key={res.name}
                    tag="button"
                    onMouseDown={(e) => this.props.handleFilterValueSelection(e, res, this.props.id)}
                >{res.name}</ListGroupItem>
            ))}
            </ListGroup>
            )
        }
        else {
            return;
        }
        
    }

    render() {
        return (
        <div className='filter-item' style={{width: this.state.width + '%'}}>
            {/* {this.showResults(this.state)} */}
            <InputGroup id = 'inputGroup'>
                <Input 
                    type="text"
                    value={this.props.value}
                    onChange={(e) => this.props.handleFilterValueChange(e, this.props.id)}
                    onFocus={(e) => this.openPopout(e)}
                    onBlur={this.toggleBlur}
                />
                <InputGroupAddon addonType="append">{this.props.filter_category}</InputGroupAddon>
                <InputGroupAddon addonType="append">
                    <Button color="secondary" onClick={(e) => this.props.handleRemoveFilter(e, this.props.id)}> 
                        {Constants.remove_filter_label}
                    </Button>
                </InputGroupAddon>
            </InputGroup>
            <Popover
                open={this.state.open}
                anchorEl={this.state.anchorEl}
                anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                targetOrigin={{horizontal: 'left', vertical: 'top'}}
            >
                <Menu>
                    {(this.props.assisted_search_results.map(res => 
                        <MenuItem
                            key={res.name}
                            primaryText={res.name}
                            onMouseDown={(e) => {
                                this.closePopout();
                                this.props.handleFilterValueSelection(e, res, this.props.id);
                            }}
                        />
                    ))}
                    <MenuItem
                        key='close'
                        primaryText='Close'
                        onMouseDown={(e) => {this.closePopout()}}
                    />
                </Menu>
            </Popover>
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