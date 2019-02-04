// ItemSearchInput.js
// Riley
// Individual search component to add to field

import React from 'react'
import PropTypes from 'prop-types';
import { 
    Input,
    Label,
    FormGroup, 
    ListGroup,
    ListGroupItem} from 'reactstrap';
import * as Constants from '../../resources/Constants';
import SubmitRequest from './../../helpers/SubmitRequest'
import { prototype } from 'stream';


export default class ItemSearchInput extends React.Component {
    constructor(props) {
        super(props);

        this.toggleFocus = this.toggleFocus.bind(this);
        this.toggleBlur = this.toggleBlur.bind(this);
        this.onFilterValueChange = this.onFilterValueChange.bind(this);
        this.state = {
            width: 100,
            focus: false,
            substr: '',
            value: '',
            assisted_search_results: []
        };
    }

    async componentDidUpdate (prevProps, prevState) {
        if (prevState.substr !== this.state.substr) {
            await this.updateResults();
        }
        if (this.props.curr_item.name !== undefined && this.state.substr != this.props.curr_item.name) {
            this.setState({
                substr: this.props.curr_item.name,
                value: this.props.curr_item._id,
                assisted_search_results: []
            })
        }
    }

    async updateResults() {
        if (this.props.item_type === Constants.ingredient_label && this.state.substr.length > 0) {
            var res = await SubmitRequest.submitGetIngredientsByNameSubstring(this.state.substr);
        }
        else if (this.props.item_type === Constants.prod_line_label && this.state.substr.length > 0) {
            var res = await SubmitRequest.submitGetProductLinesByNameSubstring(this.state.substr);
        }
        else {
            var res = {};
            res.data = []
        }
        if (res === undefined || !res.success) res.data = [];
        this.setState({ assisted_search_results: res.data });
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

    onFilterValueChange = (e) => {
        var new_item = this.props.curr_item
        if (new_item !== e.target.value){
            new_item = {};
        }
        this.props.handleSelectItem(new_item);
        this.setState({
            substr: e.target.value
        });
    }

    onFilterValueSelection (e, item) {
        this.setState({
            substr: item.name,
            value: item._id,
            assisted_search_results: []
        });
        this.props.handleSelectItem(item);
    }

    showResults = (state) => {
        if (state.focus){
            return (<ListGroup>
                {this.state.assisted_search_results.map(res => 
                <ListGroupItem
                    key={res.name}
                    tag="button"
                    onMouseDown={(e) => this.onFilterValueSelection(e, res)}
                >{res.name}</ListGroupItem>
            )}
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
            {this.showResults(this.state)}
            <FormGroup>
                <Label>{this.props.item_type}</Label>
                <Input 
                    type="text"
                    value={this.state.substr}
                    invalid={this.props.invalid_inputs.includes('prod_line')}
                    onChange={(e) => this.onFilterValueChange(e)}
                    onFocus={this.toggleFocus}
                    onBlur={this.toggleBlur}
                />
            </FormGroup>
        </div>
        );
    }
}

ItemSearchInput.propTypes = {
    curr_item: PropTypes.object,
    item_type: PropTypes.string,
    invalid_inputs: PropTypes.arrayOf(PropTypes.string),
    handleSelectItem: PropTypes.func
  };