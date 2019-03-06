import React from 'react';
import PropTypes from 'prop-types';
import * as Constants from '../../resources/Constants';
import Filter from './Filter';
import TableOptions from './TableOptions'
import TextField from 'material-ui/TextField';
import SearchIcon from 'material-ui/svg-icons/action/search'
import AddIcon from 'material-ui/svg-icons/content/add-circle'
const currentUserIsAdmin = require("../auth/currentUserIsAdmin");


export default class TableActions extends React.Component {
  constructor(props) {
    super(props);
    console.log(props)
    this.state = {
      simple: props.simple,
      page_name: this.props.page_name
    };
    console.log("this is the tableactions props: "+JSON.stringify(this.props));
  }

  render() {
    var iconsize = {
      width: 10,
      height: 10,
    }
  
    return (
      <div id={this.state.simple ? "simple" : "complex"}>
      {(this.state.page_name != Constants.users_page_name)? 
      (<div>
      <SearchIcon style = {{width: '20px', height: '20px'}}></SearchIcon>
      
      <TextField
        hintText="Keyword Search"
        onChange = {(e, val) => this.props.onFilterValueChange(e, val, 'keyword')}
      />
      </div>)
      : (<div/>)
      }
      {
        Object.keys(this.props.filters).map( (type) => {
          if(type == 'keyword' || type == 'formula')return 
          return (
            <Filter 
                handleFilterValueChange = {this.props.onFilterValueChange}
                handleFilterValueSelection = {this.props.onFilterValueSelection} 
                handleRemoveFilter = {this.props.onRemoveFilter} 
                type = {type}
            ></Filter>

        )})
      }
      {(currentUserIsAdmin().isValid && (this.state.page_name != Constants.users_page_name) && !this.props.reportSelect)? 
      (<AddIcon style = {{width: '50px', height: '50px', cursor: 'pointer'}} onClick = {() => {this.props.onTableOptionSelection(null, Constants.create_item)}}></AddIcon>)
      :(<div/>)}
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

