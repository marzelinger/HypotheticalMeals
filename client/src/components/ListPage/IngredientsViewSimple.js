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
            sku_id: props.sku._id,
            table_columns: [...table_columns, 'Quantity'],
            table_properties: [...table_properties, 'quantity'],
            selected_items: [],
            currentPage: 0,
            pageSize: 2,
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
        this.loadDataFromServer();
        this.setNumberPages();
    }

    async componentDidUpdate (prevProps, prevState) {
        if (this.props.sku.ingredients.length != this.state.itemCount){
            this.setNumberPages();
        }
    }

    async loadDataFromServer() {
<<<<<<< HEAD
        var res = await SubmitRequest.submitGetFilterData(Constants.ing_filter_path, 
                    "_", this.state.sku_id, "_", this.state.currentPage, this.state.pageSize);
=======
        // console.log("this loaddata page: "+this.state.currentPage);
        // let allData = await SubmitRequest.submitGetData("ingredients");

        // var res = await SubmitRequest.submitGetFilterData(Constants.ing_filter_path, 
        //             "_", this.state.sku_id, "_", this.state.currentPage, this.state.pageSize);
             
        // console.log("this is the res; "+res);
>>>>>>> 1c41b7cdc9440907f9bc6e6a7f76475a96e53d48

        // if (res === undefined || !res.success) {
        //     res.data = [];
        // }
        // this.setState({
        //     currPageData: res.data
        // })

    }

    async handlePageClick(e, index) {
        e.preventDefault();
        console.log("this is current page1; "+this.state.currentPage);
        await this.setState({
            currentPage: index
        });
        await this.setNumberPages();
        // this.loadDataFromServer();
    }

    async setNumberPages(){
        // console.log("this is the state.sku.id"+this.state.sku_id);
        // var allIngs = await SubmitRequest.submitGetFilterData(Constants.ing_filter_path, "_", 
        //     (this.state.sku_id===undefined) ? '_' : this.state.sku_id, "_", 0, 0);
        // console.log('this is the allData: '+allIngs);
        // console.log('this is the the number length'+allIngs.data.length);
        // console.log('this is the the stringify'+JSON.stringify(allIngs));

        var curCount = Math.ceil(this.props.sku.ingredients.length/Number(this.state.pageSize));

        let starting_index = this.state.pageSize * this.state.currentPage;
        console.log(starting_index)
        let cItems = this.props.sku.ingredients.slice(starting_index, starting_index+2);
        let cQtys = this.props.sku.ingredient_quantities.slice(starting_index, starting_index+2);
        await this.setState({
            itemCount: this.props.sku.ingredients.length,
            currentPage: this.state.currentPage <= curCount ? this.state.currentPage : this.state.currentPage-1,
            pagesCount: curCount,
            currItems: cItems,
            currQtys: cQtys
        }); 
        console.log(cItems)

        console.log('this is the pagesCount1: '+this.state.pagesCount);

        

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
                        <PaginationLink onClick={e => {
                        this.handlePageClick(e, i)
                        // console.log("this is before click page: "+this.state.currentPage);
                        // this.setState({
                        //     currentPage: i
                        // });
                        // console.log("this is after click page: "+this.state.currentPage);
                        // this.loadDataFromServer();     
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