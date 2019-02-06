// ListPage.js
// Riley
// Larger page component to be shown in PageTemplate
// THIS PAGE IS DEPRICATED

import React from 'react';
import PropTypes from 'prop-types';
import Filter from './Filter';
import PageTable from './PageTable'
import TableOptions from './TableOptions'
import SubmitRequest from '../../helpers/SubmitRequest'
import ItemStore from '../../helpers/ItemStore'
import AddToManuGoal from './AddToManuGoal'
import { 
    Alert,
    Modal} from 'reactstrap';
import * as Constants from '../../resources/Constants';
import './../../style/SkusPage.css';
import ExportSimple from '../export/ExportSimple';
import DataStore from '../../helpers/DataStore'
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import SkuDetails from './SkuDetails';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
const jwt_decode = require('jwt-decode');


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
            ing_substr: [],
            filter_value: [],
            filter_category: [],
            assisted_search_results: [[]],
            table_columns,
            table_properties,
            table_options,
            selected_items: [],
            selected_indexes: [],
            detail_view_item: {},
            detail_view_options: [],
            data: [],
            exportData: [],

            sort_field: '_',
            error: null,
            details_modal: false,
            manu_goals_modal: false,
            manu_goals_data: [],
            simple: props.simple || false,
            user:'',
            currentPage: 0,
            pageSize: 2,
            pagesCount: 0
        };
        if(localStorage != null){
            if(localStorage.getItem("jwtToken")!= null){
              this.state.user = jwt_decode(localStorage.getItem("jwtToken")).id;
            }
          }
        this.toggle = this.toggle.bind(this);
        this.onFilterValueSelection = this.onFilterValueSelection.bind(this);
        this.onKeywordSubmit = this.onFilterValueSubmit.bind(this);
        this.onDetailViewSubmit = this.onDetailViewSubmit.bind(this);
        this.onSort = this.onSort.bind(this);
        this.handlePageClick=this.handlePageClick.bind(this);
        this.setNumberPages();
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

    async componentDidMount() {
        if (this.props.default_ing_filter !== undefined){
            await this.onAddFilter(Constants.ingredient_label)
            await this.onFilterValueSelection(undefined, this.props.default_ing_filter, 0);
        }
        this.loadDataFromServer();
    }

    async componentDidUpdate (prevProps, prevState) {
        console.log(this.state.data)
        if (prevState.ing_substr !== this.state.ing_substr || prevState.filter_value !== this.state.filter_value || 
            prevState.filter_category !== this.state.filter_category) {
            await this.updateFilterState(prevState);
            this.loadDataFromServer();
            console.log(this.state.data)
        }
    }

    async updateFilterState(prevState) {
        var asr = this.state.assisted_search_results.slice();
        for (var i = 0; i < prevState.ing_substr.length; i++) {
            if (this.state.filter_category[i] === undefined) return;
            if (this.state.ing_substr[i] === undefined) return;
            if (this.state.filter_category[i] === Constants.ingredient_label
                && this.state.ing_substr[i].length > 0) {
                let res = await SubmitRequest.submitGetIngredientsByNameSubstring(this.state.ing_substr[i]);
                if (res === undefined || !res.success) {
                    res.data = [];
                }
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
        let allData = await SubmitRequest.submitGetData(this.state.page_name);
        if (this.state.filter_value === undefined) return;
        var final_ing_filter = '';
        var final_keyword_filter = '';
        var final_prod_line_filter = '';
        for (var i = 0; i < this.state.filter_value.length; i++){
            if (this.state.filter_value[i] === undefined) return;
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
            this.state.sort_field, final_ing_filter, final_keyword_filter, this.state.currentPage, this.state.pageSize, final_prod_line_filter);

            var resALL = await SubmitRequest.submitGetFilterData(Constants.sku_filter_path, 
                this.state.sort_field, final_ing_filter, final_keyword_filter, 0, allData.data.length, final_prod_line_filter);

                console.log("this is the res: "+res);
                console.log("this is the res.data: "+res.data);
        
        if (res === undefined || !res.success) {
            res.data = [];
            resALL.data = [];
        }
        this.setState({
            data: res.data,
            exportData: resALL.data

        })
    }

    onFilterValueChange = (e, id) => {
        var ing_sub = this.state.ing_substr.slice();
        ing_sub[id] = e.target.value;
        this.setState({
            ing_substr: ing_sub
        });
    }

    async setNumberPages(){
        let allData = await SubmitRequest.submitGetData(this.state.page_name);
        console.log('this is the allData: '+allData);
        console.log('this is the allData length: '+allData.data.length);
        console.log('this is the pageSize: '+this.state.pageSize);
        var curCount = Math.ceil(allData.data.length/Number(this.state.pageSize));
        console.log('this is the pagesCount1: '+this.state.pagesCount);

        this.setState({
            currentPage: 0,
            pagesCount: curCount,
        }); 
               console.log('this is the pagesCount: '+this.state.pagesCount);

    }

    handlePageClick = (e, index) => {
        e.preventDefault();
        console.log("this is current page1; "+this.state.currentPage);

        this.setState({
            currentPage: index
        });
        this.loadDataFromServer();
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

    async onCreateNewItem() {
        var item = await ItemStore.getEmptyItem(this.state.page_name);
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
        if (type == Constants.keyword_label && this.state.filter_category.includes(Constants.keyword_label)){
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
        let res = await SubmitRequest.submitGetManuGoalsData(this.state.user);
        this.setState({ manu_goals_data: res.data});
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
        this.toggle(Constants.details_modal);
    };

    async onDetailViewSubmit(event, item, option) {
        var res = {};
        switch (option) {
            case Constants.details_create:
                res = await SubmitRequest.submitCreateItem(this.state.page_name, item, this);
                break;
            case Constants.details_save:
                res = await SubmitRequest.submitUpdateItem(this.state.page_name, item, this);
                break;
            case Constants.details_delete:
                res = await SubmitRequest.submitDeleteItem(this.state.page_name, item, this);
                break;
            case Constants.details_cancel:
                res = {success: true}
                break;
        }
        console.log(res)
        if (!res.success) alert(res.error);
        else {
            this.setState({ 
                detail_view_item: null,
                detail_view_options: []
            });
            this.loadDataFromServer();
            this.toggle(Constants.details_modal);
        }
    }

    onPropChange = (value, item, prop) => {
        var newData = this.state.data.slice();
        var ind = newData.indexOf(item);
        newData[ind][prop] = value;
        this.setState({ data: newData });
    };

    render() {


        console.log("This is the curpage value; "+this.state.currentPage);
         console.log("this is the pagesCount: " +this.state.pagesCount); 

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
                        selected_indexes = {this.state.selected_indexes}
                        handleSort={this.onSort}
                        handleSelect={this.onSelect}
                        handleDetailViewSelect={this.onDetailViewSelect}
                        showDetails = {this.props.simple !=undefined ? !this.props.simple : true}
                        selectable = {this.props.simple !=undefined ? !this.props.simple : true}
                        sortable = {this.props.simple != undefined ? !this.props.simple : true}
                        title = {this.state.page_title}
                    />
                </div>
                <Modal isOpen={this.state.details_modal} toggle={this.toggle} id="popup" className='item-details'>
                    <SkuDetails
                            item={this.state.detail_view_item}
                            detail_view_options={this.state.detail_view_options}
                            handlePropChange={this.onPropChange}
                            handleDetailViewSubmit={this.onDetailViewSubmit}
                        />
                    <Alert
                        value={this.state.error}
                        color='danger'/>
                </Modal>
                <AddToManuGoal selected_skus={this.state.selected_items} isOpen={this.state.manu_goals_modal} toggle={(toggler) => this.toggle(toggler)} manu_goals_data={this.state.manu_goals_data}></AddToManuGoal>
                <ExportSimple data = {this.state.exportData} fileTitle = {this.state.page_name}/>     

                <div className = "pagination-wrapper">
                <Pagination aria-label="Page navigation example">
            
            <PaginationItem disabled={this.state.currentPage <= 0}>
              
              <PaginationLink
                onClick={e => this.handlePageClick(e, this.state.currentPage - 1)}
                previous
                href="#"
              />

</PaginationItem>

{[...Array(this.state.pagesCount)].map((page, i) => 
  <PaginationItem active={i === this.state.currentPage} key={i}>
    <PaginationLink onClick={e => {
        //this.handlePageClick(e, i)
        this.setState({
            currentPage: i
        });
        this.loadDataFromServer();     
    }
 } href="#">
      {i + 1}
    </PaginationLink>
  </PaginationItem>
)}


<PaginationItem disabled={this.state.currentPage >= this.state.pagesCount - 1}>
              
              <PaginationLink
                onClick={e => this.handlePageClick(e, this.state.currentPage + 1)}
                next
                href="#"
              />
              
            </PaginationItem>
            
          </Pagination>
                </div>  








            </div>
        );
    }
}

ListPage.propTypes = {
    default_ing_filter: PropTypes.object
}