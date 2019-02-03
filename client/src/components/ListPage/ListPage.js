// ListPage.js
// Riley
// Larger page component to be shown in PageTemplate
// THIS PAGE IS DEPRICATED

import React from 'react';
import Filter from './Filter';
import PageTable from './PageTable'
import TableOptions from './TableOptions'
import SubmitRequest from './../../helpers/SubmitRequest'
import ItemStore from './../../helpers/ItemStore'
import ItemDetails from './ItemDetails'
import AddToManuGoal from './AddToManuGoal'
import { 
    Alert,
    Button,
    DropdownToggle,
    Modal} from 'reactstrap';
import * as Constants from './../../resources/Constants';
import './../../style/ListPage.css';
import GeneralNavBar from "../GeneralNavBar";
import ExportSimple from '../export/ExportSimple';
import DependencyReport from '../export/DependencyReport';
const jwt_decode = require('jwt-decode');


export default class ListPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            page_name: Constants.skus_page_name,
            page_title: 'SKUs',
            ing_substr: [],
            filter_value: [],
            filter_category: [],
            assisted_search_results: [[]],
            table_columns: ['Name', 'Number', 'Case UPC', 'Unit UPC', 'Unit Size', 'Count per Case', 'Product Line'],
            table_properties: ['name', 'num', 'case_upc', 'unit_upc', 'unit_size', 'cpc', 'prod_line'],
            table_options: [Constants.create_item, Constants.add_to_manu_goals, Constants.add_keyword_filter, 
                Constants.add_ing_filter, Constants.add_prod_filter],
            item_properties: ['name', 'num', 'case_upc', 'unit_upc', 'unit_size', 'cpc', 'prod_line', 'comment', 'ingredients'],
            item_property_labels: ['Name', 'Number', 'Case UPC', 'Unit UPC', 'Unit Size', 'Count per Case', 'Product Line', 'Comment', 'Ingredients'],
            selected_items: [],
            detail_view_item: null,
            detail_view_options: [],
            data: [],
            loaded: false,
            error: null,
            details_modal: false,
            manu_goals_modal: false,
            manu_goals_data: [],
            simple: props.simple || false,
            user:''
        };
        if(localStorage != null){
            if(localStorage.getItem("jwtToken")!= null){
              this.state.user = jwt_decode(localStorage.getItem("jwtToken")).id;
            }
          }
        this.toggle = this.toggle.bind(this);
        this.onFilterValueSelection = this.onFilterValueSelection.bind(this);
        this.onKeywordSubmit = this.onFilterValueSubmit.bind(this);
    }

    toggle = (modalType) => {
        switch(modalType){
            case Constants.details_modal:
                this.setState({details_modal: !this.state.details_modal})
                break;
            case Constants.manu_goals_modal:
                if(this.state.selected_items.length == 0){
                    alert("You must select at least one SKU to add it to a manufacturing goal!");
                    return;
                }
                this.setState({manu_goals_modal: !this.state.manu_goals_modal})
                break;
        }
    }   

    componentDidMount = () => {
        this.loadDataFromServer();
    }

    async componentDidUpdate (prevProps, prevState) {
        if (prevState.ing_substr !== this.state.ing_substr || prevState.filter_value !== this.state.filter_value || 
            prevState.filter_category !== this.state.filter_category) {
            await this.updateFilterState(prevState);
            this.loadDataFromServer();
        }
    }

    async updateFilterState(prevState) {
        var asr = this.state.assisted_search_results.slice();
        console.log(asr);
        for (var i = 0; i < prevState.ing_substr.length; i++) {
            if (this.state.filter_category[i] === Constants.ingredient_label
                && this.state.ing_substr[i].length > 0) {
                let res = await SubmitRequest.submitGetIngredientsByNameSubstring(this.state.ing_substr[i]);
                if (res === undefined || !res.success) {
                    res.data = [];
                }
                console.log(res)
                asr[i] = res.data;
            }
            if (this.state.filter_category[i] === Constants.prod_line_label
                && this.state.ing_substr[i].length > 0) {
                let res = await SubmitRequest.submitGetProductLinesByNameSubstring(this.state.ing_substr[i]);
                if (res === undefined || !res.success) {
                    res.data = [];
                }
                asr[i] = res.data;
            }
            else if (this.state.filter_category[i] === Constants.keyword_label) {
                if (prevState.ing_substr[i] !== this.state.ing_substr[i]){
                    this.onFilterValueSubmit(i);
                }
                asr[i] = [];
            }
        }
        this.setState({
            assisted_search_results: asr
        });
    }

    async loadDataFromServer() {
        if (this.state.filter_value === undefined) return;
        var final_ing_filter = '';
        var final_keyword_filter = '';
        var final_prod_line_filter = '';
        for (var i = 0; i < this.state.filter_value.length; i++){
            if (this.state.filter_value[i].length === Constants.obj_id_length 
                && this.state.filter_category[i] === Constants.ingredient_label) {
                    final_ing_filter += (final_ing_filter.length == 0 ? '' : ',');
                    final_ing_filter += this.state.filter_value[i];
            }
            else if (this.state.filter_category[i] === Constants.keyword_label) {
                final_keyword_filter = this.state.filter_value[i];
            }
            else if (this.state.filter_category[i] === Constants.prod_line_label) {
                final_prod_line_filter += (final_prod_line_filter.length == 0 ? '' : ',');
                final_prod_line_filter += this.state.filter_value[i];
            }
        }
        if (final_ing_filter === '') final_ing_filter = '_';
        if (final_keyword_filter === '') final_keyword_filter = '_';
        if (final_prod_line_filter === '') final_prod_line_filter = '_';
        var res = await SubmitRequest.submitGetFilterData(Constants.sku_filter_path, 
            final_ing_filter, final_keyword_filter, final_prod_line_filter);

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
        var ing_sub = this.state.ing_substr.slice();
        ing_sub[id] = e.target.value;
        this.setState({
            ing_substr: ing_sub
        });
    }

    onFilterValueSelection (e, item, id) {
        var ing_sub = this.state.ing_substr.slice();
        ing_sub[id] = item.name;
        var fil_val = this.state.filter_value.slice();
        fil_val[id] = item._id;
        var asr = this.state.assisted_search_results.slice();
        asr[id] = [];
        this.setState({
            ing_substr: ing_sub,
            filter_value: fil_val,
            assisted_search_results: asr
        });
    }

    onFilterValueSubmit (id) {
        var fil_val = this.state.filter_value.slice();
        fil_val[id] = this.state.ing_substr[id];
        this.setState({
            filter_value: fil_val
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
        this.toggle(Constants.details_modal);
    }

    onAddFilter = (type) => {
        if (type == Constants.keyword_label && this.state.filter_category.includes(type)){
            return;
        }
        var ind = this.state.ing_substr.length;
        var ing_sub = this.state.ing_substr.slice();
        ing_sub[ind] = '';
        var fil_val = this.state.filter_value.slice();
        fil_val[ind] = '';
        var fil_cat = this.state.filter_category.slice();
        fil_cat[ind] = type;
        var asr = this.state.assisted_search_results.slice();
        asr[ind] = [];
        this.setState({ 
            ing_substr: ing_sub,
            filter_value: fil_val,
            filter_category: fil_cat,
            assisted_search_results: asr,
        })
    }

    onRemoveFilter = (e, id) => {
        var ing_sub = this.state.ing_substr.slice();
        ing_sub[id] = '';
        var fil_val = this.state.filter_value.slice();
        fil_val[id] = '';
        var fil_cat = this.state.filter_category.slice();
        fil_cat[id] = Constants.filter_removed;
        var asr = this.state.assisted_search_results.slice();
        asr[id] = [];
        this.setState({ 
            ing_substr: ing_sub,
            filter_value: fil_val,
            filter_category: fil_cat,
            assisted_search_results: asr,
        })
    }

    onTableOptionSelection = async(e, opt) => {
        switch (opt){
            case Constants.create_item:
                this.onCreateNewItem();
                break;
            case Constants.add_ing_filter:
                this.onAddFilter(Constants.ingredient_label);
                break;
            case Constants.add_keyword_filter:
                this.onAddFilter(Constants.keyword_label);
                break;
            case Constants.add_prod_filter:
                this.onAddFilter(Constants.prod_line_label);
                break;
            case Constants.add_to_manu_goals:
                await this.onAddManuGoals();
                break;
        }
    }

    onAddManuGoals =  async() => {
        this.toggle(Constants.manu_goals_modal);
        await this.getManuGoalsData();
    }

    getManuGoalsData = () => {

        fetch(`/api/manugoals/${this.state.user}`, { method: 'GET' })
          .then(data => data.json())
          .then((res) => {
            console.log(res.data);
            if (!res.success) this.setState({ error: res.error });
            else this.setState({ 
                manu_goals_data: res.data
            });
            
          });
    }

    onSort = (event, sortKey) => {
        const data = this.state.data;
        data.sort((a,b) => {
            if (/^\d+$/.test(a[sortKey]) && /^\d+$/.test(b[sortKey])) {
                return parseInt(a[sortKey])-parseInt(b[sortKey]);
            }
            else {
                if (a[sortKey] === undefined && b[sortKey] === undefined) return a;
                else if (a[sortKey] === undefined) return b;
                else if (b[sortKey] === undefined) return a;
                return a[sortKey].toString().localeCompare(b[sortKey]);
            }
        })
        this.setState({data})
    };

    onSelect = async (event, item) => {
        var newState = this.state.selected_items.slice();
        var loc = newState.indexOf(item);
        (loc > -1) ? newState.splice(loc, 1) : newState.push(item);
        await this.setState({ selected_items: newState});
    };

    onDetailViewSelect = (event, item) => {
        this.setState({ 
            detail_view_item: item ,
            detail_view_options: [Constants.details_save, Constants.details_delete, Constants.details_cancel]
        });
        this.toggle(Constants.details_modal);
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
        this.toggle(Constants.details_modal);
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
                {this.state.ing_substr.map((is,index) => {
                        if (this.state.filter_category[index] != Constants.filter_removed){
                            return (<Filter 
                                        key={'filter'+index}
                                        id={index}
                                        value={is}
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
                        handleSort={this.onSort}
                        handleSelect={this.onSelect}
                        handleDetailViewSelect={this.onDetailViewSelect}
                    />
                </div>
                <Modal isOpen={this.state.details_modal} toggle={this.toggle} id="popup" className='item-details'>
                    <ItemDetails
                            item={this.state.detail_view_item}
                            item_properties={this.state.item_properties}
                            item_property_labels={this.state.item_property_labels}
                            detail_view_options={this.state.detail_view_options}
                            handlePropChange={this.onPropChange}
                            handleDetailViewSubmit={this.onDetailViewSubmit}
                        />
                    <Alert
                        value={this.state.error}
                        color='danger'/>
                </Modal>
                <AddToManuGoal selected_skus={this.state.selected_items} isOpen={this.state.manu_goals_modal} toggle={(toggler) => this.toggle(toggler)} manu_goals_data={this.state.manu_goals_data}></AddToManuGoal>
                <ExportSimple data = {this.state.data} fileTitle = {this.state.page_name}/>               
            </div>
        );
    }

}