// ManuLineSelect.js

import React from 'react';
import PropTypes from 'prop-types';
import PageTable from '../ListPage/PageTable'
import SubmitRequest from '../../helpers/SubmitRequest';
import * as Constants from '../../resources/Constants';
import DataStore from '../../helpers/DataStore'
import TablePagination from '../ListPage/TablePagination'

import '../../style/SkusPage.css'
import '../../style/GeneralReportTableStyle.css'
import '../../style/SkuTableStyle.css'
import '../../style/GeneralReport.css'
import { Label } from 'reactstrap';
const jwt_decode = require('jwt-decode');

export default class ManuLineSelect extends React.Component {
    constructor(props) {
        super(props);

        let {
            page_name,
            page_title,
            table_columns, 
            table_properties, 
            table_options,  } = DataStore.getUserManuLineData();

         
        this.state = {
            page_name,
            page_title,
            table_columns,
            table_properties,
            table_options,
            selected_items: Object.assign([], props.manu_lines),
            // selected_indexes: [Object.assign([], props.manu_lines_indices)],
            selected_indexes: [],
            data: [],
            sort_field: '_',
            error: null,
            simple: props.simple || false,
            user:'',
            currentPage: 0,
            previousPage: 0,
            pageSize: 8,
            pagesCount: 0,
            filters: {
                'keyword': '',
            },
            filterChange: false
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
        this.loadDataFromServer();
    }

    async componentDidUpdate (prevProps, prevState) {
        if (this.state.filterChange) {
            await this.loadDataFromServer();
        }
    }

    updateDataState = async () => {
    }


    async loadDataFromServer() {
        var final_keyword_filter = this.state.filters['keyword'];
        if(final_keyword_filter != ''){
            var resALL = await SubmitRequest.submitGetManufacturingLinesByNameSubstring(final_keyword_filter, 0, 0);
            await this.checkCurrentPageInBounds(resALL);  
            var res = await SubmitRequest.submitGetManufacturingLinesByNameSubstring(final_keyword_filter, this.state.currentPage, this.state.pageSize);
        }
        else{
            var resALL = await SubmitRequest.submitGetDataPaginated(Constants.manu_line_page_name, 0, 0);    
            await this.checkCurrentPageInBounds(resALL);  
            var res = await SubmitRequest.submitGetDataPaginated(Constants.manu_line_page_name, this.state.currentPage, this.state.pageSize);
        }
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
    }


    getPropertyLabel = (col) => {
        return this.props.columns[this.props.table_properties.indexOf(col)];
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
            this.props.handleSelectManuLines(this.state.selected_items, this.state.selected_indexes);
            return;
        }
        else if(rowIndexes == 'none'){
            rowIndexes = [];
        }
        var newState = [];
        rowIndexes.forEach( index => {
            newState.push(this.state.data[index]);
        });
        await this.setState({ selected_items: newState, selected_indexes: rowIndexes});
        this.props.handleSelectManuLines(this.state.selected_items, this.state.selected_indexes);
    };



    onDetailViewSelect = async (event, item) => {
    };

    getButtons = () => {
    }

    render() {
        return (
            <div className="prod-line-select-page">
                <div className = "prod-line-select-table prod-select-report">
                    <Label>{Constants.select_manu_lines_label}</Label>
                    <PageTable 
                        columns={this.state.table_columns} 
                        table_properties={this.state.table_properties} 
                        list_items={this.state.data}
                        selected_items={this.state.selected_items}
                        selected_indexes = {this.state.selected_indexes}
                        handleSort={this.onSort}
                        handleSelect={this.onSelect}
                        handleDetailViewSelect={this.onDetailViewSelect}
                        showDetails = {false}
                        selectable = {true}
                        sortable = {false}
                        title = {this.state.page_title}
                        showHeader = {true}
                        simple = {this.props.simple}
                        filters = {this.state.filters}
                        table_options = {this.state.table_options}
                        onFilterValueSelection = {this.onFilterValueSelection}
                        onFilterValueChange = {this.onFilterValueChange}
                        onRemoveFilter = {this.onRemoveFilter}
                        onTableOptionSelection = {this.onTableOptionSelection}
                        reportSelect = {true}

                    />                              
                    <TablePagination
                        currentPage = {this.state.currentPage}
                        pagesCount = {this.state.pagesCount}
                        handlePageClick = {this.handlePageClick}
                        getButtons = {this.getButtons}
                    />
                </div>  

            </div>
        );
    }
}

ManuLineSelect.propTypes = {
    handleSelectManuLines: PropTypes.func,
    simple: PropTypes.bool,
    manu_lines: PropTypes.arrayOf(PropTypes.object),
    manu_lines_indices: PropTypes.arrayOf(PropTypes.number)
}
