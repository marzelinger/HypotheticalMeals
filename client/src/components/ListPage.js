// ListPage.js
// Riley
// Larger page component to be shown in PageTemplate

import React from 'react';
import Filter from './Filter';
import PageTable from './PageTable'
import { 
    Button,
    DropdownMenu,
    DropdownItem,
    DropdownToggle } from 'reactstrap';
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
            table_properties: ['ingredient_name', 'ingredient_num', 'pkg_size', 'pkg_cost'],
            selected_items: [],
            data: []
        };
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
                        properties={this.state.table_properties} 
                        list_items={this.state.data}
                        selected_items={this.state.selected_items}
                        handleSort={this.onSort}
                        handleSelect={this.onSelect}
                    >
                    </PageTable>
                </div>
            </div>
        );
    }

}