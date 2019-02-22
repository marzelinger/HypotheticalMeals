// FormulaPage.js
// Belal

import React from 'react';
import PropTypes from 'prop-types';
import PageTable from './PageTable'
import SubmitRequest from '../../helpers/SubmitRequest'
import ItemStore from '../../helpers/ItemStore'
import DataStore from './../../helpers/DataStore'
import TablePagination from './TablePagination'
import ListPage from './SkusPage';
import ExportSimple from '../export/ExportSimple';
import './../../style/SkusPage.css';
import {Modal, ModalHeader} from 'reactstrap';
import * as Constants from '../../resources/Constants';
import FormulaDetails from './FormulaDetails';
import '../../style/SkusPage.css'
import GeneralNavBar from '../GeneralNavBar';

const jwt_decode = require('jwt-decode');
const currentUserIsAdmin = require("../auth/currentUserIsAdmin");

export default class FormulasPage extends React.Component {
    constructor(props){
        super(props);

        let{
            page_name,
            page_title,
            table_columns,
            table_properties,
            table_options} = DataStore.getFormulaData();

        this.state = {
            page_name,
            page_title,
            table_columns,
            table_properties,
            table_options,
            selected_items: [],
            selected_indexes: [],
            detail_view_item: {},
            detail_view_options: [],
            data: [],
            exportData: [],
            sort_field: '_',
            error: null,
            details_modal: false,
            simple: props.simple || false,
            user:'',
            currentPage: 0,
            previousPage: 0,
            pageSize: 20,
            pagesCount: 0,
            filters: {
                'keyword': '',
                'ingredients': []
            },
            filterChange: false,
            ingredients:[],
        };
        if(localStorage != null){
            if(localStorage.getItem("jwtToken")!=null){
                this.state.user = jwt_decode(localStorage.getItem("jwtToken")).id;
            }
        }
        this.toggle = this.toggle.bind(this);
        this.onFilterValueSelection = this.onFilterValueSelection.bind(this);
        this.onFilterValueChange = this.onFilterValueChange.bind(this);
        this.onDetailViewSubmit = this.onDetailViewSubmit.bind(this);
        this.onSort = this.onSort.bind(this);
        this.handlePageClick=this.handlePageClick.bind(this);
        this.setInitPages();
    }

    toggle = () => {
        this.setState({details_modal: !this.state.details_modal})
    }

    async componentDidMount() {
        if(this.props.default_ing_filter !== undefined){
            await this.onFilterValueSelection([{ value: this.props.default_ing_filter._id }], null, 'ingredients');
        }
        await this.loadDataFromServer();
        //await 
    }

    async componentDidUpdate (prevProps, prevState){
        if(this.state.filterChange){
            await this.loadDataFromServer();
        }
    }

    updateDataState = async() => {
        var {data: ingredients} = await SubmitRequest.submitGetData(Constants.ingredients_page_name);
        this.setState({ingredients: ingredients});
    }

    async loadDataFromServer() {
        let allData = await SubmitRequest.submitGetData(this.state.page_name);
        var final_ing_filter = this.state.filters['ingredients'].join(',');
        var final_keyword_filter = this.state.filters['keyword'];
        if (final_ing_filter === '') final_ing_filter = '_';
        if (final_keyword_filter === '') final_keyword_filter = '_';
        var resALL = await SubmitRequest.submitGetFilterData(Constants.formula_filter_path, 
            this.state.sort_field, final_ing_filter, final_keyword_filter, 0, 0, undefined);
        await this.checkCurrentPageInBounds(resALL);
        var res = await SubmitRequest.submitGetFilterData(Constants.formula_filter_path, 
            this.state.sort_field, final_ing_filter, final_keyword_filter, this.state.currentPage, this.state.pageSize); 
        if (res === undefined || !res.success) {
            res.data = [];
            resALL.data = [];
        }
        await this.setState({
            data: res.data,
            exportData: resALL.data,
            filterChange: false
        })
        this.updateDataState();
    }

    async checkCurrentPageInBounds(dataResAll){
        var prev = this.state.previousPage;
        if(dataResAll === undefined || !dataResAll.success){
            this.setState({
                currentPage: 0,
                previousPage: prev,
                pagesCount: 0,
            });
        }
        else {
            var dataLength = dataResAll.data.length;
            var curCount = Math.ceil(dataLength/Number(this.state.pageSize));
            if(curCount != this.state.pagesCount){
                if(this.state.currentPage>=curCount){
                    this.setState({
                        currentPage: 0,
                        previousPage: prev,
                        pagesCount: curCount,
                    });
                }
            }
            else {
                this.setState({
                    pagesCount: curCount,
                });
            }
        }
    }

    async setInitPages(){
        let allData = await SubmitRequest.submitGetData(this.state.page_name);
        var curCount = Math.ceil(allData.data.length/Number(this.state.pageSize));
        this.setState({
            currentPage: 0,
            previousPage: 0,
            pagesCount: curCount,
        })
    }

    onFilterValueChange = (e, value, filterType) => {
        var filters = this.state.filters;
        if(filterType == 'keyword'){
            filters[filterType] = value;
        }
        this.setState({ filters: filters, filterChange: true});
    }

    handlePageClick = (e, index) => {
        e.preventDefault();
        this.setState({
            currentPage: index,
        });
        this.loadDataFromServer();
    }

    onFilterValueSelection(vals, e, type){
        var filters = this.state.filters;
        filters[type] = vals.map((item) => {
            return item.value_id
        })

        this.setState({
            filters: filters,
            filterChange: true
        });
    }

    async onCreateNewItem(){ 
        var item = await ItemStore.getEmptyItem(this.state.page_name);
        const newData = this.state.data.slice();
        newData.push(item);

        //for the pagination stuff
        const newExportData = this.state.exportData.slice();
        newExportData.push(item);

        this.setState({ 
            data: newData,
            exportData: newExportData,
            detail_view_item: item,
            detail_view_options: [Constants.details_create, Constants.details_delete, Constants.details_cancel]
        })
        this.toggle(Constants.details_modal);
        this.loadDataFromServer();
    }

    onTableOptionSelection = async(e, opt) => {
        this.onCreateNewItem();
    }

    async onSort(event, sortKey){
        await this.setState({ sort_field: sortKey})
        this.loadDataFromServer();
    }

    onSelect = (rowIndexes) => {
        var newState = [];
        rowIndexes.forEach( index => {
            newState.push(this.state.data[index]);
        });
        this.setState({ selected_items: newState, selected_indexes: rowIndexes});
    };

    onDetailViewSelect = (event, item) => {
        if(currentUserIsAdmin().isValid){
            this.setState({ 
            detail_view_item: item ,
            detail_view_options: [Constants.details_save, Constants.details_delete, Constants.details_cancel]
            });
        }
        else{
            this.setState({ 
                detail_view_item: item ,
                detail_view_options: [Constants.details_cancel]
                });
        }
        this.toggle(Constants.details_modal);
    };

    async onDetailViewSubmit(event, item, option) {
        var res = {};
        var newData = this.state.data.splice();
        switch (option) {
            case Constants.details_create:
                newData.push(item);
                res = await SubmitRequest.submitCreateItem(this.state.page_name, item, this);
                break;
            case Constants.details_save:
                let toSave = newData.findIndex(obj => {return obj._id === item._id});
                newData[toSave] = item;
                res = await SubmitRequest.submitUpdateItem(this.state.page_name, item, this);
                break;
            case Constants.details_delete:
                let toDelete = newData.findIndex(obj => {return obj._id === item._id});
                newData.splice(toDelete, 1);
                res = await SubmitRequest.submitDeleteItem(this.state.page_name, item, this);
                break;
            case Constants.details_cancel:
                res = {success: true}
                break;
        }
        if (!res.success) alert(res.error);
        else {
            this.setState({ 
                data: newData,
                detail_view_item: null,
                detail_view_options: []
            });
            this.loadDataFromServer();
            this.toggle(Constants.details_modal);
        }
    }

    getButtons = () => {
        return;
    }


    render(){
        return(
            <div className="list-page">
            <GeneralNavBar></GeneralNavBar>
                <div>
                    <PageTable
                        columns={this.state.table_columns} 
                        table_properties={this.state.table_properties} 
                        list_items={this.state.data}
                        selected_items={this.state.selected_items}
                        selected_indexes = {this.state.selected_indexes}
                        handleSort={this.onSort}
                        handleSelect={this.onSelect}
                        handleDetailViewSelect={this.onDetailViewSelect}
                        showDetails = {this.props.simple !=undefined ? !this.props.simple : true}
                        selectable = {this.props.simple !=undefined ? !this.props.simple : true}
                        sortable = {this.props.simple != undefined ? !this.props.simple : true}
                        title = {this.state.page_title}
                        showHeader = {true}
                        simple = {this.props.simple}
                        filters = {this.state.filters}
                        table_options = {this.state.table_options}
                        onTableOptionSelection = {this.onTableOptionSelection}
                        onFilterValueSelection = {this.onFilterValueSelection}
                        onFilterValueChange = {this.onFilterValueChange}
                        onRemoveFilter = {this.onRemoveFilter}
                        ingredients = {this.state.ingredients}
                    />
                </div>
                <Modal isOpen={this.state.details_modal} toggle={this.toggle} id="popup" className='item-details'>
                    <FormulaDetails
                            item={this.state.detail_view_item}
                            detail_view_options={this.state.detail_view_options}
                            handleDetailViewSubmit={this.onDetailViewSubmit}
                        />
                </Modal>
                <TablePagination
                 currentPage = {this.state.currentPage}
                 pagesCount = {this.state.pagesCount}
                 handlePageClick = {this.handlePageClick}
                 getButtons = {this.getButtons}
                >
                </TablePagination>
            </div>
        )
    }
}

ListPage.propTypes = {
    default_ing_flter: PropTypes.object
}