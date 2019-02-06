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


export default class Filter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            width: 100,
            focus: false,
            open: false
        };
    }

    render() {
        // var style = {
        //     height: '10px !important',
        //     width: '80%',
        //     marginTop: '10px',
        //     marginBottom: '10px'
        // }
        return (
        <div className='filter-item'>
            <Select
                placeholder = {`Filter by ${this.props.type}`}
                isMulti
                onChange={(opt, e) => this.props.handleFilterValueSelection(opt, e, this.props.type)}
                options={this.props.data.map((item) => ({label: item.name, value: item._id}))}
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
            {/* <InputGroupAddon addonType="append">{this.props.type}</InputGroupAddon> */}
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