// FormulaPage.js
// Belal

import React from 'react';
import PropTypes from 'prop-types';
import PageTable from './PageTable'
import SubmitRequest from '../../helpers/SubmitRequest'
import ItemStore from '../../helpers/ItemStore'
import DataStore from './../../helpers/DataStore'
import TablePagination from './TablePagination'

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
            detail_view_item: null,
            detail_view_options,
            data: [],
            exportData: [],
            sort_field: '_',
            error: null,
            modal: false,
            simple: props.simple || false,
            currentPage: 0,
            previousPage: 0,
            pageSize: 20,
            pagesCount: 0,
            filters: {
                'keyword': '',
                'ingredients': []
            },
            filterChange: false,
        };

        this.toggleModal = this.toggleModalModa.bind(this);
        this.onFilterValueSelection = this.onFilterValueSelection.bind(this);
        this.onFilterValueChange = this.onFilterValueChange.bind(this);
        this.onDetailViewSubmit = this.onDetailViewSubmit.bind(this);
        this.onSort = this.onSort.bind(this);
        this.handlePageClick=this.handlePageClick.bind(this);
        this.setInitPages();
    }

    toggleModal(){
        this.state({
            modal: !this.state.modal
        });
    }

    async componentDidMount() {
        if(this.props.default_sku_filter !== undefined){
            await this.onAddFilter(Constants.sku_label)
            await this.onFilterValueSelection(undefined, this.props.default_sku_filter, 0);
        }
        await this.loadDataFromServer();
        //await 
    }

    async componentDidUpdate (prevProps, prevState){
        console.log(this.state.data);
        if(this.state.filterChange){
            await this.loadDataFromServer();
        }
    }

    updateDateState = async() => {
        var {data: skus} = await SubmitRequest.submitGetData(Constants.skus_page_name);
        this.setState({skus: skus});
    }

    async loadDataFromServer() {
        let allData = await SubmitRequest.submitGetData(this.state.page_name);
        var final_keyword_filter = this.state.filters['keyword'];
        var final_ingr_filter = this.state.filters['ingredients'].join(',');
        if(final_keyword_filter === '') final_keyword_filter = '_';
        if(final_ingr_filter === '') final_ingr_filter = '_';
        var resALL = await SubmitRequest.submitGetFilterData(Constants.formula_filter_path,
            this.state.sort_field, final_sku_filter, final_keyword_filter, 0, 0);
        await this.checkCurrentPageInBounds(resALL);
        var res = await SubmitRequest.submitGetFilterData(Constants.formula_filter_path, 
            this.state.sort_field, final_sku_filter, final_keyword_filter, this.state.currentPage, this.state.pageSize);
        if (res === undefined || !res.success){
            res.data = [];
            resALL.data = [];
        }
        await this.setState({
            data: res.data,
            exportData: resALL.data,
            filterChange: false,
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

    onFilterValueChange = (e, value, filterType) => {
        var filters = this.state.filters;
        if(filterType == 'keyword'){
            filters[filterType] = value;
        }
        this.setState({ filters: filters, filterChange: true});
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



    render(){
        return(
            <div className="list-page">
                <div>
                    <PageTable
                        columns={this.state.table_columns}
                        table_properties={this.state.table_properties}
                        list_items={this.state.data}
                        selected_items={this.state.selected_items}
                        selected_indexes={this.state.selected_indexes}
                        handleSort={this.onSort}
                        handleSelect={this.onSelect}
                        handleDetailView={this.onDetailViewSubmit}
                        showDetails={true}
                        sortable={true}
                        title={this.state.page_title}
                        showHeader={true}
                        simple={this.props.simple}
                        filters={this.state.filters}
                        table_options={this.state.table_options}
                        onTableOptionSelection={this.onTableOptionSelection}
                        onFilterValueSelection={this.onFilterValueSelection}
                        onFilterValueChange={this.onFilterValueChange}
                        onRemoveFilter={this.onRemoveFilter}
                        //skus={this.state.skus}
                        onTableOptionSelection={this.onTableOptionSelection}
                    />
                </div>
                <Modal isOpen={this.state.modal} toggle={this.toggleModal} id="popup" className='item-detals'>
                    <ModalHeader toggle={this.toggleModal}> Formula Details</ModalHeader>
                    <FormulaDetails
                        item={this.state.detail_view_item}
                        detail_view_options={this.state.detail_view_options}
                        handleDetailViewSubmit={this.onDetailViewSubmit} />
                </Modal>
                <TablePagination
                    currentPage={this.state.currentPage}
                    pagesCount={this.state.pagesCount}
                    handlePageClick={this.handlePageClick}
                    getButtons={this.getButtons}
                ></TablePagination>
            </div>
        )
    }
}