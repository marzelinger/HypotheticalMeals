// IngredientsViewSimple.js
// Riley
// Ingredients view for SKU details page

import React from 'react';
import PropTypes from 'prop-types';
import PageTable from './PageTable'
import SubmitRequest from '../../helpers/SubmitRequest'
import * as Constants from '../../resources/Constants';
import './../../style/ListPage.css';
import DataStore from './../../helpers/DataStore'


export default class IngredientsViewSimple extends React.Component {
    constructor(props) {
        super(props);

        let {
            table_columns, 
            table_properties } = DataStore.getIngredientDataSimple();
  

        this.state = {
            data: [],
            table_columns,
            table_properties,
            selected_items: []
        };
    }

    async componentDidMount() {
        this.loadDataFromServer();
    }

    async componentDidUpdate (prevProps, prevState) {
        if (prevState.data !== this.state.data){
        }
    }

    async loadDataFromServer() {
        this.setState({
            data: this.props.sku.ingredients
        })
    }

    onSort = () => {}

    onSelect = () => {}

    onDetailViewSelect = () => {}

    onPropChange = (value, item, prop) => {
        var newData = this.state.data.slice();
        var ind = newData.indexOf(item);
        newData[ind][prop] = value;
        this.setState({ data: newData });
    };

    render() {
        return (
            <div className="list-page">
                <div>
                    <PageTable 
                        columns={this.state.table_columns} 
                        table_properties={this.state.table_properties} 
                        list_items={this.state.data}
                        selected_items={this.state.selected_items}
                        handleSort={this.onSort}
                        handleSelect={this.onSelect}
                        handleDetailViewSelect={this.onDetailViewSelect}
                    />
                </div>
            </div>
        );
    }

}

IngredientsViewSimple.propTypes = {
    sku: PropTypes.object
}