// IngredientsPage.js
// Riley
// Ingredients view

import React from 'react';
import PropTypes from 'prop-types';
import Filter from './Filter';
import PageTable from './PageTable'
import TableOptions from './TableOptions'
import SubmitRequest from '../../helpers/SubmitRequest'
import ItemStore from '../../helpers/ItemStore'
import IngredientDetails from './IngredientDetails'
import { 
    Alert,
    Modal} from 'reactstrap';
import * as Constants from '../../resources/Constants';
import './../../style/SkusPage.css';
import DependencyReport from "../export/DependencyReport";
import ExportSimple from '../export/ExportSimple';
import DataStore from './../../helpers/DataStore'
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';



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
            pageSize: 7,
            pagesCount: 0,
            filters: {
                'keyword': '',
                'sku': []
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
        this.setNumberPages();


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
        this.setNumberPages();

    }

    async componentDidUpdate (prevProps, prevState) {
        console.log(this.state.data)
        if (this.state.filterChange) {
            await this.loadDataFromServer();
        }
        //this.setNumberPages();
    }

    updateDataState = async() => {
        var {data: skus} = await SubmitRequest.submitGetData(Constants.skus_page_name);
        this.setState({skus: skus});
    }

    async loadDataFromServer() {
        let allData = await SubmitRequest.submitGetData(this.state.page_name);
        var final_keyword_filter = this.state.filters['keyword'];
        var final_sku_filter = this.state.filters['sku'].join(',');
        if (final_keyword_filter === '') final_keyword_filter = '_';
        if (final_sku_filter === '') final_sku_filter = '_';

            var res = await SubmitRequest.submitGetFilterData(Constants.ing_filter_path, 
                this.state.sort_field, final_sku_filter, final_keyword_filter, this.state.currentPage, this.state.pageSize);
                var resALL = await SubmitRequest.submitGetFilterData(Constants.ing_filter_path, 
                    this.state.sort_field, final_sku_filter, final_keyword_filter, 0, allData.data.length);
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
        // MAYBE NEED TO ADD SOMETHING TO RECALCULATE PAGES?
    }

    onFilterValueChange = (e, value, filterType) => {
        var filters = this.state.filters;
        if(filterType == 'keyword'){
            filters[filterType] = value;
        }
        this.setState({filters: filters, filterChange: true}) ;
    }

    async setNumberPages(){
        let allData = await SubmitRequest.submitGetData(this.state.page_name);
        var curCount = Math.ceil(allData.data.length/Number(this.state.pageSize));
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
    }

    onFilterValueSelection (vals, e, type)  {
        var filters = this.state.filters;
        filters[type] = vals.map((item) => {
            return item.value
        })
        
        this.setState({
            filters: filters,
            filterChange: true
        });
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
    }


    onRemoveFilter = (e, id) => {
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
    }

    async onSort(event, sortKey) {
        await this.setState({sort_field: sortKey})
        this.loadDataFromServer();
    };

    // onSelect = async (event, item) => {
    //     var newState = this.state.selected_items.slice();
    //     var loc = newState.indexOf(item);
    //     (loc > -1) ? newState.splice(loc, 1) : newState.push(item);
    //     await this.setState({ selected_items: newState});
    // };

    onSelect = (rowIndexes) => {
        var newState = [];
        rowIndexes.forEach( index => {
            newState.push(this.state.data[index]);
        });
        this.setState({ selected_items: newState, selected_indexes: rowIndexes});
    };

    onDetailViewSelect = (event, item) => {
        this.setState({ 
            detail_view_item: item ,
            detail_view_options: [Constants.details_save, Constants.details_delete, Constants.details_cancel]
        });
        this.toggleModal();
    };

    async onDetailViewSubmit(event, item, option) {
        var res = {};
        switch (option) {
            case Constants.details_create:
                res = await SubmitRequest.submitCreateItem(this.state.page_name, item, this);
                break;
            case Constants.details_save:
                res = await SubmitRequest.submitUpdateItem(this.state.page_name, item, this);
                break;
            case Constants.details_delete:
                res = await SubmitRequest.submitDeleteItem(this.state.page_name, item, this);
                break;
            case Constants.details_cancel:
                res = {success: true}
                break;
        }
        console.log(res)
        if (!res.success) alert(res.error);
        else {
            this.setState({ 
                detail_view_item: null,
                detail_view_options: []
            });
            this.loadDataFromServer();
            this.toggleModal();
        }
    }

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
                    />
                </div>
                <Modal isOpen={this.state.modal} toggle={this.toggleModal} id="popup" className='item-details'>
                    <IngredientDetails
                            item={this.state.detail_view_item}
                            detail_view_options={this.state.detail_view_options}
                            handlePropChange={this.onPropChange}
                            handleDetailViewSubmit={this.onDetailViewSubmit}
                        />
                    <Alert
                        value={this.state.error}
                        color='danger'/>
                </Modal>   
                <div className = "pagination-wrapper">
                <Pagination aria-label="Page navigation example">
                <div>
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
                            this.setState({
                                currentPage: i
                            });
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
                    </div>
                    <div className = "ingbuttons">     
                        <DependencyReport data = {this.state.data} />
                        <ExportSimple data = {this.state.data} fileTitle = {this.state.page_name}/> 
                    </div>
                    </Pagination>
                </div>  
            </div>
        );
    }

}

IngredientsPage.propTypes = {
    default_sku_filter: PropTypes.object
}