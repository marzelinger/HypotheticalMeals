// IngredientsPage.js
// Riley
// Ingredients view

import React from 'react';
import Filter from './Filter';
import PageTable from './PageTable'
import TableOptions from './TableOptions'
import SubmitRequest from '../../helpers/SubmitRequest'
import ItemStore from '../../helpers/ItemStore'
import ItemDetails from './ItemDetails'
import { 
    Alert,
    Button,
    DropdownToggle,
    Modal} from 'reactstrap';
import * as Constants from '../../resources/Constants';
import './../../style/ListPage.css';
import GeneralNavBar from "../GeneralNavBar";
import DependencyReport from "../export/DependencyReport";
import ExportSimple from '../export/ExportSimple';
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';
var mongoose         = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');
const per_page = "4";


export default class IngredientsPagePagination extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            page_name: Constants.ingredients_page_name,
            page_title: 'Ingredients',
            num_filters: 0,
            filter_value: '',
            filter_category: '',
            filter_options: [Constants.keyword_label, Constants.sku_label],
            assisted_search_results: [],
            table_columns: ['Name', 'Number', 'Package Size', 'Cost per Package (USD)'],
            table_properties: ['name', 'num', 'pkg_size', 'pkg_cost'],
            table_options: [Constants.create_item],
            item_properties: ['name', 'num', 'pkg_size', 'pkg_cost', 'vendor_info', 'comment', 'skus'],
            item_property_labels: ['Name', 'Number', 'Package Size', 'Package Cost', 'Vendor Info', 'Comments', 'SKUs'],
            item_property_placeholder: ['White Rice', '12345678', '1lb', '1.50', 'Tam Soy', '...', 'Fried Rice'],
            selected_items: [],
            detail_view_item: null,
            detail_view_options: [],
            data: [],
            curPageData: [],
            currentPage: null,
            loaded: false,
            error: null,
            modal: false,
            simple: props.simple || false,
            itemsPerPage: null
        };
        this.toggle = this.toggle.bind(this);
        this.handlePageChange=this.handlePageChange.bind(this);

    }


    toggle(){
        this.setState({
            modal: !this.state.modal
        });
    }   

    componentDidMount = () => {
        this.loadDataFromServer();
        //if (this.state.data === []){
        if (this.currentPage === null) this.currentPage = 1;
        if (this.itemsPerPage === null) this.itemsPerPage = 5;

        if (this.state.data === [] || this.state.curPageData === []){
            this.loadDataFromServer();
        }
    }

    async componentDidUpdate (prevProps, prevState) {
        if (prevState.filter_value !== this.state.filter_value || 
            prevState.filter_category !== this.state.filter_category){
                let data = await SubmitRequest.submitGetIngredientsByNameSubstring(this.state.filter_value, this);
                console.log(data);
                this.setState({
                    assisted_search_results: data,
                    num_filters: 1 
                });
                this.loadDataFromServer();
        }
    }

    loadDataFromServer = () => {
        //SubmitRequest.submitGetData(this.state.page_name, this);
        console.log("this is the data: "+this.data);
        SubmitRequest.submitGetPagination(this);
        console.log("this is the data2: "+this.data);

    }

    loadDataFromServerPag = () => {
        SubmitRequest.submitGetPagination(this);
        console.log("this is the data2: "+this.data);

    }

    onFilterSelection = (e, sel) => {
        this.setState({
            filter_category: sel
        });
    }

    onFilterValueChange = (e) => {
        console.log(e.target.value);
        this.setState({
            filter_value: e.target.value
        });
    }

    onCreateNewItem = () => {
        var item = ItemStore.getEmptyItem(this.state.page_name, this.state.data, this);
        const newData = this.state.data.slice();
        newData.push(item);
        this.setState({ 
            data: newData,
            detail_view_item: item,
            detail_view_options: [Constants.details_create, Constants.details_delete, Constants.details_cancel]
        })
        this.toggle();
    }

    onTableOptionSelection = (e, opt) => {
        console.log(opt);
        switch (opt){
            case Constants.create_item:
                this.onCreateNewItem();
                break;
        }
    }

    onSort = (event, sortKey) => {
        const data = this.state.data;
        data.sort((a,b) => a[sortKey].toString().localeCompare(b[sortKey]))
        this.setState({data})
        //NEED TO CHECK THE PAGINATION HERE 
    };

    onSelect = (event, item) => {
        var newState = this.state.selected_items.slice();
        var loc = newState.indexOf(item);
        (loc > -1) ? newState.splice(loc, 1) : newState.push(item);
        this.setState({ selected_items: newState});
        console.log(this.state.selected_items);
    };

    onDetailViewSelect = (event, item) => {
        this.setState({ 
            detail_view_item: item ,
            detail_view_options: [Constants.details_save, Constants.details_delete, Constants.details_cancel]
        });
        this.toggle();
    };

    onDetailViewSubmit = (event, item, option) => {
        console.log(option);
        switch (option) {
            case Constants.details_create:
                SubmitRequest.submitCreateItem(this.state.page_name, item, this);
                break;
            case Constants.details_save:
                SubmitRequest.submitUpdateItem(this.state.page_name, item, this);
                break;
            case Constants.details_delete:
                SubmitRequest.submitDeleteItem(this.state.page_name, item, this);
                break;
            case Constants.details_cancel:
                break;
        }
        this.setState({ 
            detail_view_item: null,
            detail_view_options: []
        });
        this.loadDataFromServer();
        //NEED TO CHECK THE PAGINATE CALL HERE.
        this.toggle();
    }

    onPropChange = (event, item, prop) => {
        var newData = this.state.data.slice();
        var ind = newData.indexOf(item);
        newData[ind][prop] = event.target.value;
        this.setState({ data: newData });
    };

    // getNumPages = (currentPage) =>{
    //     { this.handlePageChange } 
    //     this.setState(
    //         { per_page: this.props.results , 
    //             currentPage: currentPage + 1 , 
    //             previousPage: currentPage - 1  
    //         });
    //     }

    handlePageChange = (page, evt) => {
        const currentPage = this.state.currentPage || 1;
        //const numPages = this.getNumPages();
        let numPages = Math.ceil(this.data.length / this.itemsPerPage);
        const pageLinks = [];
        if (currentPage > 1) {
            if (currentPage > 2) {
                pageLinks.push(1);
                pageLinks.push(' ');
            }
            pageLinks.push(currentPage - 1);
            pageLinks.push(' ');
        }
        for (let i = 1; i <= numPages; i++) {
            const page = i;
            pageLinks.push(page);
        }
        if (currentPage < numPages) {
            pageLinks.push(' ');
            pageLinks.push(currentPage + 1);
            if (currentPage < numPages - 1) {
                pageLinks.push(' ');
                pageLinks.push(numPages);
            }
        }
        this.setState({ currentPage: currentPage + 1  } );
        this.setState({ previousPage: currentPage - 1  } );
    }

    render() {

         const paginationData = this.props.data;
         console.log("paginationData : "+paginationData);
 let numPages = Math.ceil(paginationData.length / per_page);
     if (paginationData.length % per_page > 0) {
     numPages++;
     }
//     const per_page=10;
// const pages = Math.ceil(this.props.items.length / per_page);
// const current_page = this.props.current_Page || 1 ;
// const start_offset = (current_page - 1) * per_page;
// let start_count =0;
        return (
            <div className="list-page">
                <div className="options-container" id={this.state.simple ? "simple" : "complex"}>
                        <Filter 
                            value={this.state.filter_value}
                            selection={this.state.filter_category} 
                            categories={this.state.filter_options}
                            assisted_search_results={this.state.assisted_search_results}
                            handleFilterValueChange={this.onFilterValueChange}
                            handleFilterSelection={this.onFilterSelection}
                        />
                        <TableOptions
                        table_options={this.state.table_options}
                        handleTableOptionSelection={this.onTableOptionSelection}
                        />
                </div>
                <div>
                    <PageTable 
                        columns={this.state.table_columns} 
                        table_properties={this.state.table_properties} 
                        list_items={this.state.data}
                        selected_items={this.state.selected_items}
                        handleSort={this.onSort}
                        handleSelect={this.onSelect}
                        handleDetailViewSelect={this.onDetailViewSelect}
                    />
                </div>
                <Modal isOpen={this.state.modal} toggle={this.toggle} id="popup" className='item-details'>
                    <ItemDetails
                            item={this.state.detail_view_item}
                            item_properties={this.state.item_properties}
                            item_property_labels={this.state.item_property_labels}
                            item_property_placeholder={this.state.item_property_placeholder}
                            detail_view_options={this.state.detail_view_options}
                            handlePropChange={this.onPropChange}
                            handleDetailViewSubmit={this.onDetailViewSubmit}
                        />
                    <Alert
                        value={this.state.error}
                        color='danger'/>
                </Modal>   
                <ExportSimple data = {this.state.data} fileTitle = {this.state.page_name}/>                           
                    <DependencyReport data = {this.state.data} />
            

            <Pagination size="sm" aria-label="Page navigation example">
            <PaginationItem>
            <PaginationLink previous href="#" />
            </PaginationItem>
            <PaginationItem>
            <PaginationLink href="#">
            1
            </PaginationLink>
            </PaginationItem>
            <PaginationItem>
            <PaginationLink href="#">
            2
            </PaginationLink>
            </PaginationItem>
            <PaginationItem>
            <PaginationLink href="#">
            3
            </PaginationLink>
            </PaginationItem>
            <PaginationItem>
            <PaginationLink next href="#" />
            </PaginationItem>
            </Pagination>
            </div>
            );
    }
}
