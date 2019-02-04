// ItemSearchModifyList.js
// Riley
// Individual search component to add/delete items to a list

import React from 'react'
import PropTypes from 'prop-types';
import { 
    Button,
    Input,
    Label,
    FormGroup, 
    ListGroup,
    ListGroupItem} from 'reactstrap';
import * as Constants from '../../resources/Constants';
import SubmitRequest from '../../helpers/SubmitRequest'


export default class ItemSearchModifyList extends React.Component {
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
            qty: 0,
            assisted_search_results: []
        };
    }

    async componentDidUpdate (prevProps, prevState) {
        if (prevState.substr !== this.state.substr) {
            await this.updateResults();
        }
    }

    async updateResults() {
        if (this.props.item_type === Constants.details_modify_ingredient && this.state.substr.length > 0) {
            var res = await SubmitRequest.submitGetIngredientsByNameSubstring(this.state.substr);
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
        this.setState({
            substr: e.target.value
        });
    }

    onQuantityChange = (e) => {
        this.setState({
            qty: e.target.value
        });
    }

    async onFilterValueSelection (e, item) {
        await this.setState({
            substr: item.name,
            value: item,
            assisted_search_results: []
        });
    }

    determineButtonDisplay(state, option) {
        switch (option) {
            case Constants.details_add:
                return (state.value === '' || state.qty <= 0)
                break;
            case Constants.details_remove:
                return (state.value === '' || state.qty <= 0)
                break;
        }
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
                    onChange={(e) => this.onFilterValueChange(e)}
                    onFocus={this.toggleFocus}
                    onBlur={this.toggleBlur}
                />
                <Label>{Constants.details_modify_ingredient_quantities}</Label>
                <Input 
                    type="text"
                    value={this.state.qty}
                    onChange={(e) => this.onQuantityChange(e)}
                />
                {this.props.options.map(opt => 
                    <Button 
                        disabled={this.determineButtonDisplay(this.state, opt)}
                        key={opt} 
                        onClick={(e) => this.props.handleModifyList(opt, this.state.value, this.state.qty)}
                    >{opt}</Button>
                )}
            </FormGroup>
        </div>
        );
    }
}

ItemSearchModifyList.propTypes = {
    api_route: PropTypes.string,
    item_type: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.string),
    handleModifyList: PropTypes.func
  };