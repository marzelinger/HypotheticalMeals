// ListPage.js
// Riley
// Larger page component to be shown in PageTemplate

import React from 'react';
import Filter from './Filter';
import PageTable from './PageTable'
import TableOptions from './TableOptions'
import SubmitRequest from './../../helpers/SubmitRequest'
import ItemStore from './../../helpers/ItemStore'
import ItemDetails from './ItemDetails'
import { 
    Alert,
    Button,
    DropdownToggle,
    Modal} from 'reactstrap';
import * as Constants from './../../resources/Constants';
import './../../style/ListPage.css';
import GeneralNavBar from "../GeneralNavBar";


export default class ListPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            page_name: props.page_name,
            page_title: props.page_title,
            num_filters: 0,
            filter_value: '',
            filter_category: '',
            filter_options: props.filter_options,
            assisted_search_results: [],
            table_columns: props.table_columns,
            table_properties: props.table_properties,
            table_options: props.table_options,
            item_properties: props.item_properties,
            item_property_labels: props.item_property_labels,
            item_property_placeholder: props.item_property_placeholder,
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

    componentDidUpdate = (prevProps, prevState) => {
        if (prevState.filter_value !== this.state.filter_value || 
            prevState.filter_category !== this.state.filter_category){
                this.setState({ 
                    assisted_search_results: this.props.assisted_search_function(this.state.filter_value, this),
                    num_filters: 1 
                });
                this.loadDataFromServer();
        }
    }

    loadDataFromServer = () => {
        fetch('/api/' + this.state.page_name, { method: 'GET' })
          .then(data => data.json())
          .then((res) => {
            if (!res.success) this.setState({ error: res.error });
            else this.setState({ 
                data: res.data,
                loaded: true
            });
          });
        console.log(this.state.assisted_search_results);
    }

    onFilterSelection = (e, sel) => {
        this.setState({
            filter_category: sel
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

    onFilterValueChange = (event) => {
        SubmitRequest.
        this.setState({
            filter_value: event.target.value
        });
    }

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
        console.log('this print message is from line 156 of listpage.js');
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
            </div>
        );
    }

}
