// ItemSearchModifyListQuantity.js
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
import Filter from './Filter'


export default class ItemSearchModifyListQuantity extends React.Component {
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
            qty: "",
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
        if (this.props.item_type === Constants.modify_manu_lines_label && this.state.substr.length > 0) {
            var res = await SubmitRequest.submitGetManufacturingLinesByNameSubstring(this.state.substr);
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
            this.setState({
                substr: value
            });
            return value;
        }
        return this.setState.substr;
    }

    onQuantityChange = (e) => {
        this.setState({
            qty: e.target.value
        });
    }

    async onFilterValueSelection (name, value, e) {
        console.log("this was selected: "+JSON.stringify(name)+"    "+JSON.stringify(value));
        this.setState({value: value});
    }

    determineButtonDisplay(state, option) {
        var satisfiesRegex = /^([0-9]+(?:[\.][0-9]{0,2})?|\.[0-9]{1,2}) (oz.|lb.|ton|g|kg|fl.oz.|pt.|qt.|gal.|mL|L|count)$/.test(this.state.qty);
        console.log(state.value)
        console.log(state.qty)
        console.log(this.props.qty_disable)
        console.log("this is the option: "+ option);
        console.log("item-type   "+JSON.stringify(this.props.item_type));
        console.log("item-qty disable   "+JSON.stringify(this.props.qty_disable));
        console.log("satisfiesREgex: "+JSON.stringify(satisfiesRegex));

        switch (option) {
            case Constants.details_add:
                var answer = (state.value === '' || (!satisfiesRegex && this.props.item_type === Constants.details_modify_ingredient) || (state.qty <= 0 && this.props.qty_disable !== true));
                console.log("anser in add: "+answer);
                return (state.value === '' || (!satisfiesRegex && this.props.item_type === Constants.details_modify_ingredient) || (state.qty <= 0 && this.props.qty_disable !== true))
            case Constants.details_remove:
                var answer2 = (state.value === '' || (!satisfiesRegex && this.props.item_type === Constants.details_modify_ingredient) || (state.qty <= 0 && this.props.qty_disable !== true));                
                console.log("anser in remove: "+answer2);
                return (state.value === '' || (!satisfiesRegex && this.props.item_type === Constants.details_modify_ingredient) || (state.qty <= 0 && this.props.qty_disable !== true))
        }
    }

    render() {
        return (
        <div className='filter-item detailsfilter' style={{width: this.state.width + '%'}}>
            <FormGroup>
                <Label>{this.props.item_type}</Label>
                <Filter
                    handleFilterValueSelection = {(opt, e) => this.onFilterValueSelection(opt.label, opt.value)}
                    type = {this.props.api_route}
                    multi = {false}
                    disabled = {this.props.disabled}
                />
                {this.props.qty_disable !== undefined && this.props.qty_disable ? <div></div> : 
                (<div>
                    <Label>{Constants.details_modify_ingredient_quantities}</Label>
                    <Input 
                        type="text"
                        value={this.state.qty}
                        onChange={(e) => this.onQuantityChange(e)}
                        disabled={this.props.disabled}
                    />
                </div>)
                }
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

ItemSearchModifyListQuantity.propTypes = {
    api_route: PropTypes.string,
    item_type: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.string),
    handleModifyList: PropTypes.func,
    qty_disable: PropTypes.bool,
    disabled: PropTypes.bool
  };