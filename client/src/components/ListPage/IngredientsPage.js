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
            sku_substr: [],
            filter_value: [],
            filter_category: [],
            assisted_search_results: [[]],
            table_columns: ['Name', 'Number', 'Package Size', 'Cost per Package (USD)'],
            table_properties: ['name', 'num', 'pkg_size', 'pkg_cost'],
            table_options: [Constants.create_item, Constants.add_keyword_filter, Constants.add_sku_filter],
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
        this.toggleModal = this.toggleModal.bind(this);
        this.onFilterValueSelection = this.onFilterValueSelection.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.filterRender = this.filterRender.bind(this);
    }

    toggleModal(){
        this.setState({
            modal: !this.state.modal
        });
    }   

    componentDidMount = () => {
        this.loadDataFromServer();
    }

    async componentDidUpdate (prevProps, prevState) {
        if (prevState.sku_substr !== this.state.sku_substr || prevState.filter_value !== this.state.filter_value || 
            prevState.filter_category !== this.state.filter_category) {
            await this.updateFilterState(prevState);
            this.loadDataFromServer();
        }
    }

    async updateFilterState(prevState) {
        var asr = this.state.assisted_search_results.slice();
        for (var i = 0; i < prevState.sku_substr.length; i++) {
            if (this.state.filter_category[i] === Constants.sku_label
                && this.state.sku_substr[i].length > 0) {
                let res = await SubmitRequest.submitGetSkusByNameSubstring(this.state.sku_substr[i]);
                if (res === undefined || !res.success) {
                    res.data = [];
                }
                asr[i] = res.data;
            }
            else if (this.state.filter_category[i] === Constants.keyword_label) {
                asr[i] = [];
            }
            else {
                asr[i] = [];
            }
        }
        this.setState({
            assisted_search_results: asr
        });
    }

    async loadDataFromServer() {
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
        //this first if can be depricated!!!!!
        if ((final_sku_filter === '' && final_keyword_filter === '') || this.state.filter_category == ''){
            var res = await SubmitRequest.submitGetData(this.state.page_name);
        }
        else {
            if (final_sku_filter === '') final_sku_filter = '_';
            if (final_keyword_filter === '') final_keyword_filter = '_';
            var res = await SubmitRequest.submitGetFilterData(Constants.ing_filter_path, 
                final_sku_filter, final_keyword_filter);
        }
        if (res === undefined || !res.success) {
            res.data = [];
            res.loaded = true;
        }
        this.setState({
            data: res.data,
            loaded: res.loaded
        })
    }

    onFilterValueChange = (e, id) => {
        var sku_sub = this.state.sku_substr.slice();
        sku_sub[id] = e.target.value;
        this.setState({
            sku_substr: sku_sub
        });
    }

    onFilterValueSelection (e, item, id) {
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

    onKeyDown (e, id) {
        if (e.keyCode === 13) {
          if (this.state.filter_category[id] == Constants.keyword_label){
            var fil_val = this.state.filter_value.slice();
            fil_val[id] = this.state.sku_substr;
            this.setState({
                filter_value: fil_val
            });
          }
        }
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
        this.toggleModal();
    }

    onAddFilter = (type) => {
        if (type == Constants.keyword_label && this.state.filter_category.includes(type)){
            return;
        }
        var curr_ind = this.state.sku_substr.length;
        var sku_sub = this.state.sku_substr.slice();
        sku_sub[curr_ind] = '';
        var fil_val = this.state.filter_value.slice();
        fil_val[curr_ind] = '';
        var fil_cat = this.state.filter_category.slice();
        fil_cat[curr_ind] = type;
        var asr = this.state.assisted_search_results.slice();
        asr[curr_ind] = [];
        this.setState({ 
            sku_substr: sku_sub,
            filter_value: fil_val,
            filter_category: fil_cat,
            assisted_search_results: asr,
        })
    }

    onRemoveFilter = (e, id) => {
        console.log(id);
        var sku_sub = this.state.sku_substr.slice();
        sku_sub[id] = '';
        var fil_val = this.state.filter_value.slice();
        fil_val[id] = '';
        var fil_cat = this.state.filter_category.slice();
        fil_cat[id] = Constants.filter_removed;
        var asr = this.state.assisted_search_results.slice();
        asr[id] = [];
        this.setState({ 
            sku_substr: sku_sub,
            filter_value: fil_val,
            filter_category: fil_cat,
            assisted_search_results: asr,
        })
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
        this.toggleModal();
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
        this.toggleModal();
    }

    onPropChange = (event, item, prop) => {
        var newData = this.state.data.slice();
        var ind = newData.indexOf(item);
        newData[ind][prop] = event.target.value;
        this.setState({ data: newData });
    };

    filterRender = () => {
        this.state.sku_substr.map((ss,index) => {
            if (this.state.filter_category[index] != Constants.filter_removed){
                return (<Filter 
                    key={'filter'+index}
                    id={index}
                    value={ss}
                    filter_category={this.state.filter_category[index]} 
                    assisted_search_results={this.state.assisted_search_results[index]}
                    handleFilterValueChange={this.onFilterValueChange}
                    handleFilterValueSelection={this.onFilterValueSelection}
                    handleKeyDown={this.onKeyDown}
                    />)
            }
        })
    }

    render() {
        return (
            <div className="list-page">
                <div className="options-container" id={this.state.simple ? "simple" : "complex"}>
                    {this.state.sku_substr.map((ss,index) => {
                        if (this.state.filter_category[index] != Constants.filter_removed){
                            return (<Filter 
                                        key={'filter'+index}
                                        id={index}
                                        value={ss}
                                        filter_category={this.state.filter_category[index]} 
                                        assisted_search_results={this.state.assisted_search_results[index]}
                                        handleFilterValueChange={this.onFilterValueChange}
                                        handleFilterValueSelection={this.onFilterValueSelection}
                                        handleKeyDown={this.onKeyDown}
                                        handleRemoveFilter={this.onRemoveFilter}
                                    />)
                        }
                    })}
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
                <Modal isOpen={this.state.modal} toggle={this.toggleModal} id="popup" className='item-details'>
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
