// ProductLineSelectSalesReport.js

import React from 'react';
import PropTypes from 'prop-types';
import PageTable from '../ListPage/PageTable'
import SubmitRequest from '../../helpers/SubmitRequest';
import * as Constants from '../../resources/Constants';
import './../../style/SkusPage.css';
import DataStore from '../../helpers/DataStore'
import TablePagination from '../ListPage/TablePagination'

import '../../style/SkusPage.css'
import '../../style/SkuTableStyle.css'
const jwt_decode = require('jwt-decode');

const currentUserIsAdmin = require("../auth/currentUserIsAdmin");

export default class ProductLineSelectSalesReport extends React.Component {
    constructor(props) {
        super(props);

        let {
            page_name,
            page_title,
            table_columns, 
            table_properties, 
            table_options,  } = DataStore.getProdLineReportData();

         
        this.state = {
            page_name,
            page_title,
            table_columns,
            table_properties,
            table_options,
            selected_items: [],
            selected_indexes: [],
            detail_view_item: {},
            detail_view_formula_item: {},
            detail_view_options: [],
            detail_view_action:'',
            data: [],
            sort_field: '_',
            error: null,
            details_modal: false,
            manu_goals_modal: false,
            manu_goals_data: [],
            manu_lines_modal: false,
            manu_lines_data: [],
            simple: props.simple || false,
            user:'',
            currentPage: 0,
            previousPage: 0,
            pageSize: props.simple ? 4 : 20,
            pagesCount: 0,
            filters: {
                'keyword': '',
            },
            filterChange: false,
            product_lines: []
        };
        if(localStorage != null){
            if(localStorage.getItem("jwtToken")!= null){
                this.state.user = jwt_decode(localStorage.getItem("jwtToken")).username;
            }
        }
        this.onFilterValueSelection = this.onFilterValueSelection.bind(this);
        this.onFilterValueChange = this.onFilterValueChange.bind(this);
        this.onSort = this.onSort.bind(this);
        this.handlePageClick=this.handlePageClick.bind(this);
        this.onSelect = this.onSelect.bind(this)
        this.setInitPages();
    }  

    async componentDidMount() {
        // if (this.props.default_ing_filter !== undefined){
        //     await this.onFilterValueSelection([{ value: { _id : this.props.default_ing_filter._id }}], null, 'ingredients');
        // }
        this.loadDataFromServer();
    }

    async componentDidUpdate (prevProps, prevState) {
        if (this.state.filterChange) {
            await this.loadDataFromServer();
        }
    }

    updateDataState = async () => {
        //var {data: productlines} = await SubmitRequest.submitGetData(Constants.prod_line_page_name);
        //this.setState({product_lines: productlines});
    }


    async loadDataFromServer() {
        var final_keyword_filter = this.state.filters['keyword'];
        //Check how the filter state is being set         
        var resALL = await SubmitRequest.submitGetProductLinesByNameSubstring(final_keyword_filter, 0, 0);
        await this.checkCurrentPageInBounds(resALL);  
        var res = await SubmitRequest.submitGetProductLinesByNameSubstring(final_keyword_filter, this.state.currentPage, this.state.pageSize);
        
        if (res === undefined || !res.success) {
            res.data = [];
            resALL.data = [];
        }
        await this.setState({
            data: res.data,
            filterChange: false
        })
        this.updateDataState();
    }

    async checkCurrentPageInBounds(dataResAll){
        var prev = this.state.previousPage;
        //there is no data. update the current index stuff
        if (dataResAll === undefined || !dataResAll.success) {
            this.setState({
                currentPage: 0,
                previousPage: prev,
                pagesCount: 0,
            });
        }
        else{
            //there is some sort of data response
            var dataLength = dataResAll.data.length;
            var curCount = Math.ceil(dataLength/Number(this.state.pageSize));
            if(curCount != this.state.pagesCount){
                //number pages changed.
                if(this.state.currentPage>= curCount){
                    //previous index out of bounds. want to set the index to be 0.
                    this.setState({
                        currentPage: 0,
                        previousPage: prev,
                        pagesCount: curCount,
                    }); 
                }
                else{
                    //the number of pages has changed but the index is still in bounds.
                    //don't need to page change here.
                    this.setState({
                        pagesCount: curCount,
                    }); 
                }
            }
        }

    }


    async setInitPages(){
        let allData = await SubmitRequest.submitGetData(this.state.page_name);
        var curCount = 0;
        if(allData!=undefined){
            if(allData.data!=undefined){
                 curCount = Math.ceil(allData.data.length/Number(this.state.pageSize));
            }
        }
        this.setState({
            currentPage: 0,
            previousPage: 0,
            pagesCount: curCount,
        }); 
    }

    onFilterValueChange = (e, value, filterType) => {
        console.log(this.state.filters)
        var filters = this.state.filters;
        if(filterType == 'keyword'){
            filters[filterType] = value;
        }
        this.setState({filters: filters, filterChange: true}) ;
    }

    handlePageClick = (e, index) => {
        e.preventDefault();
        this.setState({
            currentPage: index
        });
        this.loadDataFromServer();
    }

    onFilterValueSelection (vals, e, type)  {
        var filters = this.state.filters;
        filters[type] = []
        vals.map((item) => {
            filters[type].push(item.value._id);
        })
        this.setState({
            filters: filters,
            filterChange: true
        });
    }

    onTableOptionSelection = async(e, opt) => {
        // if (this.state.selected_items.length === 0 && opt!=Constants.create_item) {
        //     alert('You must select items to use these features!')
        //     return
        // }
        // switch (opt){
        //     case Constants.create_item:
        //         break;
        //     case Constants.add_to_manu_goals:
        //         await this.onAddManuGoals();
        //         break;
        //     case Constants.edit_manu_lines:
        //         break;
        // }
    }

    async onSort(event, sortKey) {
        await this.setState({sort_field: sortKey})
        this.loadDataFromServer();
    };

    onSelect = async (rowIndexes) => {
        if(rowIndexes == 'all'){
            var indexes = []
            for(var i = 0; i < this.state.data.length; i ++){
                indexes.push(i);
            }
            await this.setState({selected_items: this.state.data, selected_indexes: indexes});
            return;
        }
        else if(rowIndexes == 'none'){
            rowIndexes = [];
        }
        console.log(rowIndexes);
        var newState = [];
        rowIndexes.forEach( index => {
            newState.push(this.state.data[index]);
        });
        await this.setState({ selected_items: newState, selected_indexes: rowIndexes});
    };

     onDetailViewSelect = async (event, item) => {
        // this.setState({
        //     detail_view_item: item,
        // });
        // if(currentUserIsAdmin().isValid){
        //     this.setState({ 
        //     detail_view_options: [Constants.details_save, Constants.details_delete, Constants.details_cancel],
        //     detail_view_action: Constants.details_edit
        //     });
        // }
        // else{
        //     this.setState({ 
        //         detail_view_options: [Constants.details_cancel],
        //         detail_view_action: Constants.details_view
        //         });
        // }
    };

    getButtons = () => {
        return (
        <div className = "ingbuttons"> 
        </div>
        );
    }

    render() {

        return (
            <div className="prodline-select-page">
                <div className = "prodline-table">
                    <PageTable 
                        columns={this.state.table_columns} 
                        table_properties={this.state.table_properties} 
                        list_items={this.state.data}
                        selected_items={this.state.selected_items}
                        selected_indexes = {this.state.selected_indexes}
                        handleSort={this.onSort}
                        handleSelect={this.onSelect}
                        handleDetailViewSelect={this.onDetailViewSelect}
                        showDetails = {true}
                        selectable = {this.props.simple !=undefined ? !this.props.simple : true}
                        sortable = {this.props.simple != undefined ? !this.props.simple : true}
                        title = {this.state.page_title}
                        showHeader = {true}
                        simple = {this.props.simple}
                        filters = {this.state.filters}
                        table_options = {this.state.table_options}
                        onFilterValueSelection = {this.onFilterValueSelection}
                        onFilterValueChange = {this.onFilterValueChange}
                        onRemoveFilter = {this.onRemoveFilter}
                        ingredients = {this.state.ingredients}
                        products = {this.state.product_lines}
                        onTableOptionSelection = {this.onTableOptionSelection}
                    />
                </div>
                <TablePagination
                    currentPage = {this.state.currentPage}
                    pagesCount = {this.state.pagesCount}
                    handlePageClick = {this.handlePageClick}
                    getButtons = {this.getButtons}
                />
            </div>
        );
    }
}

ProductLineSelectSalesReport.propTypes = {
    handleSelectProdLines: PropTypes.func
}
