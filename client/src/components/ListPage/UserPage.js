// IngredientsPage.js
// Riley
// Ingredients view

import React from 'react';
import PropTypes from 'prop-types';
import PageTable from './PageTable'
import SubmitRequest from '../../helpers/SubmitRequest'
import UserDetails from './UserDetails'
import { 
    Modal, ModalHeader} from 'reactstrap';
import * as Constants from '../../resources/Constants';
import './../../style/SkusPage.css';
import './../../style/UserTableStyle.css';
import DataStore from '../../helpers/DataStore'
import TablePagination from './TablePagination'
import printFuncFront from '../../printFuncFront';
import GeneralNavBar from '../GeneralNavBar';
import AuthRoleValidation from "../auth/AuthRoleValidation";
import { connect } from "react-redux";

import { setCurrentUser, logoutUser, getAllUsers } from "../../actions/authActions";


const jwt_decode = require('jwt-decode');


class UserPage extends React.Component {
    constructor(props) {
        super(props);

        let {
            page_name, 
            page_title, 
            table_columns, 
            table_properties, 
            table_options } = DataStore.getUserData();
  

        this.state = {
            page_name,
            page_title,
            table_columns,
            table_properties,
            table_options,
            selected_items: [],
            selected_indexes: [],
            detail_view_item: null,
            detail_view_options: [],
            data: [],
            exportData: [],
            sort_field: '_',
            error: null,
            modal: false,
            simple: props.simple || false,
            user:'',
            currentPage: 0,
            previousPage: 0,
            pageSize: 20,
            pagesCount: 0,
            filters: {
                'keyword': ''
            },
            filterChange: false,
            current_user: {},
            token: ''

        };
        if(localStorage != null){
            if(localStorage.getItem("jwtToken")!= null){
              this.state.user = jwt_decode(localStorage.getItem("jwtToken")).id;
            }
        }
        this.toggleModal = this.toggleModal.bind(this);
        this.onFilterValueSelection = this.onFilterValueSelection.bind(this);
        this.onFilterValueChange = this.onFilterValueChange.bind(this);
        this.onDetailViewSubmit = this.onDetailViewSubmit.bind(this);
        this.onSort = this.onSort.bind(this);
        this.handlePageClick=this.handlePageClick.bind(this);
        this.determineUser = this.determineUser.bind(this);
        this.determineUser();
        this.setInitPages();
    }

    toggleModal(){
        this.setState({
            modal: !this.state.modal
        });
    }   


    async determineUser() {
        var res = await AuthRoleValidation.determineUser();
        if(res!=null){
            var user = res.user;
            var token = res.token;
            await this.setState({
                current_user: user,
                token: token
            })
        }
    }

    async componentDidMount() {
        await this.loadDataFromServer();
    }

    async componentDidUpdate (prevProps, prevState) {
        if(localStorage != null){
            if(localStorage.getItem("jwtToken")!= null){
                var token = localStorage.getItem("jwtToken");
                if(this.state.token!=null){
                    if(this.state.token != token){
                        await this.determineUser();
                    }
                }
            }
        }
        
        if(this.state.current_user._id != AuthRoleValidation.getUserID()){
            await this.determineUser();
        }
        if (this.state.filterChange) {
            await this.loadDataFromServer();
        }
    }

    updateDataState = async() => {
        //var {data: users} = await SubmitRequest.submitGetData(Constants.users_page_name);
        //this.setState({users: users});
    }

    async loadDataFromServer() {
        var final_keyword_filter = this.state.filters['keyword'];
        var final_users_filter = '_';

        if (final_keyword_filter === '') final_keyword_filter = '_';
        if (final_users_filter === '') final_users_filter = '_';
        printFuncFront("here in loadDataFromServer");
        var resALL = await SubmitRequest.submitGetFilterData(Constants.users_filter_path, 
            this.state.sort_field, final_users_filter, final_keyword_filter, 0, 0);

        await this.checkCurrentPageInBounds(resALL);
        var res = await SubmitRequest.submitGetFilterData(Constants.users_filter_path, 
            this.state.sort_field, final_users_filter, final_keyword_filter, this.state.currentPage, this.state.pageSize);
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

    onFilterValueChange = (e, value, filterType) => {
        var filters = this.state.filters;
        if(filterType == 'keyword'){
            filters[filterType] = value;
        }
        this.setState({filters: filters, filterChange: true}) ;
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


    handlePageClick = (e, index) => {
        e.preventDefault();
        this.setState({
            currentPage: index
        });
        this.loadDataFromServer();
    }


    onFilterValueChange = (e, value, filterType) => {
        var filters = this.state.filters;
        if(filterType == 'keyword'){
            filters[filterType] = value;
        }
        this.setState({filters: filters, filterChange: true}) ;
    }

    onFilterValueSelection (vals, e, type)  {
        var filters = this.state.filters;
        filters[type] = vals.map((item) => {
            return item.value._id
        })
        
        this.setState({
            filters: filters,
            filterChange: true
        });
    }

    async onCreateNewItem() {
    }

    onTableOptionSelection = (e, opt) => {
        switch (opt){
            // case Constants.create_item:
            //     this.onCreateNewItem();
            //     break;
            // // case Constants.add_user_filter:
            //     this.onAddFilter(Constants.user_label);
            //     break;
            case Constants.add_keyword_filter:
                this.onAddFilter(Constants.keyword_label);
                break;
        }
    }

    async onSort(event, sortKey) {
        await this.setState({sort_field: sortKey})
        this.loadDataFromServer();
    };

    onSelect = (rowIndexes) => {
        var newState = [];
        rowIndexes.forEach( index => {
            newState.push(this.state.data[index]);
        });
        //this.setState({ selected_items: newState, selected_indexes: rowIndexes});
    };

    onDetailViewSelect = (event, item) => {
        if(AuthRoleValidation.checkRole(this.state.current_user, Constants.admin)){
            printFuncFront("This is the new item being saved: "+JSON.stringify(item));
            this.setState({ 
            detail_view_item: item ,
            detail_view_options: [Constants.details_save, Constants.details_delete, Constants.details_cancel]
            });
        }
        else{
            this.setState({ 
                detail_view_item: item ,
                detail_view_options: [Constants.details_cancel]
                });
        }
        this.toggleModal();
    };

    async onDetailViewSubmit(event, item, option) {
        console.log(item)
        var res = {};
        var newData = this.state.data.splice();
        console.log("new data: "+JSON.stringify(newData));
        var curUser = await AuthRoleValidation.determineUser();
        switch (option) {
            // case Constants.details_create:
            //     newData.push(item);
            //     res = await SubmitRequest.submitCreateItem(this.state.page_name, item, this);
            //     break;
            case Constants.details_save:
                let toSave = newData.findIndex(obj => {return obj._id === item._id});
                newData[toSave] = item;
                console.log("new data222: "+JSON.stringify(newData));
                res = await SubmitRequest.submitUpdateItem(this.state.page_name, item, this);
                console.log("res in save: "+JSON.stringify(res));
                break;
            case Constants.details_delete:
                let toDelete = newData.findIndex(obj => {return obj._id === item._id});
                newData.splice(toDelete, 1);
                res = await SubmitRequest.submitDeleteItem(this.state.page_name, item, this);
                //check if yourself was deleted.
                if(curUser.name == item.name){
                    console.log('NEED TO LOUGOUT PERSON.');
                    this.props.logoutUser();
                }
                break;
            case Constants.details_cancel:
                res = {success: true}
                break;
        }
        if (!res.success) alert(res.error);
        else {
            this.setState({ 
                data: newData,
                detail_view_item: null,
                detail_view_options: []
            });
            this.loadDataFromServer();
            this.toggleModal();
        }
    }

    getButtons = () => {
        return (
        <div className = "usersbuttons">     
        </div>
        );
    }

    render() {
        return (
            <div className="list-page">
                        <GeneralNavBar title={Constants.UserTitle}></GeneralNavBar>
                <div className = 'user-table'>
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
                        showHeader = {true}
                        selectable = {false}
                        simple = {this.props.simple}
                        filters = {this.state.filters}
                        table_options = {this.state.table_options}
                        onTableOptionSelection = {this.onTableOptionSelection}
                        onFilterValueSelection = {this.onFilterValueSelection}
                        onFilterValueChange = {this.onFilterValueChange}
                        onRemoveFilter = {this.onRemoveFilter}
                        skus = {this.state.skus}
                        onTableOptionSelection = {this.onTableOptionSelection}
                        page_name= {this.state.page_name}
                        user = {this.state.current_user}
                    />
                </div>
                <Modal isOpen={this.state.modal} toggle={this.toggleModal} id="popup" className='item-details'>
                    <ModalHeader toggle={this.toggleModal}>User Details</ModalHeader>
                    <UserDetails
                            item={this.state.detail_view_item}
                            detail_view_options={this.state.detail_view_options}
                            handleDetailViewSubmit={this.onDetailViewSubmit}
                            user = {this.state.current_user}
                        />
                </Modal>   
                <TablePagination
                 currentPage = {this.state.currentPage}
                 pagesCount = {this.state.pagesCount}
                 handlePageClick = {this.handlePageClick}
                 getButtons = {this.getButtons}
                >
                </TablePagination>
            </div>
        );
    }

}

UserPage.propTypes = {
    default_users_filter: PropTypes.object,
    logoutUser: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
    auth: state.auth
  });
  
  
  export default connect(
    mapStateToProps,
    { logoutUser }
  )(UserPage);