// IngredientsPage.js
// Riley
// Ingredients view

import React from 'react';
import PropTypes from 'prop-types';
import PageTable from './PageTable'
import SubmitRequest from '../../helpers/SubmitRequest'
import ItemStore from '../../helpers/ItemStore'
import IngredientDetails from './IngredientDetails'
import { 
    Alert,
    Modal, ModalHeader} from 'reactstrap';
import * as Constants from '../../resources/Constants';
import './../../style/SkusPage.css';
import DataStore from './../../helpers/DataStore'
import TablePagination from './TablePagination'
import DependencyReport from "../export/DependencyReport";
import ExportSimple from '../export/ExportSimple';

const currentUserIsAdmin = require("../auth/currentUserIsAdmin");



export default class IngredientsPage extends React.Component {
    constructor(props) {
        super(props);

        let {
            page_name, 
            page_title, 
            table_columns, 
            table_properties, 
            table_options } = DataStore.getIngredientData();
  

        this.state = {
            page_name,
            page_title,
            table_columns,
            table_properties,
            table_options,
            selected_items: [],
            selected_indexes: [],
            detail_view_item: null,
            detail_view_options: [],
            data: [],
            exportData: [],
            sort_field: '_',
            error: null,
            modal: false,
            simple: props.simple || false,
            currentPage: 0,
            pageSize: 20,
            pagesCount: 0,
            filters: {
                'keyword': '',
                'skus': []
            },
            filterChange: false,
            skus: []

        };
        this.toggleModal = this.toggleModal.bind(this);
        this.onFilterValueSelection = this.onFilterValueSelection.bind(this);
        this.onFilterValueChange = this.onFilterValueChange.bind(this);
        this.onDetailViewSubmit = this.onDetailViewSubmit.bind(this);
        this.onSort = this.onSort.bind(this);
        this.handlePageClick=this.handlePageClick.bind(this);
        this.setInitPages();
    }

    toggleModal(){
        this.setState({
            modal: !this.state.modal
        });
    }   

    async componentDidMount() {
        if (this.props.default_sku_filter !== undefined){
            await this.onAddFilter(Constants.sku_label)
            await this.onFilterValueSelection(undefined, this.props.default_sku_filter, 0);
        }
        await this.loadDataFromServer();
        await this.updateSkuCounts();
        //this.updateNumberPages();

    }

    async componentDidUpdate (prevProps, prevState) {
        console.log(this.state.data)
        if (this.state.filterChange) {
            await this.loadDataFromServer();
        }
//        this.updateNumberPages();
    }

    updateDataState = async() => {
        var {data: skus} = await SubmitRequest.submitGetData(Constants.skus_page_name);
        this.setState({skus: skus});
        //this.updateNumberPages();
    }

    async loadDataFromServer() {
        let allData = await SubmitRequest.submitGetData(this.state.page_name);
        var final_keyword_filter = this.state.filters['keyword'];
        var final_sku_filter = this.state.filters['skus'].join(',');
        if (final_keyword_filter === '') final_keyword_filter = '_';
        if (final_sku_filter === '') final_sku_filter = '_';

            var res = await SubmitRequest.submitGetFilterData(Constants.ing_filter_path, 
                this.state.sort_field, final_sku_filter, final_keyword_filter, this.state.currentPage, this.state.pageSize);
            var resALL = await SubmitRequest.submitGetFilterData(Constants.ing_filter_path, 
                    this.state.sort_field, final_sku_filter, final_keyword_filter, 0, 0);
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
        this.updateNumberPages();

    }

    async updateSkuCounts() {
        console.log('this is the data in updateSkuCounts: '+this.state.data);

        let data = this.state.data.slice();
        await data.map(async (item) => {
                       let skus = await SubmitRequest.submitGetFilterData(Constants.sku_filter_path,'_', item._id, '_', this.state.currentPage, this.state.pageSize,'_');

           // let skus = await SubmitRequest.submitGetFilterData(Constants.sku_filter_path,'_', item._id, '_', '_');
            item.sku_count = skus.data.length;
            await SubmitRequest.submitUpdateItem(this.state.page_name, item);
            }
        );
        this.setState({ data: data })
        this.updateNumberPages();
    }

    onFilterValueChange = (e, value, filterType) => {
        var filters = this.state.filters;
        if(filterType == 'keyword'){
            filters[filterType] = value;
        }
        this.setState({filters: filters, filterChange: true}) ;
        this.updateNumberPages();
    }

    async setInitPages(){
        let allData = await SubmitRequest.submitGetData(this.state.page_name);
        var curCount = Math.ceil(allData.data.length/Number(this.state.pageSize));
        this.setState({
            currentPage: 0,
            pagesCount: curCount,
        }); 
    }

    async updateNumberPages(){
        let allData = await SubmitRequest.submitGetData(this.state.page_name);
        var curCount = Math.ceil(this.state.exportData.length/Number(this.state.pageSize));

        this.setState({
            currentPage: 0,
            pagesCount: curCount,
        }); 
    }

    handlePageClick = (e, index) => {
        e.preventDefault();
        this.setState({
            currentPage: index
        });
        this.loadDataFromServer();
    }


    onFilterValueChange = (e, value, filterType) => {
        var filters = this.state.filters;
        if(filterType == 'keyword'){
            filters[filterType] = value;
        }
        this.setState({filters: filters, filterChange: true}) ;
        //this.updateNumberPages();
    }

    onFilterValueSelection (vals, e, type)  {
        var filters = this.state.filters;
        filters[type] = vals.map((item) => {
            return item.value._id
        })
        
        this.setState({
            filters: filters,
            filterChange: true
        });
        //this.updateNumberPages();
    }

    async onCreateNewItem() {
        var item = await ItemStore.getEmptyItem(this.state.page_name);
        const newData = this.state.data.slice();
        newData.push(item);
        this.setState({ 
            data: newData,
            detail_view_item: item,
            detail_view_options: [Constants.details_create, Constants.details_delete, Constants.details_cancel]
        })
        this.toggleModal();
        //this.updateNumberPages();
    }

    onTableOptionSelection = (e, opt) => {
        switch (opt){
            case Constants.create_item:
                this.onCreateNewItem();
                break;
            case Constants.add_sku_filter:
                this.onAddFilter(Constants.sku_label);
                break;
            case Constants.add_keyword_filter:
                this.onAddFilter(Constants.keyword_label);
                break;
        }
        //this.updateNumberPages();
    }

    async onSort(event, sortKey) {
        await this.setState({sort_field: sortKey})
        //this.loadDataFromServer();
    };

    onSelect = (rowIndexes) => {
        var newState = [];
        rowIndexes.forEach( index => {
            newState.push(this.state.data[index]);
        });
        //this.setState({ selected_items: newState, selected_indexes: rowIndexes});
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
        this.toggleModal();
    };

    async onDetailViewSubmit(event, item, option) {
        console.log(item)
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
            this.toggleModal();
        }
    }

    getButtons = () => {
        return (
        <div className = "ingbuttons">     
            <DependencyReport data = {this.state.exportData} />
            <ExportSimple data = {this.state.exportData} fileTitle = {this.state.page_name}/> 
        </div>
        );
    }

    render() {
        return (
            <div className="list-page">
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
                        showDetails = {true}
                        sortable = {true}
                        title = {this.state.page_title}
                        showHeader = {true}
                        simple = {this.props.simple}
                        filters = {this.state.filters}
                        table_options = {this.state.table_options}
                        onTableOptionSelection = {this.onTableOptionSelection}
                        onFilterValueSelection = {this.onFilterValueSelection}
                        onFilterValueChange = {this.onFilterValueChange}
                        onRemoveFilter = {this.onRemoveFilter}
                        skus = {this.state.skus}
                        onTableOptionSelection = {this.onTableOptionSelection}
                    />
                </div>
                <Modal isOpen={this.state.modal} toggle={this.toggleModal} id="popup" className='item-details'>
                    <ModalHeader toggle={this.toggleModal}>Ingredient Details</ModalHeader>
                    <IngredientDetails
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
        );
    }

}

IngredientsPage.propTypes = {
    default_sku_filter: PropTypes.object
}