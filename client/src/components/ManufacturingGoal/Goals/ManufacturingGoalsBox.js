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
        console.log(jwt_decode(localStorage.getItem("jwtToken")).username);
      }
    }

    this.pollInterval = null;
    this.submitNewGoal = this.submitNewGoal.bind(this);
    this.onDeleteGoal = this.onDeleteGoal.bind(this);
    this.loadGoalsFromServer = this.loadGoalsFromServer.bind(this);
    this.submitUpdatedGoal = this.submitUpdatedGoal.bind(this);
    this.onDetailViewSubmit = this.onDetailViewSubmit.bind(this);
    this.onSort = this.onSort.bind(this);
    this.toggle = this.toggle.bind(this);
    this.onDetailViewSubmit = this.onDetailViewSubmit.bind(this);
  }

  onChangeText = (e) => {
    const newState = { ...this.state };
    newState[e.target.name] = e.target.value;
    this.setState(newState);
  }

  onUpdateGoal = async (id,new_name) => {
    console.log('updating goal')
    console.log(new_name);
    const oldGoal = this.state.data.find(c => c._id === id);
    if (!oldGoal) return;
    await this.setState({
        name: new_name || oldGoal.name,
        activities: oldGoal.activities,
        updateId: id,
        enabled: oldGoal.enabled,
        deadline: oldGoal.deadline
    });
    
    this.submitUpdatedGoal();
  }

  async onDeleteGoal(id) {
    const i = this.state.data.findIndex(c => c._id === id);
    let item = this.state.data[i];
    const data = [
      ...this.state.data.slice(0, i),
      ...this.state.data.slice(i + 1),
    ];
    this.setState({ data });

    let res = await SubmitRequest.submitDeleteItem(Constants.manugoals_page_name, item);
    if (!res.success) {
      this.setState({ error: res.error });
    }
    else {
      //need to delete all the activities associated with this goal.
      console.log("this is the item: "+JSON.stringify(item));
      if(item.activities!=undefined) {
        //activities to delete
        for(let a = 0; a<item.activities.length; a++){
          var deleteActRes = await SubmitRequest.submitDeleteItem(Constants.manu_activity_page_name, item);
        }
        if(!deleteActRes.success){
          this.setState({ error: deleteActRes.error });
        }
      }
    }
    return res.success;
  }

  submitGoal = (e) => {
    console.log('in submit goal')
    e.preventDefault();
    const { name, updateId } = this.state;
    if (!name) return;
    if (updateId) {
      this.submitUpdatedGoal();
    } else {
      this.submitNewGoal();
    }
  }

  submitUpdateActivity = async(activities) => {
    let created_activities = [];
    for(const activity of activities) {
      try{
        let new_activity;
        if(!activity._id){
          let new_activity = await SubmitRequest.submitCreateItem('manuactivities', activity);
          created_activities.push(new_activity.data)
        }
        else {
          console.log("caught existing");
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
    for(const activity of activities) {
      try{
        if(!activity._id){
          let response = await SubmitRequest.submitDeleteItem('manuactivities', activity);
        }
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
    console.log('submitting new goal')
    const { name, activities, user, deadline } = this.state;
    console.log(user);
    let created_activities = await this.submitNewActivity(activities);
    let res = await SubmitRequest.submitCreateItem(Constants.manugoals_page_name, { name, activities:created_activities, user, deadline });
    if (!res.success) {
      console.log('not a success')
      this.setState({ error: res.error });
    }
    else {
      this.setState({ name: '', activities: [], error: null });
    }
    return res;
  }



  async submitUpdatedGoal() {
    let old_activities = this.state.detail_view_old_activities;
    let created_activities=[];
    console.log("old_activities: "+JSON.stringify(old_activities));
    const { name, activities, user, updateId, enabled, deadline} = this.state;
    console.log("activities: "+JSON.stringify(activities));
    //might need to go through all of the activities to see if they exist correctly.

    option 1:
    if(old_activities==undefined && activities == undefined){
      //no new activities;
      //no old activities
      //don't need to do anything.
      created_activities=[]
    }
    else if (old_activities==undefined && activities!=undefined){
      //new activities;
      created_activities = await this.submitUpdateActivity(activities);
    }
    else if(old_activities!=undefined && activities== undefined){
      //want to delete the old activities
      //need to go through and delete the old activities
      await this.submitDeleteActivity(activities);
      created_activities = [];
    }
    else {
      //both old activities and new activities. check the lengths of the two.
      //maybe go through and delete each of the old activities and then create a new one for each
      //new activity need to go through the old ones and see if they match
      await this.submitDeleteActivity(old_activities);
      created_activities = await this.submitUpdateActivity(activities);
    }

    //option 2:
    //go through each activity and check if a goal contains it.
    var all_activities = await SubmitRequest.submitGetData(Constants.manu_activity_page_name);
    var all_goals = await SubmitRequest.submitGetData(Constants.manugoals_page_name);

    // if(all_activities.success){
    //   if(all_activities.data!=undefined){
    //     if(all_goals.success){
    //       if(all_goals.data!=undefined){
    //         for(let act = 0; act<all_activities.data.length; act++){
    //           //check that the activity belongs to a goal.
    //           //if the activity belongs to this goal, make sure it is updated correctly.
    //           for(let goal = 0; goal<all_goals.data.length; goal++){
    //             //if this activity belongs to a goal that isn't the current goal, just continue
    //             if(all_goals.data[goal].activities!=undefined){
    //               for(let goal_act = 0; goal_act<all_goals.data[goal].activities.length; goal_act++){
    //                 //go through the goals activities and then check if the activity is the one you are checking with
    //                 if(all_goals.data[goal].activities[goal_act]._id == all_activities.data[act]._id){
    //                   //this goal_act is equal to this activity
    //                   if(all_goals.data[goal]._id!=this.state.detail_view_item._id){
    //                     //this is a different goal and a different activity.
    //                     continue;
    //                   }
    //                   else{
    //                     //this goal is the detail view goal and it includes the current activity.
    //                     //need to check that the activity is the right stuff.
    //                     //need to check that the activity is in the new goal update.
    //                     //we know that this activity corresponds to this goal.
    //                     //check that this activity has the right stuff in it for the "new_activities."
    //                     if(activities!=undefined){
    //                       for(let new_act = 0; new_act<activities.length; new_act++){
    //                         //CHECK THE SYNTAX HERE.
    //                         if(activities[new_act]._id == all_activities.data[act]._id){
    //                           //the activities are the same just continue
    //                           //activities.splice(new_act, 1);
    //                           created_activities.push(activities[new_act]._id);
    //                           continue;
    //                         }
    //                       }
    //                       //the matching activity not found in the new activities. delete this activity then
    //                       await this.submitDeleteActivity([all_activities.data[act]]);

    //                     }
    //                   }
    //                 }
    //               }
    //             }
    //           }
    //         }
    //       }
    //     }
    //   }
    // }

    //go through the left over activities and create them
    created_activities = await this.submitUpdateActivity(activities);





    // let created_activities = await this.submitUpdateActivity(activities);
    console.log(created_activities);
    let item = { name, activities: created_activities, user, enabled, deadline };
    let res = await SubmitRequest.submitUpdateGoal(user, updateId, item);
    if (!res.success) {
      console.log(res.error);
      this.setState({ error: res.error});
    }
    else {
      console.log("load goals from server")
      this.setState({ name: '', activities: '', enabled: false, error: null })
      this.loadGoalsFromServer();
    }
    return res;
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
    console.log(this.state.page_name)
    var res = await SubmitRequest.submitGetData(`${this.state.page_name}/${this.state.sort_field}`);
    if (!res.success) {
      this.setState({ error: res.error });
    }
    else {
      this.setState({ data: res.data})
    }
  }

  async onDetailViewSubmit(event, item, option) {
    console.log('here')
    var newData = this.state.data;
    console.log(item);
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
          if(this.item.enabled){
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
            var response = await this.submitUpdatedGoal();
            console.log(response)
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
    console.log('toggle')
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
      console.log(`${hours}:${minutes}`);
      var dateString = `${yyyymmdd}`
      item.deadline = dateString;
    }
    console.log(item);
    await this.setState({
        detail_view_item: item,
        detail_view_old_activities: item.activities
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
    console.log("detail old: "+JSON.stringify(this.state.detail_view_old_activities));
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