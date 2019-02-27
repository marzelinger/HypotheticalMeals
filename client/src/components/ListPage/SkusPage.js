// SkusPage.js
// Riley
// Larger page component to be shown in PageTemplate

import React from 'react';
import PropTypes from 'prop-types';
import PageTable from './PageTable'
import SubmitRequest from '../../helpers/SubmitRequest'
import ItemStore from '../../helpers/ItemStore'
import AddToManuGoal from './AddToManuGoal'
import {Modal, ModalHeader} from 'reactstrap';
import * as Constants from '../../resources/Constants';
import './../../style/SkusPage.css';
import ExportSimple from '../export/ExportSimple';
import DataStore from '../../helpers/DataStore'
import TablePagination from './TablePagination'
import SkuDetails from './SkuDetails';
import GeneralNavBar from '../GeneralNavBar';

import '../../style/SkusPage.css'
import BulkEditManuLines from './BulkEditManuLines';
const jwt_decode = require('jwt-decode');

const currentUserIsAdmin = require("../auth/currentUserIsAdmin");



export default class ListPage extends React.Component {
    constructor(props) {
        super(props);

        let {
            page_name, 
            page_title, 
            table_columns, 
            table_properties, 
            table_options,  } = props.simple ? DataStore.getSkuDataSimple() : DataStore.getSkuData();

        this.state = {
            page_name,
            page_title,
            table_columns,
            table_properties,
            table_options,
            selected_items: [],
            selected_indexes: [],
            detail_view_item: {},
            detail_view_formula_item: {},
            detail_view_options: [],
            detail_view_action:'',
            data: [],
            exportData: [],
            sort_field: '_',
            error: null,
            details_modal: false,
            manu_goals_modal: false,
            manu_goals_data: [],
            manu_lines_modal: false,
            manu_lines_data: [],
            simple: props.simple || false,
            user:'',
            currentPage: 0,
            previousPage: 0,
            pageSize: props.simple ? 4 : 20,
            pagesCount: 0,
            filters: {
                'keyword': '',
                'ingredients': [],
                'products': [],
                'formula' : [],
            },
            filterChange: false,
            ingredients: [], 
            product_lines: []
        };
        if(localStorage != null){
            if(localStorage.getItem("jwtToken")!= null){
                this.state.user = jwt_decode(localStorage.getItem("jwtToken")).username;
            }
        }
        this.toggle = this.toggle.bind(this);
        this.onFilterValueSelection = this.onFilterValueSelection.bind(this);
        this.onFilterValueChange = this.onFilterValueChange.bind(this);
        this.onDetailViewSubmit = this.onDetailViewSubmit.bind(this);
        this.onSort = this.onSort.bind(this);
        this.handlePageClick=this.handlePageClick.bind(this);
        this.onSelect = this.onSelect.bind(this)
        this.onBulkManuLineSubmit = this.onBulkManuLineSubmit.bind(this);
        this.setInitPages();
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
            case Constants.manu_lines_modal:
                if(this.state.selected_items.length == 0){
                    alert("You must select at least one SKU to bulk edit manufacturing lines!");
                    return;
                }
                this.setState({manu_lines_modal: !this.state.manu_lines_modal})
                break;
        }
    }   

    async componentDidMount() {
        if (this.props.default_ing_filter !== undefined){
            await this.onFilterValueSelection([{ value: { _id : this.props.default_ing_filter._id }}], null, 'ingredients');
        }
        if( this.props.default_formula_filter !== undefined){
            await this.onFilterValueSelection([{ value: { _id : this.props.default_formula_filter._id }}], null, 'formula');
        }
        this.loadDataFromServer();
    }

    async componentDidUpdate (prevProps, prevState) {
        if (this.state.filterChange) {
            await this.loadDataFromServer();
        }
    }

    updateDataState = async () => {
        var {data: ingredients} = await SubmitRequest.submitGetData(Constants.ingredients_page_name);
        var {data: productlines} = await SubmitRequest.submitGetData(Constants.prod_line_page_name);
        this.setState({ingredients: ingredients, product_lines: productlines});
    }


    async loadDataFromServer() {
        let allData = await SubmitRequest.submitGetData(this.state.page_name);
        var final_ing_filter = this.state.filters['ingredients'].join(',');
        var final_keyword_filter = this.state.filters['keyword'];
        var final_prod_line_filter = this.state.filters['products'].join(',');
        console.log(final_prod_line_filter);
        var final_formula_filter = this.state.filters['formula'].join(',');
        console.log(final_formula_filter);
        //Check how the filter state is being set 
        if (final_ing_filter === '') final_ing_filter = '_';
        if (final_keyword_filter === '') final_keyword_filter = '_';
        if (final_prod_line_filter === '') final_prod_line_filter = '_';
        if (final_formula_filter === '') final_formula_filter = '_';
        var resALL = await SubmitRequest.submitGetFilterData(Constants.sku_filter_path, 
            this.state.sort_field, final_ing_filter, final_keyword_filter, 0, 0, final_prod_line_filter, final_formula_filter);
        await this.checkCurrentPageInBounds(resALL);
        var res = await SubmitRequest.submitGetFilterData(Constants.sku_filter_path, 
            this.state.sort_field, final_ing_filter, final_keyword_filter, this.state.currentPage, this.state.pageSize, final_prod_line_filter, final_formula_filter); 
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

    async checkCurrentPageInBounds(dataResAll){
        var prev = this.state.previousPage;
        //there is no data. update the current index stuff
        if (dataResAll === undefined || !dataResAll.success) {
            this.setState({
                currentPage: 0,
                previousPage: prev,
                pagesCount: 0,
            });
        }
        else{
            //there is some sort of data response
            var dataLength = dataResAll.data.length;
            var curCount = Math.ceil(dataLength/Number(this.state.pageSize));
            if(curCount != this.state.pagesCount){
                //number pages changed.
                if(this.state.currentPage>= curCount){
                    //previous index out of bounds. want to set the index to be 0.
                    this.setState({
                        currentPage: 0,
                        previousPage: prev,
                        pagesCount: curCount,
                    }); 
                }
                else{
                    //the number of pages has changed but the index is still in bounds.
                    //don't need to page change here.
                    this.setState({
                        pagesCount: curCount,
                    }); 
                }
            }
        }

    }


    async setInitPages(){
        let allData = await SubmitRequest.submitGetData(this.state.page_name);
        var curCount = 0;
        if(allData!=undefined){
            if(allData.data!=undefined){
                 curCount = Math.ceil(allData.data.length/Number(this.state.pageSize));
            }
        }
        this.setState({
            currentPage: 0,
            previousPage: 0,
            pagesCount: curCount,
        }); 
    }

    onFilterValueChange = (e, value, filterType) => {
        console.log(this.state.filters)
        var filters = this.state.filters;
        if(filterType == 'keyword'){
            filters[filterType] = value;
        }
        this.setState({filters: filters, filterChange: true}) ;
    }

    handlePageClick = (e, index) => {
        e.preventDefault();
        this.setState({
            currentPage: index
        });
        this.loadDataFromServer();
    }

    onFilterValueSelection (vals, e, type)  {
        var filters = this.state.filters;
        filters[type] = []
        vals.map((item) => {
            filters[type].push(item.value._id);
        })
        this.setState({
            filters: filters,
            filterChange: true
        });
    }

    async onCreateNewItem() {
        var new_item = await ItemStore.getEmptyItem(this.state.page_name);
        var new_formula_item = await ItemStore.getEmptyItem(Constants.formulas_page_name);
        const newData = this.state.data.slice();
        newData.push(new_item);

        //for the pagination stuff
        const newExportData = this.state.exportData.slice();
        newExportData.push(new_item);

        this.setState({ 
            data: newData,
            exportData: newExportData,
            detail_view_item: new_item,
            detail_view_formula_item: new_formula_item,
            detail_view_options: [Constants.details_create, Constants.details_delete, Constants.details_cancel],
            detail_view_action: Constants.details_create
        })
        this.toggle(Constants.details_modal);
        this.loadDataFromServer();

    }

    onTableOptionSelection = async(e, opt) => {
        if (this.state.selected_items.length === 0) {
            alert('You must select items to use these features!')
            return
        }
        switch (opt){
            case Constants.create_item:
                this.onCreateNewItem();
                break;
            case Constants.add_to_manu_goals:
                await this.onAddManuGoals();
                break;
            case Constants.edit_manu_lines:
                this.toggle(Constants.manu_lines_modal);
                break;
        }
    }

    onAddManuGoals =  async() => {
        this.toggle(Constants.manu_goals_modal);
        let res = await SubmitRequest.submitGetManuGoalsData(this.state.user);
        this.setState({ manu_goals_data: res.data});
    }

    async onBulkManuLineSubmit(event, opt, skus) {
        var newSkus = Object.assign([], this.state.data);
        switch (opt){
            case Constants.details_save:
                await skus.map(async (sku) => {
                    newSkus[newSkus.findIndex(el => el._id === sku._id)] = sku;
                    var res = await SubmitRequest.submitUpdateItem(Constants.skus_page_name, sku);
                    console.log(res)
                });
                break;
            case Constants.details_cancel:
                break;
        }
        this.setState({ data: newSkus });
        this.loadDataFromServer();
        this.toggle(Constants.manu_lines_modal);
    }

    async onSort(event, sortKey) {
        await this.setState({sort_field: sortKey})
        this.loadDataFromServer();
    };

    onSelect = async (rowIndexes) => {
        if(rowIndexes == 'all'){
            var indexes = []
            for(var i = 0; i < this.state.data.length; i ++){
                indexes.push(i);
            }
            await this.setState({selected_items: this.state.data, selected_indexes: indexes});
            return;
        }
        else if(rowIndexes == 'none'){
            rowIndexes = [];
        }
        console.log(rowIndexes);
        var newState = [];
        rowIndexes.forEach( index => {
            newState.push(this.state.data[index]);
        });
        await this.setState({ selected_items: newState, selected_indexes: rowIndexes});
    };

     onDetailViewSelect = async (event, item) => {
        let formula_item = await SubmitRequest.submitGetFormulaByID(item.formula._id);
        console.log("this is the ondetailview: "+JSON.stringify(formula_item));
        this.setState({
            detail_view_item: item,
            detail_view_formula_item: formula_item.data[0]
        });
        if(currentUserIsAdmin().isValid){
            this.setState({ 
            detail_view_options: [Constants.details_save, Constants.details_delete, Constants.details_cancel],
            detail_view_action: Constants.details_edit
            });
        }
        else{
            this.setState({ 
                detail_view_options: [Constants.details_cancel],
                detail_view_action: Constants.details_view
                });
        }
        this.toggle(Constants.details_modal);
    };

    async onDetailViewSubmit(event, item, formula_item, option) {
        console.log("made it to the ondetailviewsubmit");
        // var res = {};
        var resItem = {};
        var resFormula = {};
        var newData = this.state.data.splice();
        console.log("this is the item  state."+ JSON.stringify(item));

        switch (option) {
            case Constants.details_create:
                newData.push(item);
                //need to create the new formula and get the id of the newly created formula and then put that in the 
                //item equal to the formula section of item.
                console.log("this is the formula_item: "+JSON.stringify(formula_item));
                resFormula = await SubmitRequest.submitCreateItem(Constants.formulas_page_name, formula_item);

                // var newSKUitem = this.formatNewSKUFormula(item, resFormula);
                console.log(resFormula)
                if(resFormula.success){
                    item['formula']= resFormula.data._id;
                    resItem = await SubmitRequest.submitCreateItem(this.state.page_name, item);
                } 
                else {
                    resItem = { success: false, error: 'Formula Quantity is not entered correctly'}
                }

                break;
            case Constants.details_save:
                let toSave = newData.findIndex(obj => {return obj._id === item._id});
                newData[toSave] = item;
                resFormula = await SubmitRequest.submitUpdateItem(Constants.formulas_page_name, formula_item);
                resItem = await SubmitRequest.submitUpdateItem(this.state.page_name, item, this);
                
                console.log("this is the save res."+ JSON.stringify(resItem));
                console.log("this is the save res."+ JSON.stringify(resFormula));


                break;
            case Constants.details_delete:
                let toDelete = newData.findIndex(obj => {return obj._id === item._id});
                newData.splice(toDelete, 1);
                resItem = await SubmitRequest.submitDeleteItem(this.state.page_name, item);
                // console.log(resItem)
                // let activities_to_delete = resItem.data.activities
                // console.log(activities_to_delete)
                // activities_to_delete.map(async(act) => {
                //     let resAct = await SubmitRequest.submitDeleteItem(Constants.manu_activity_page_name, act)
                //     console.log(resAct)
                // })
                break;
            case Constants.details_cancel:
                resItem = {success: true}
                break;
        }
        console.log(resItem)
        if (!resItem.success) alert(resItem.error);
        else {
            this.setState({ 
                data: newData,
                detail_view_item: null,
                detail_view_formula_item: null,
                detail_view_options: [],
                detail_view_action: ''
            });
            this.loadDataFromServer();
            this.toggle(Constants.details_modal);
        }
    }

    getButtons = () => {
        return (
        <div className = "ingbuttons"> 
            {(this.props.default_ing_filter !== undefined || this.props.default_formula_filter !== undefined) ? null : 
                            (<div className = "manugoalbutton hoverable"
                            onClick={() => this.onTableOptionSelection(null, Constants.add_to_manu_goals)}
                            primary={true}
                            > {Constants.add_to_manu_goals} </div>)}
            {(this.props.default_ing_filter !== undefined || this.props.default_formula_filter !== undefined) || !currentUserIsAdmin().isValid ? null : 
                            (<div className = "manulinebutton hoverable"
                            onClick={() => this.onTableOptionSelection(null, Constants.edit_manu_lines)}
                            primary={true}
                            > {Constants.edit_manu_lines} </div>)}
            {(this.props.default_ing_filter !== undefined || this.props.default_formula_filter !== undefined) ? null : (<ExportSimple data = {this.state.exportData} fileTitle = {this.state.page_name}/> )}   
        </div>
        );
    }

    render() {

        return (
            <div className="list-page">
            {this.props.default_ing_filter === undefined && this.props.default_formula_filter === undefined ? <GeneralNavBar></GeneralNavBar> : null}
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
                        showDetails = {this.props.simple !=undefined ? !this.props.simple : true}
                        selectable = {this.props.simple !=undefined ? !this.props.simple : true}
                        sortable = {this.props.simple != undefined ? !this.props.simple : true}
                        title = {this.state.page_title}
                        showHeader = {true}
                        simple = {this.props.simple}
                        filters = {this.state.filters}
                        table_options = {this.state.table_options}
                        onTableOptionSelection = {this.onTableOptionSelection}
                        onFilterValueSelection = {this.onFilterValueSelection}
                        onFilterValueChange = {this.onFilterValueChange}
                        onRemoveFilter = {this.onRemoveFilter}
                        ingredients = {this.state.ingredients}
                        products = {this.state.product_lines}
                        onTableOptionSelection = {this.onTableOptionSelection}
                    />
                </div>
                <Modal isOpen={this.state.details_modal} toggle={this.toggle} id="popup" className='item-details'>
                    <SkuDetails
                            item={this.state.detail_view_item}
                            formula_item={this.state.detail_view_formula_item}
                            detail_view_options={this.state.detail_view_options}
                            detail_view_action = {this.state.detail_view_action}
                            handleDetailViewSubmit={this.onDetailViewSubmit}
                        />
                </Modal>
                <AddToManuGoal 
                    selected_skus={this.state.selected_items} 
                    isOpen={this.state.manu_goals_modal} 
                    toggle={(toggler) => this.toggle(toggler)} 
                    manu_goals_data={this.state.manu_goals_data}
                /> 
                <BulkEditManuLines
                    selected_skus={this.state.selected_items} 
                    isOpen={this.state.manu_lines_modal} 
                    toggle={(toggler) => this.toggle(toggler)} 
                    handleBulkManuLineSubmit={this.onBulkManuLineSubmit}
                /> 
                <TablePagination
                    currentPage = {this.state.currentPage}
                    pagesCount = {this.state.pagesCount}
                    handlePageClick = {this.handlePageClick}
                    getButtons = {this.getButtons}
                />
            </div>
        );
    }
}

ListPage.propTypes = {
    default_ing_filter: PropTypes.object,
    default_formula_filter: PropTypes.object,
}