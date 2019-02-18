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
            case 'ingredients':
                return 'Ingredients'
            case 'skus':
                return 'SKUs'
            case 'products':
                return 'Product Lines'
            case 'manu_lines':
                return 'Manufacturing Lines'
        }
    }

    getNewOptions = (input) => {
            if(input == ""){
                this.setState({options: []})
                return;
            }
        switch (this.props.type) {
                case 'ingredients':
                    response  =  SubmitRequest.submitGetIngredientsByNameSubstring(input).then((response) => {
                        this.handleResponse(response)
                    });
                    break;
                case 'skus':
                    var response =  SubmitRequest.submitGetSkusByNameSubstring(input).then((response) => {
                        this.handleResponse(response)
                    })
                    break;
                case 'products':
                    response =  SubmitRequest.submitGetProductLinesByNameSubstring(input).then((response) => {
                        this.handleResponse(response)
                    });
                case 'manu_lines':
                    response =  SubmitRequest.submitGetManufacturingLinesByNameSubstring(input).then((response) => {
                        this.handleResponse(response)
                    });
            }
    }

    getDetailsPlaceholder = () => {
        return (this.props.place_holder != undefined ? this.props.place_holder.name : `Add ${this.getLabel(this.props.type)}`);
    }

    render() {
        return (
        <div className='filter-item'>
            {console.log(this.props.data === undefined ? 'nope' : this.props.data)} {/* rn the defaultValue is not being passed... */}
            <Select
                defaultValue = {this.props.data === undefined ? null : this.props.data}
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
            />
        </div>
        );
    }
}

Filter.propTypes = {
    value: PropTypes.string,
    data: PropTypes.arrayOf(PropTypes.object),
    handleFilterValueChange: PropTypes.func,
    handleFilterValueSelection: PropTypes.func,
    handleRemoveFilter: PropTypes.func,
    type: PropTypes.string
  };