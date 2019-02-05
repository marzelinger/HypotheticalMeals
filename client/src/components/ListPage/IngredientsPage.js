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
    Button,
    DropdownToggle,
    Modal} from 'reactstrap';
import * as Constants from '../../resources/Constants';
import './../../style/ListPage.css';
import GeneralNavBar from "../GeneralNavBar";
import DependencyReport from "../export/DependencyReport";
import ExportSimple from '../export/ExportSimple';
import DataStore from './../../helpers/DataStore'


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
            sku_substr: [],
            filter_value: [],
            filter_category: [],
            assisted_search_results: [[]],
            table_columns,
            table_properties,
            table_options,
            selected_items: [],
            selected_indexes: [],
            detail_view_item: null,
            detail_view_options: [],
            data: [],
            sort_field: '_',
            loaded: false,
            error: null,
            modal: false,
            simple: props.simple || false
        };
        this.toggleModal = this.toggleModal.bind(this);
        this.onFilterValueSelection = this.onFilterValueSelection.bind(this);
        this.onFilterValueChange = this.onFilterValueChange.bind(this);
        this.onKeywordSubmit = this.onKeywordSubmit.bind(this);
        this.onSort = this.onSort.bind(this);
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
    }

    async componentDidUpdate (prevProps, prevState) {
        if (prevState.sku_substr !== this.state.sku_substr || prevState.filter_value !== this.state.filter_value || 
            prevState.filter_category !== this.state.filter_category) {
            await this.updateFilterState(prevState);
            this.loadDataFromServer();
            console.log(this.state.data)
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
                if (prevState.sku_substr[i] !== this.state.sku_substr[i]){
                    this.onKeywordSubmit(i);
                }
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
        if (final_sku_filter === '') final_sku_filter = '_';
        if (final_keyword_filter === '') final_keyword_filter = '_';
        var res = await SubmitRequest.submitGetFilterData(Constants.ing_filter_path, 
            this.state.sort_field, final_sku_filter, final_keyword_filter);

        if (res === undefined || !res.success) {
            res.data = [];
            res.loaded = true;
        }
        this.setState({
            data: res.data,
            loaded: res.loaded
        })
    }

    async updateSkuCounts() {
        let data = this.state.data.slice();
        await data.map(async (item) => {
            let skus = await SubmitRequest.submitGetFilterData(Constants.sku_filter_path,'_', item._id, '_', '_');
            item.sku_count = skus.data.length;
            await SubmitRequest.submitUpdateItem(this.state.page_name, item);
            }
        );
        this.setState({ data: data })
    }

    onFilterValueChange = (val, e, id) => {
        console.log(val)
        console.log(e)
        if (e.action === 'input-change'){
            var sku_sub = this.state.sku_substr.slice();
            sku_sub[id] = val;
            this.setState({
                sku_substr: sku_sub
            });
            return val;
        }
        return this.state.sku_substr[id];
    }

    onFilterValueSelection (name, value, e, id) {
        var sku_sub = this.state.sku_substr.slice();
        sku_sub[id] = name;
        var fil_val = this.state.filter_value.slice();
        fil_val[id] = value;
        var asr = this.state.assisted_search_results.slice();
        asr[id] = [];
        this.setState({
            sku_substr: sku_sub,
            filter_value: fil_val,
            assisted_search_results: asr
        });
    }

    onKeywordSubmit (id) {
        var fil_val = this.state.filter_value.slice();
        fil_val[id] = this.state.sku_substr[id];
        console.log(fil_val[id])
        this.setState({
            filter_value: fil_val
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

    onAddFilter = (type) => {
        if (type == Constants.keyword_label && this.state.filter_category.includes(type)){
            return;
        }
        var ind = this.state.sku_substr.length;
        var sku_sub = this.state.sku_substr.slice();
        sku_sub[ind] = '';
        var fil_val = this.state.filter_value.slice();
        fil_val[ind] = '';
        var fil_cat = this.state.filter_category.slice();
        fil_cat[ind] = type;
        var asr = this.state.assisted_search_results.slice();
        asr[ind] = [];
        this.setState({ 
            sku_substr: sku_sub,
            filter_value: fil_val,
            filter_category: fil_cat,
            assisted_search_results: asr,
        })
    }

    onRemoveFilter = (e, id) => {
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
        console.log(rowIndexes);
        var newState = [];
        rowIndexes.forEach( index => {
            newState.push(this.state.data[index]);
        });
        console.log(newState);
        this.setState({ selected_items: newState, selected_indexes: rowIndexes});
    };

    onDetailViewSelect = (event, item) => {
        this.setState({ 
            detail_view_item: item ,
            detail_view_options: [Constants.details_save, Constants.details_delete, Constants.details_cancel]
        });
        this.toggleModal();
    };

    onDetailViewSubmit = (event, item, option) => {
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

    onPropChange = (value, item, prop) => {
        var newData = this.state.data.slice();
        var ind = newData.indexOf(item);
        newData[ind][prop] = value;
        this.setState({ data: newData });
    };

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
                        selected_indexes = {this.state.selected_indexes}
                        handleSort={this.onSort}
                        handleSelect={this.onSelect}
                        handleDetailViewSelect={this.onDetailViewSelect}
                        showDetails = {true}
                        sortable = {true}
                        title = {this.state.page_title}
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
                <ExportSimple data = {this.state.data} fileTitle = {this.state.page_name}/>                           
                <DependencyReport data = {this.state.data} />
            </div>
        );
    }

}

IngredientsPage.propTypes = {
    default_sku_filter: PropTypes.object
}