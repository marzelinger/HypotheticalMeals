import React from 'react';
import PropTypes from 'prop-types';
import * as Constants from '../../resources/Constants';
import Filter from './Filter';
import TableOptions from './TableOptions'
import TextField from 'material-ui/TextField';
import SearchIcon from 'material-ui/svg-icons/action/search'


export default class TableActions extends React.Component {
  constructor(props) {
    super(props);
    console.log(props)
    this.state = {
      simple: props.simple,
    };
  }

  render() {
    return (
      <div id={this.state.simple ? "simple" : "complex"}>
      <SearchIcon style = {{width: '50px', height: '50px'}}></SearchIcon>
      <TextField
        hintText="Keyword Search"
        onChange = {(e, val) => this.props.onFilterValueChange(e, val, 'keyword')}
      />
      {
        Object.keys(this.props.filters).map( (type) => {
          if(type == 'keyword')return 
          return (
            <Filter data = {this.props[type]} 
                handleFilterValueChange = {this.props.onFilterValueChange}
                handleFilterValueSelection = {this.props.onFilterValueSelection} 
                handleRemoveFilter = {this.props.onRemoveFilter} 
                type = {type}
            ></Filter>

        )})
      }
      </div>
    );
  }
}

TableOptions.propTypes = {
    simple: PropTypes.bool,
    table_options: PropTypes.array,
    onTableOptionSelection: PropTypes.func,
    onFilterValueSelection: PropTypes.func,
    onFilterValueChange: PropTypes.func, 
    onRemoveFilter: PropTypes.func
}
