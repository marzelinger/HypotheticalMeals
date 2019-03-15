// Filter.js
// Riley
// Individual Filter component for ListPage Component

import React from 'react'
import PropTypes from 'prop-types';
import { 
    Button,
    InputGroupAddon } from 'reactstrap';
import * as Constants from '../../resources/Constants';
import Select from 'react-select'
import SubmitRequest from './../../helpers/SubmitRequest'


export default class Filter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            width: 100,
            focus: false,
            open: false,
            options: [],
            loaded: false
        };
    }

    handleResponse = (response) => {
        if(response.data == undefined){
            this.setState({options: []})
        }
        else{
            this.setState({options: response.data.map((item) => ({label: item.name, value: item}))});
        }
            
    }

    getLabel(type) {
        switch (type){
            case Constants.ingredients_page_name:
                return 'Ingredients'
            case Constants.skus_page_name:
                return 'SKUs'
            case Constants.prod_line_page_name:
                return 'Product Lines'
            case Constants.manu_line_page_name:
                return 'Manufacturing Lines'
        }
    }

    getNewOptions = (input) => {
        if(input == ""){
            this.setState({options: []})
            return;
        }
        switch (this.props.type) {
                case Constants.ingredients_page_name:
                    SubmitRequest.submitGetIngredientsByNameSubstring(input).then((response) => {
                        this.handleResponse(response)
                    });
                    break;
                case Constants.skus_page_name:
                    SubmitRequest.submitGetSkusByNameSubstring(input).then((response) => {
                        this.handleResponse(response)
                    })
                    break;
                case Constants.prod_line_page_name:
                    SubmitRequest.submitGetProductLinesByNameSubstring(input).then((response) => {
                        this.handleResponse(response)
                    });
                    break;
                case Constants.manu_line_page_name:
                    SubmitRequest.submitGetManufacturingLinesByNameSubstring(input).then((response) => {
                        this.handleResponse(response)
                    });
                    break;
                case Constants.formulas_page_name:
                    SubmitRequest.submitGetFormulasByNameSubstring(input).then((response) => {
                        this.handleResponse(response)
                    });
                    break;
                case Constants.customers_page_name:
                    SubmitRequest.submitGetCustomersByNameSubstring(input).then((response) => {
                        this.handleResponse(response)
                    });
                    break;

            }
    }

    getDetailsPlaceholder = () => {
        return (this.props.place_holder != undefined ? this.props.place_holder.name : `Add ${this.getLabel(this.props.type)}`);
    }

    render() {
        if (this.props.defaultItems !== undefined && this.props.defaultItems[0] === 'loading') {
            return null;
        }
        const customStyles = {
            control: (base, state) => ({
                ...base,
                borderColor: this.props.invalid ? 'red' : '#ddd',
                height: '40px',
                'min-height': '34px',
                width: '250px'
            })
        }
        return (
        <div className='filter-item'>
            <Select
                key = {this.props.type}
                value = {this.props.currItems}
                placeholder = {this.props.multi != undefined ? this.getDetailsPlaceholder() : `Filter by ${this.props.type}`}
                isMulti = {this.props.multi != undefined ? this.props.multi : true}
                onInputChange = { (input) => this.getNewOptions(input)}
                onChange={(opt, e) => this.props.handleFilterValueSelection(opt, e, this.props.type)}
                options={this.state.options}
                noOptionsMessage={() => null}
                theme={(theme) => ({
                    ...theme,
                    colors: {
                    ...theme.colors,
                      primary25: 'rgb(0, 188, 212, .5)',
                      primary: 'rgb(66, 66, 66)',
                    },
                  })}
                isDisabled={this.props.disabled}
                styles={customStyles}
            />
        </div>
        );
    }
}

Filter.propTypes = {
    currItems: PropTypes.arrayOf(PropTypes.object),
    handleFilterValueChange: PropTypes.func,
    handleFilterValueSelection: PropTypes.func,
    handleRemoveFilter: PropTypes.func,
    type: PropTypes.string,
    disabled: PropTypes.bool,
    invalid: PropTypes.bool
  };