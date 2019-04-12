import React, { Component } from 'react';
import 'whatwg-fetch';
import ManufacturingGoalList from './ManufacturingGoalList';
import ManufacturingGoalForm from './ManufacturingGoalForm';
import '../../../style/ManufacturingGoalsBox.css';
import * as Constants from '../../../resources/Constants';
import SubmitRequest from '../../../helpers/SubmitRequest';
import ManufacturingGoalDetails from './ManufacturingGoalDetails';
import ItemStore from '../../../helpers/ItemStore';
import TextField from 'material-ui/TextField';
import SearchIcon from 'material-ui/svg-icons/action/search'
import addButton from '../../../resources/add.png';
import TablePagination from '../../ListPage/TablePagination';
import PageTable from '../../ListPage/PageTable';
import { 
  Button,
  Input,
  FormGroup,
  Label,
  Modal, FormFeedback } from 'reactstrap';
import DataStore from '../../../helpers/DataStore';
import AuthRoleValidation from '../../auth/AuthRoleValidation';
const jwt_decode = require('jwt-decode');

class ManufacturingGoalsBox extends Component {
  constructor() {
    super();
    let {
      page_name, 
      table_columns, 
      table_properties, 
      table_options,  } = DataStore.getGoalData();

    this.state = {
      page_title: 'Manufacturing Goals',
      selected_items: [],
      table_columns,
      table_properties,
      table_options,
      page_name,
      data: [],
      activities: [],
      error: null,
      name: '',
      user: '',
      enabled: false,
      date: '',
      sort_field:'_',
      details_modal: false,
      detail_view_options: [],
      detail_view_action: '',
      detail_view_item: {},
      detail_view_old_activities: []
    };
    if(localStorage != null){
      if(localStorage.getItem("jwtToken")!= null){
        this.state.user = jwt_decode(localStorage.getItem("jwtToken")).username;
      }
    }

    this.pollInterval = null;
    this.submitNewGoal = this.submitNewGoal.bind(this);
    this.onDeleteGoal = this.onDeleteGoal.bind(this);
    this.loadGoalsFromServer = this.loadGoalsFromServer.bind(this);
    this.submitUpdatedGoal = this.submitUpdatedGoal.bind(this);
    this.onSort = this.onSort.bind(this);
    this.toggle = this.toggle.bind(this);
    this.onDetailViewSubmit = this.onDetailViewSubmit.bind(this);
  }

  onChangeText = (e) => {
    const newState = { ...this.state };
    newState[e.target.name] = e.target.value;
    this.setState(newState);
  }

  // onUpdateGoal = async (id,new_name) => {
  //   console.log('updating goal')
  //   console.log(new_name);
  //   const oldGoal = this.state.data.find(c => c._id === id);
  //   if (!oldGoal) return;
  //   await this.setState({
  //       name: new_name || oldGoal.name,
  //       activities: oldGoal.activities,
  //       updateId: id,
  //       enabled: oldGoal.enabled,
  //       deadline: oldGoal.deadline
  //   });
    
  //   this.submitUpdatedGoal();
  // }

  async onDeleteGoal(id) {
    const i = this.state.data.findIndex(c => c._id === id);
    let item = this.state.data[i];
    const data = [
      ...this.state.data.slice(0, i),
      ...this.state.data.slice(i + 1),
    ];
    this.setState({ data });

    let goal_to_delete = await SubmitRequest.submitGetManuGoalByID(item._id);
    if (!goal_to_delete.success) {
      this.setState({ error: res.error });
    }
    //need to delete all the activities associated with this goal.
    // console.log("this is the item in delete goal: "+JSON.stringify(item));
    if(goal_to_delete.data.activities!=undefined) {
      //activities to delete
      for(let a = 0; a<goal_to_delete.data.activities.length; a++){
        //CHECK THE SYNTAX HERE.
        var deleteActRes = await SubmitRequest.submitDeleteItem(Constants.manu_activity_page_name, goal_to_delete.data.activities[a]);

        if(!deleteActRes.success){
          this.setState({ error: deleteActRes.error });
          return deleteActRes;
        }
      }
    }
    let res = await SubmitRequest.submitDeleteItem(Constants.manugoals_page_name, item);
    console.log("res from delete manugoal: "+JSON.stringify(res));
    if (!res.success) {
      this.setState({ error: res.error });
    }
    return res.success;
  }

  // submitGoal = (e) => {
  //   console.log('in submit goal')
  //   e.preventDefault();
  //   const { name, updateId } = this.state;
  //   if (!name) return;
  //   if (updateId) {
  //     this.submitUpdatedGoal();
  //   } else {
  //     this.submitNewGoal();
  //   }
  // }

  submitUpdateActivity = async(activities) => {
    console.log("updating activities length: "+JSON.stringify(activities.length));
    let created_activities = [];
    for(const activity of activities) {
      try{
        let new_activity;
        if(!activity._id){
          let new_activity = await SubmitRequest.submitCreateItem('manuactivities', activity);
          created_activities.push(new_activity.data)
        }
        else {
          let updated_activity = await SubmitRequest.submitUpdateItem('manuactivities', activity);
          created_activities.push(updated_activity.data)
        }
      } catch (e){
        console.log(e);
      }
    }
    return created_activities;
  }

  submitDeleteActivity = async(activities) => {
    console.log("activities to delete .length: "+JSON.stringify(activities.length));
    for(const activity of activities) {
      try{
        console.log("this is the activity: "+JSON.stringify(activity));
        let response = await SubmitRequest.submitDeleteItem('manuactivities', activity);
        console.log("deleted activity: "+JSON.stringify(response));
        
      } catch (e){
        console.log(e);
      }
    }
  }

  submitNewActivity = async(activities) => {
    let created_activities = [];
    for(const activity of activities) {
      try{
        let new_activity = await SubmitRequest.submitCreateItem('manuactivities', activity);
        created_activities.push(new_activity.data)
      } catch (e){
        console.log(e);
      }
    }
    return created_activities;
  }

  async submitNewGoal() {
    const { name, activities, user, deadline } = this.state;
    let created_activities = await this.submitNewActivity(activities);
    let res = await SubmitRequest.submitCreateItem(Constants.manugoals_page_name, { name, activities:created_activities, user, deadline });
    if (!res.success) {
      this.setState({ error: res.error });
    }
    else {
      this.setState({ name: '', activities: [], error: null });
    }
    return res;
  }



  async submitUpdatedGoal(item) {
    // console.log("these are the old_activities from details: "+JSON.stringify(deleted_activities.length));
    let created_activities=[];
    const { name, activities, user, updateId, enabled, deadline} = this.state;
    console.log("activities: "+JSON.stringify(activities.length));
    //might need to go through all of the activities to see if they exist correctly.

    // //go through each activity and check if a goal contains it.
    let old_goal = await SubmitRequest.submitGetManuGoalByID(item._id);
    if (!old_goal.success) {
      console.log('not a success')
      this.setState({ error: old_goal.error });
      return old_goal;
    }
    else {
      console.log("old_goal: "+JSON.stringify(old_goal.data.length));
      if(old_goal.data.activities==undefined){
        console.log("old_goals undefined activities");
        if(activities==undefined){
          //no old activities and no new activities
          created_activities = [];
        }
        else if (activities!=undefined){
          //new activities and no old activities.
          created_activities = await this.submitUpdateActivity(activities);
        }
      }
      else if(old_goal.data.activities!=undefined){
        //old goals exist.
        console.log("old_goals activities length: "+JSON.stringify(old_goal.data.activities.length));
        if(activities == undefined){
          console.log("new activities undefined: ");

          //old activities but no current activities. 
          //delete all the old ones.
          await this.submitDeleteActivity(old_goal.data.activities);
        }
        else if (activities !=undefined){
          console.log("new activities length: "+JSON.stringify(activities.length));

          //there are old activities and new activities.
          //delete all the old ones, create all the new ones.
          await this.submitDeleteActivity(old_goal.data.activities);
          created_activities = await this.submitUpdateActivity(activities);
        }
      }
      // let created_activities = await this.submitUpdateActivity(activities);
      console.log("created_activities.length: "+JSON.stringify(created_activities.length));
      let item = { name, activities: created_activities, user, enabled, deadline };
      let res = await SubmitRequest.submitUpdateGoal(user, updateId, item);
      if (!res.success) {
        console.log(res.error);
        this.setState({ error: res.error});
      }
      else {
        this.setState({ name: '', activities: '', enabled: false, error: null })
        this.loadGoalsFromServer();
      }
      return res;
    }
  }



  componentDidMount() {
    this.loadGoalsFromServer();
    if (!this.pollInterval) {
      this.pollInterval = setInterval(this.loadGoalsFromServer, 1000);
    }
  }

  componentWillUnmount() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.pollInterval = null;
  }

  async loadGoalsFromServer() {
    var res = await SubmitRequest.submitGetData(`${this.state.page_name}/${this.state.sort_field}`);
    if (!res.success) {
      this.setState({ error: res.error });
    }
    else {
      this.setState({ data: res.data})
    }
  }

  async onDetailViewSubmit(event, item, option) {
    var newData = this.state.data;
    switch (option) {
        case Constants.details_create:
        await this.setState({
          name: item.name,
          activities: item.activities,
          deadline: item.deadline
        })
        var response = await this.submitNewGoal();
        return response;

        case Constants.details_delete:
          if(item.enabled){
            alert("You cannot delete an enabled manufacturing goal.");
            return false;
          }
          if(window.confirm("Deleting this manufacturing goal will remove all activities associated with it from the schedule. Are you sure you want to delete this goal?")){
            await this.setState({
              name: item.name,
              activities: [],
            })  
            this.onDeleteGoal(item._id)
              return true;
            }
            return false;
        case Constants.details_save:
            await this.setState({
              name: item.name,
              activities: item.activities,
              updateId: item._id,
              enabled: item.enabled,
              deadline: item.deadline
          });
            var response = await this.submitUpdatedGoal(item);
            return response;
        case Constants.details_cancel:
          break;
        case Constants.details_exit:
            break;
    }
      this.setState({ 
          data: newData,
      });
      this.loadGoalsFromServer();
      this.toggle();
  }

  onTableOptionSelection = async(e, opt) => {
    if (this.state.selected_items.length === 0 && opt!=Constants.create_item) {
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

  onFilterValueChange = (e, value, filterType) => {
    var filters = this.state.filters;
    filters[filterType] = value;
    this.setState({filters: filters, filterChange: true}) ;
  }

  async onSort(event, sortKey) {
    await this.setState({sort_field: sortKey})
    this.loadGoalsFromServer();
  };

  toggle = () => {
    this.setState({details_modal: !this.state.details_modal});
  };

  pad(n, length) {
    let s = '' + n;
    while(s.length < length){
        s = '0' + s;
    }
    return s;
  }

  async onCreateNewItem() {
    var new_item = await ItemStore.getEmptyItem(this.state.page_name);
    const newData = this.state.data.slice();
    newData.push(new_item);

    // //for the pagination stuff
    // const newExportData = this.state.exportData.slice();
    // newExportData.push(new_item);

    this.setState({ 
        data: newData,
        // exportData: newExportData,
        detail_view_item: new_item,
        detail_view_options: [Constants.details_create, Constants.details_cancel],
        detail_view_action: Constants.details_create,
        detail_view_old_activities: []
    })
    this.toggle(Constants.details_modal);
    this.loadGoalsFromServer();
}

  onTableOptionSelection = async(e, opt) => {
    if (this.state.selected_items.length === 0 && opt!=Constants.create_item) {
        alert('You must select items to use these features!')
        return
    }
    switch (opt){
        case Constants.create_item:
            this.onCreateNewItem();
            break;
    }
}

  onDetailViewSelect = async (event, item) => {

    //NEED TO CHECK WHAT OPTIONS TO PUT BASED ON THE USER.
    if(item.deadline != " "){
      var deadline = new Date(item.deadline)
      var localDate = deadline
      var day = localDate.getDate();
      var month = localDate.getMonth(); 
      var year = localDate.getFullYear();
      var yyyymmdd = this.pad(year, 4) +  "-" + this.pad(month + 1, 2) + "-" + this.pad(day, 2);
      var hours = this.pad(''+localDate.getHours(), 2);
      var minutes = this.pad(''+localDate.getMinutes(), 2);
      var dateString = `${yyyymmdd}`
      item.deadline = dateString;
    }
    var old_acts = item.activities;
    await this.setState({
        detail_view_item: item,
        detail_view_old_activities: old_acts
    });
    if((AuthRoleValidation.checkRole(this.props.user, Constants.business_manager) && item.user ==this.props.user.username) || AuthRoleValidation.checkRole(this.props.user, Constants.admin)){
        await this.setState({ 
        detail_view_options: [Constants.details_save, Constants.details_delete, Constants.details_cancel],
        detail_view_action: Constants.details_edit,
        });
    }
    else{
        await this.setState({ 
            detail_view_options: [Constants.details_exit],
            detail_view_action: Constants.details_view,
            });
    }
    this.toggle();
};

  render() {
    return (
      <div className="list-page">
          <div className = "goals-table">
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
                  selectable = {false}
                  sortable = {true}
                  page_name = {this.state.page_name}
                  title = {this.state.page_title}
                  showLoading = {false}
                  showHeader = {true}
                  simple = {false}
                  filters = {[]}
                  table_options = {this.state.table_options}
                  onTableOptionSelection = {this.onTableOptionSelection}
                  user = {this.props.user}
                  showCalculator = {true}
              />
          </div>
          <div className = 'goal-sku-table'>
          <Modal  isOpen={this.state.details_modal} toggle={this.toggle} id="popup" className='item-details'>
              <ManufacturingGoalDetails
              toggle = {this.toggle}
              item = {this.state.detail_view_item}
              buttonImage = {addButton}
              handleDetailViewSubmit = {this.onDetailViewSubmit}
              detail_view_options = {this.state.detail_view_options}
              user = {this.props.user}
              old_activities= {this.state.detail_view_old_activities}
              ></ManufacturingGoalDetails>
          </Modal>
          </div>
          <TablePagination
              currentPage = {this.state.currentPage}
              pagesCount = {this.state.pagesCount}
              handlePageClick = {this.handlePageClick}
              getButtons = {this.getButtons}
          />
      </div>
    )
  }
}

export default ManufacturingGoalsBox;

    // return (
    //   <div className = "goalsbox">
    //   <h1 id = "manufacturing_goals_title">{''}</h1>
    //   <div className = "searches">
    //   {this.state.isAdmin.isValid ? 
    //   (<div className = "searchfield">
    //   <SearchIcon style = {{width: '20px', height: '20px'}}></SearchIcon>
    //   <TextField
    //     hintText="Username Search"
    //     onChange = {(e, val) => this.onFilterValueChange(e, val, 'username')}
    //   />
    //   </div>) : <div></div>
    //   }
    //   <div className = "searchfield">
    //   <SearchIcon style = {{width: '20px', height: '20px'}}></SearchIcon>
    //   <TextField
    //     hintText="Goal Name Search"
    //     onChange = {(e, val) => this.onFilterValueChange(e, val, 'name')}
    //   />
    //   </div>
    //   </div>
    //     <div className="goals">

    //       <ManufacturingGoalList
    //         data={this.state.data}
    //         handleDeleteGoal={this.onDeleteGoal}
    //         handleUpdateGoal={this.onUpdateGoal}
    //         handleDetailViewSubmit = {this.onDetailViewSubmit}
    //       />
    //     </div>
    //     <div className="form">
    //       <ManufacturingGoalDetails
    //       buttonImage = {addButton}
    //       handleDetailViewSubmit = {this.onDetailViewSubmit}
    //       options = {[Constants.details_create, Constants.details_cancel]}
    //       ></ManufacturingGoalDetails>
    //     </div>
    //     {this.state.error && <p>{this.state.error}</p>}
    //   </div>
    // );