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
            data: props.sku.ingredients,
            table_columns,
            table_properties,
            selected_items: []
        };
        this.onQuantityChange = this.onQuantityChange.bind(this);
    }

    async componentDidMount() {
        this.loadDataFromServer();
    }

    async componentDidUpdate (prevProps, prevState) {
        if (prevState.data !== this.state.data){
        }
    }

    async loadDataFromServer() {
    }

    onSort = () => {}

    onSelect = () => {}

    onDetailViewSelect = () => {}

    onQuantityChange (e, index) {
        var ing_quant = this.props.sku.ingredient_quantities.slice();
        ing_quant[index] = e.target.value;
        this.props.handlePropChange(ing_quant, this.props.sku, 'ingredient_quantities');
    }

    render() {
        return (
            <div className="list-page">
                <div>
                    <PageTable 
                        columns={this.state.table_columns} 
                        table_properties={this.state.table_properties} 
                        list_items={this.state.data}
                        quantities={(this.props.sku !== null) ? this.props.sku.ingredient_quantities : null}
                        selected_items={this.state.selected_items}
                        handleSort={this.onSort}
                        handleSelect={this.onSelect}
                        handleDetailViewSelect={this.onDetailViewSelect}
                        handleQuantityChange={this.onQuantityChange}
                    />
                </div>
            </div>
        );
    }

}

IngredientsViewSimple.propTypes = {
    sku: PropTypes.object,
    handlePropChange: PropTypes.func,
}