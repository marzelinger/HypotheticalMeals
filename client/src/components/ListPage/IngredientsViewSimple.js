// IngredientsViewSimple.js
// Riley
// Ingredients view for SKU details page

import React from 'react';
import PropTypes from 'prop-types';
import PageTable from './PageTable'
import SubmitRequest from '../../helpers/SubmitRequest'
import * as Constants from '../../resources/Constants';
import './../../style/SkusPage.css';
import DataStore from './../../helpers/DataStore'
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';



export default class IngredientsViewSimple extends React.Component {
    constructor(props) {
        super(props);

        let {
            table_columns, 
            table_properties } = DataStore.getIngredientDataSimple();
            console.log(props);
        this.state = {
            sku: props.sku,
            sku_id: props.sku._id,
            data: props.sku.ingredients,
            table_columns: [...table_columns, 'Quantity'],
            table_properties: [...table_properties, 'quantity'],
            selected_items: [],
            curPageData: [],
            currentPage: 0,
            pageSize: 2,
            pagesCount: 0

        };
        this.onQuantityChange = this.onQuantityChange.bind(this);
        this.handlePageClick=this.handlePageClick.bind(this);
        this.setNumberPages();
    }

    async componentDidMount() {
        this.loadDataFromServer();
        this.setNumberPages();
    }

    async componentDidUpdate (prevProps, prevState) {
        if (prevState.data !== this.state.data){
        }
        //this.setNumberPages();
    }

    async loadDataFromServer() {
        var res = await SubmitRequest.submitGetFilterData(Constants.ing_filter_path, 
                    "_", this.state.sku_id, "_", this.state.currentPage, this.state.pageSize);

        if (res === undefined || !res.success) {
            res.data = [];
        }
        this.setState({
            curPageData: res.data
        })

    }

    handlePageClick = (e, index) => {
        e.preventDefault();
        console.log("this is current page1; "+this.state.currentPage);
        this.setState({
            currentPage: index
        });
        this.loadDataFromServer();
    }

    async setNumberPages(){
        console.log("this is the state.sku.id"+this.state.sku_id);
        var allIngs = await SubmitRequest.submitGetFilterData(Constants.ing_filter_path, 
                "_", this.state.sku_id, "_", 0, 0);
        console.log(allIngs);
        var curCount = allIngs == undefined || !allIngs.success ? 1 : Math.ceil(allIngs.data.length/Number(this.state.pageSize));

        this.setState({
            currentPage: 0,
            pagesCount: curCount
        }); 

        console.log('this is the pagesCount1: '+this.state.pagesCount);

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
                        list_items={this.state.curPageData}
                        quantities={(this.props.sku !== null) ? this.props.sku.ingredient_quantities : null}
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
                        <PaginationLink onClick={e => {
                        //this.handlePageClick(e, i)
                        console.log("this is before click page: "+this.state.currentPage);
                        this.setState({
                            currentPage: i
                        });
                        console.log("this is after click page: "+this.state.currentPage);
                        this.loadDataFromServer();     
                        }
                        } href="#">
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