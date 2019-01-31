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


export default class IngredientsPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            page_name: Constants.ingredients_page_name,
            page_title: 'Ingredients',
            sku_substr: [''],
            filter_value: [''],
            filter_category: [''],
            filter_options: [Constants.keyword_label, Constants.sku_label],
            assisted_search_results: [[]],
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
        this.onFilterValueSelection = this.onFilterValueSelection.bind(this);
    }

    toggle(){
        this.setState({
            modal: !this.state.modal
        });
    }   

    componentDidMount = () => {
        this.loadDataFromServer();
    }

    async componentDidUpdate (prevProps, prevState) {
        console.log("update!");
        if (prevState.sku_substr !== this.state.sku_substr){
            var asr = this.state.assisted_search_results.slice();
            for(var i = 0; i < prevState.sku_substr.length; i++){
                let data = await SubmitRequest.submitGetSkusByNameSubstring(this.state.sku_substr[i], this);
                if (data === undefined){
                    data = [];
                }
                asr[i] = data;
            }
            this.setState({
                assisted_search_results: asr
            });
            this.loadDataFromServer();
        }
        if (prevState.filter_value !== this.state.filter_value || 
            prevState.filter_category !== this.state.filter_category){
                //TODO:
        }
    }

    async loadDataFromServer() {
        console.log("filt: " + this.state.filter_value);
        if (this.state.filter_value === undefined) return;
        var final_sku_filter = '';
        var final_keyword_filter = '';
        for (var i = 0; i < this.state.filter_value.length; i++){
            if (this.state.filter_value[i].length === Constants.obj_id_length 
                && this.state.filter_category[i] === Constants.sku_label) {
                    final_sku_filter += (final_sku_filter.length == 0 ? '' : ',');
                    final_sku_filter += this.state.filter_value[i];
            }
            else if (this.state.filter_category[i] === Constants.keyword_label) {
                    final_keyword_filter = this.state.filter_value[i];
            }
        }
        console.log(final_sku_filter + '/' + final_keyword_filter);
        //this first if can be depricated!!!!!
        if ((final_sku_filter === '' && final_keyword_filter === '') || this.state.filter_category == ''){
            var res = await SubmitRequest.submitGetData(this.state.page_name);
        }
        else {
            if (final_sku_filter === '') final_sku_filter = '_';
            if (final_keyword_filter === '') final_keyword_filter = '_';
            console.log(final_sku_filter + "/" + final_keyword_filter);
            var res = await SubmitRequest.submitGetFilterData(Constants.ing_filter_path, 
                final_sku_filter, final_keyword_filter);
        }
        console.log(res);
            this.setState({
                data: res.data,
                loaded: res.loaded
            })
    }

    onFilterSelection = (e, sel, id) => {
        var fil_cat = this.state.filter_category.slice();
        fil_cat[id] = sel;
        this.setState({
            filter_category: fil_cat
        });
    }

    onFilterValueChange = (e, id) => {
        console.log(e.target.value, id);
        var sku_sub = this.state.sku_substr.slice();
        sku_sub[id] = e.target.value;
        this.setState({
            sku_substr: sku_sub
        });
    }

    onFilterValueSelection (e, item, id) {
        console.log(item._id + '/' + id);
        var sku_sub = this.state.sku_substr.slice();
        sku_sub[id] = item.name;
        var fil_val = this.state.filter_value.slice();
        fil_val[id] = item._id;
        var asr = this.state.assisted_search_results.slice();
        asr[id] = [];
        this.setState({
            sku_substr: sku_sub,
            filter_value: fil_val,
            assisted_search_results: asr
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
                    {this.state.sku_substr.map((ss,index) => 
                        <Filter 
                        key={'filter'+index}
                        id={index}
                        value={ss}
                        selection={this.state.filter_category[index]} 
                        categories={this.state.filter_options}
                        assisted_search_results={this.state.assisted_search_results[index]}
                        handleFilterValueChange={this.onFilterValueChange}
                        handleFilterValueSelection={this.onFilterValueSelection}
                        handleFilterSelection={this.onFilterSelection}
                    />
                    )}
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
