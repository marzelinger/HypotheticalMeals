// IngredientsViewSimple.js
// Riley
// Ingredients view for SKU details page

import React from 'react';
import PropTypes from 'prop-types';
import PageTable from './PageTable';
import './../../style/SkusPage.css';
import DataStore from './../../helpers/DataStore';
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';

export default class IngredientsViewSimple extends React.Component {
    constructor(props) {
        super(props);

        let {
            table_columns, 
            table_properties } = DataStore.getIngredientDataSimple();
            console.log(props);
        this.state = {
            sku_id: props.sku._id,
            table_columns: [...table_columns, 'Quantity'],
            table_properties: [...table_properties, 'quantity'],
            selected_items: [],
            currentPage: 0,
            previousPage: 0,
            pageSize: 20,
            pagesCount: 0,
            itemCount: 0,
            currItems: [],
            currQtys: []
        };
        this.onQuantityChange = this.onQuantityChange.bind(this);
        this.handlePageClick=this.handlePageClick.bind(this);
        this.setNumberPages();
    }

    async componentDidMount() {
        this.setNumberPages();
    }

    async componentDidUpdate (prevProps, prevState) {
        if (this.props.sku.ingredients.length != this.state.itemCount){
            this.setNumberPages();
        }
    }

    async handlePageClick(e, index) {
        e.preventDefault();
        await this.setState({
            currentPage: index
        });
        await this.setNumberPages();
    }

    async setNumberPages(){
        var curCount = Math.ceil(this.props.sku.ingredients.length/Number(this.state.pageSize));

        let starting_index = this.state.pageSize * this.state.currentPage;
        let cItems = this.props.sku.ingredients.slice(starting_index, starting_index+2);
        let cQtys = this.props.sku.ingredient_quantities.slice(starting_index, starting_index+2);
        await this.setState({
            itemCount: this.props.sku.ingredients.length,
            currentPage: this.state.currentPage <= curCount ? this.state.currentPage : this.state.currentPage-1,
            pagesCount: curCount,
            currItems: cItems,
            currQtys: cQtys
        }); 
    
    }
    


    onSort = () => {}

    onSelect = () => {}

    onDetailViewSelect = () => {}

    onQuantityChange (e, index) {
        let cQtys = this.state.currQtys.slice();
        cQtys[index] = e.target.value;
        this.setState({ currQtys: cQtys })

        let ind_actual = this.state.currentPage * this.state.pageSize + index;
        var ing_quant = this.props.sku.ingredient_quantities.slice();
        ing_quant[ind_actual] = e.target.value;
        this.props.handlePropChange(ing_quant, this.props.sku, 'ingredient_quantities');
    }

    render() {
        return (
            <div className="list-page">
                <div>
                    <PageTable 
                        columns={this.state.table_columns} 
                        table_properties={this.state.table_properties} 
                        list_items={this.state.currItems}
                        quantities={(this.state.currItems !== null) ? this.state.currQtys : null}
                        selected_items={this.state.selected_items}
                        handleSort={this.onSort}
                        handleSelect={this.onSelect}
                        handleDetailViewSelect={this.onDetailViewSelect}
                        handleQuantityChange={this.onQuantityChange}
                        selectable = {false}
                        title = {'Ingredients'}
                    />
                </div>
                <div className = "pagination-wrapper">
                <Pagination aria-label="Page navigation example">
                    <PaginationItem disabled={this.state.currentPage <= 0}>
                        <PaginationLink
                            onClick={e => this.handlePageClick(e, this.state.currentPage - 1)}
                            previous
                            href="#"
                        />
                    </PaginationItem>
                    {[...Array(this.state.pagesCount)].map((page, i) => 
                    <PaginationItem active={i === this.state.currentPage} key={i}>
                        <PaginationLink onClick={e => this.handlePageClick(e, i) } href="#">
                        {i + 1}
                        </PaginationLink>
                    </PaginationItem>
                    )}
                    <PaginationItem disabled={this.state.currentPage >= this.state.pagesCount - 1}>
                        <PaginationLink
                            onClick={e => this.handlePageClick(e, this.state.currentPage + 1)}
                            next
                            href="#"
                        />
                    </PaginationItem>
                </Pagination>
                </div>  
            </div>
        );
    }

}

IngredientsViewSimple.propTypes = {
    sku: PropTypes.object,
    handlePropChange: PropTypes.func,
}