import React from 'react';
import PropTypes from 'prop-types';
import * as Constants from '../../resources/Constants';
import '../../style/GeneralNavBarStyle.css';
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
      <div className="options-container" id={this.state.simple ? "simple" : "complex"}>
      <SearchIcon></SearchIcon>
      <TextField
        hintText="Keyword Search"
        onChange = {(e, val) => this.props.onFilterValueChange(val, 'keyword')}
      />

      {/* {this.props.filter_substr.map((is,index) => {
              if (this.props.filter_category[index] != Constants.filter_removed){
                  return (<Filter 
                              key={'filter'+index}
                              id={index}
                              value={is}
                              filter_category={this.props.filter_category[index]} 
                              assisted_search_results={this.props.assisted_search_results[index]}
                              handleFilterValueChange={this.props.onFilterValueChange}
                              handleFilterValueSelection={this.props.onFilterValueSelection}
                              handleRemoveFilter={this.props.onRemoveFilter}
                          />)
              }
          })}
              <TableOptions
              table_options={this.props.table_options}
              handleTableOptionSelection={this.props.onTableOptionSelection}
              /> */}
      </div>
    );
  }
}

TableOptions.propTypes = {
    simple: PropTypes.bool,
    filter_category: PropTypes.array,
    assisted_search_results: PropTypes.array,
    filter_substr: PropTypes.array,
    table_options: PropTypes.array,
    onTableOptionSelection: PropTypes.func,
    onFilterValueSelection: PropTypes.func,
    onFilterValueChange: PropTypes.func, 
    onRemoveFilter: PropTypes.func
}

