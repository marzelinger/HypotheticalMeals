// ListPage.js
// Riley
// Larger page component to be shown in PageTemplate

import React from 'react';
import Filter from './Filter';
import PageTable from './PageTable'
import { 
    Alert,
    Button } from 'reactstrap';
import * as Constants from '../resources/Constants';


export default class ListPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            page_name: 'ingredients',
            page_title: 'Ingredients',
            num_filters: 0,
            filter_value: '',
            filter_category: '',
            filter_options: [Constants.keyword_label, Constants.sku_label],
            table_columns: ['Name', 'Number', 'Package Size', 'Cost per Package (USD)'],
            table_properties: ['name', 'num', 'pkg_size', 'pkg_cost'],
            item_properties: ['name', 'num', 'pkg_size', 'pkg_cost', 'vendor_info', 'comment', 'skus'],
            item_property_labels: ['Name', 'Number', 'Package Size', 'Package Cost', 'Vendor Info', 'Comments', 'SKUs'],
            item_property_placeholder: ['White Rice', '12345678', '1lb', '1.50', 'Tam Soy', '...', 'Fried Rice'],
            item_options: ['View Ingredient'], 
            selected_items: [],
            detail_view_item: null,
            detail_view_options: [],
            data: [],
            error: null
        };
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
                this.setState({ num_filters: 1 });
                this.loadDataFromServer();
        }
    }

    loadDataFromServer = () => {
        fetch('/api/' + this.state.page_name, { method: 'GET' })
          .then(data => data.json())
          .then((res) => {
            if (!res.success) this.setState({ error: res.error });
            else this.setState({ data: res.data });
          });
        console.log(this.state.data);
    }

    submitUpdateItem = (item) => {
        fetch(`/api/${this.state.page_name}/${item._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        }).then(res => res.json()).then((res) => {
          if (!res.success) this.setState({ error: res.error.message || res.error });
          else console.log(res);
        });
    }

    submitDeleteItem = (item) => {
        fetch(`/api/${this.state.page_name}/${item._id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        }).then(res => res.json()).then((res) => {
          if (!res.success) this.setState({ error: res.error.message || res.error });
          else console.log(res);
        });
    }

    onFilterValueChange = (event) => {
        this.setState({
            filter_value: event.target.value
        });
    }

    onFilterSelection = (e, sel) => {
        this.setState({
            filter_category: sel
        });
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
    };

    onDetailViewSubmit = (event, item, option) => {
        switch (option) {
            case Constants.details_save:
                this.submitUpdateItem(item);
                break;
            case Constants.details_delete:
                this.submitDeleteItem(item);
                break;
            case Constants.details_cancel:
                break;
        }
        this.setState({ 
            detail_view_item: null,
            detail_view_options: []
        });
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
                <Button onClick={this.loadDataFromServer}></Button>
                <div className="title-bar">
                    <h1>{this.state.page_title}</h1>
                </div>
                <div className="options-container">
                    <div className="filter-bar"> 
                        <Filter 
                            value={this.state.filter_value}
                            selection={this.state.filter_category} 
                            categories={this.state.filter_options}
                            handleValueChange={this.onFilterValueChange}
                            handleFilterSelection={this.onFilterSelection}>
                        </Filter>
                    </div>
                    <div className="options"> 
                        {/* <DropdownToggle caret>
                            ...
                        </DropdownToggle> */}
                    </div>
                </div>
                <div className='table'>
                    <PageTable 
                        columns={this.state.table_columns} 
                        table_properties={this.state.table_properties} 
                        list_items={this.state.data}
                        selected_items={this.state.selected_items}
                        item_properties={this.state.item_properties}
                        item_property_labels={this.state.item_property_labels}
                        item_property_placeholder= {this.state.item_property_placeholder}
                        item_options={this.state.item_options}
                        detail_view_item={this.state.detail_view_item}
                        detail_view_options={this.state.detail_view_options}
                        handleSort={this.onSort}
                        handleSelect={this.onSelect}
                        handleDetailViewSelect={this.onDetailViewSelect}
                        handlePropChange={this.onPropChange}
                        handleDetailViewSubmit={this.onDetailViewSubmit}
                    >
                    </PageTable>
                    <Alert
                        value={this.state.error}
                        color='danger'/>
                </div>
            </div>
        );
    }

}