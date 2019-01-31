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


export default class IngredientsPage extends React.Component {
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
            loaded: false,
            error: null,
            modal: false,
            simple: props.simple || false
        };
        this.toggle = this.toggle.bind(this);
    }

    toggle(){
        this.setState({
            modal: !this.state.modal
        });
    }   

    componentDidMount = () => {
        this.loadDataFromServer();
        if (this.state.data === []){
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
        SubmitRequest.submitGetData(this.state.page_name, this);
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
        this.toggle();
    }

    onPropChange = (event, item, prop) => {
        var newData = this.state.data.slice();
        var ind = newData.indexOf(item);
        newData[ind][prop] = event.target.value;
        this.setState({ data: newData });
    };

    render() {
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
                    <DependencyReport data = {this.state.data} />
            </div>
        );
    }

}
