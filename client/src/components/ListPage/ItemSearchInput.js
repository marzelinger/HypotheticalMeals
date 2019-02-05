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
import Select from 'react-select'


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

    onFilterValueChange = (value, e) => {
        if (e.action === 'input-change'){
            var new_item = this.props.curr_item
            if (new_item !== value){
                new_item = {};
            }
            this.props.handleSelectItem(new_item);
            this.setState({
                substr: value
            });
            return value
        }
        return this.state.substr;
    }

    onFilterValueSelection (name, value, e) {
        this.setState({
            substr: name,
            value: value,
            assisted_search_results: []
        });
        this.props.handleSelectItem({name: name, _id: value});
    }

    render() {
        const customStyles = {
            control: (base, state) => ({
                ...base,
                borderColor: this.props.invalid_inputs.includes('prod_line') ? 'red' : '#ddd'
            })
        }

        return (
        <div className='filter-item' style={{width: this.state.width + '%'}}>
            <FormGroup>
                <Label>{this.props.item_type}</Label>
                <Select 
                    inputValue={this.state.substr}
                    onChange={(opt, e) => this.onFilterValueSelection(opt.label, opt.value, e)}
                    onInputChange={(val, e) => this.onFilterValueChange(val, e)} 
                    options={this.state.assisted_search_results.map(res => ({ label: res.name, value: res._id }))}
                    styles={customStyles}
                    placeholder={'Select Product Line...'}
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