import React, { Component } from 'react';
import 'whatwg-fetch';
import ManufacturingLineList from './ManufacturingLineList';
import * as Constants from '../../../resources/Constants';
import SubmitRequest from '../../../helpers/SubmitRequest';
import '../../../style/ManufacturingGoalsBox.css'
import ExportSimple from '../../export/ExportSimple';

import PropTypes from "prop-types";
import addButton from '../../../resources/add.png';
import ItemStore from '../../../helpers/ItemStore';
const currentUserIsAdmin = require("../../auth/currentUserIsAdmin");


const jwt_decode = require('jwt-decode');

export default class ManufacturingLinesBox extends Component {
  constructor() {
    super();
    this.state = {
      data: [],
      error: null,
      name: '',
      short_name: '',
      comment: '',
      detail_view_action: '',
      detail_view_options: [],
      details_modal: false,
      selected_manu_line: {},
      //skus: []
    };
    this.pollInterval = null;
    this.submitNewManuLine = this.submitNewManuLine.bind(this);
    this.onDeleteManuLine = this.onDeleteManuLine.bind(this);
    //need this one?
    this.onUpdateManuLine = this.onUpdateManuLine.bind(this);
    this.loadManuLinesFromServer = this.loadManuLinesFromServer.bind(this);
    this.submitUpdatedManuLine = this.submitUpdatedManuLine.bind(this);
    this.handleDetailViewSubmit = this.handleDetailViewSubmit.bind(this);
    this.onDetailViewSelect = this.onDetailViewSelect.bind(this);
    this.updateSKUManuLines = this.updateSKUManuLines.bind(this);
    //this.setSKUSForManuLine = this.setSKUSForManuLine.bind(this);
  }

  onUpdateManuLine = async (id, name) => {
    console.log('updating line with id: '+id);

    const oldManuLine = this.state.data.find(c => c._id === id);
    if (!oldManuLine) return;
    await this.setState({
        name: name || oldManuLine.name,
        updateId: id
    });
    this.submitUpdatedManuLine();
  }

  async onDeleteManuLine(id) {
    const i = this.state.data.findIndex(c => c._id === id);
    let item = this.state.data[i];
    const data = [
      ...this.state.data.slice(0, i),
      ...this.state.data.slice(i + 1),
    ];
    this.setState({ data });
    
    let res = await SubmitRequest.submitDeleteItem(Constants.manu_line_page_name, item);
    if (!res.success) {
      this.setState({ error: res.error });
    }
  }

  async handleDetailViewSubmit(event, item, option) {
    var newData = this.state.data;
    console.log("item in detail submit: "+JSON.stringify(item));
    switch (option) {
        case Constants.details_create:
            newData.push(item);
            await this.setState({
              name: item.name,
              skus: item.skus,
              short_name: item.short_name,
              comment: item.comment
            })
            this.submitNewManuLine();
            break;
        case Constants.details_cancel:
            break;
        case Constants.details_exit:
            break;
        case Constants.details_save:
        //update manu line
          newData.push(item);
            await this.setState({
              name: item.name,
              skus: item.skus,
              short_name: item.short_name,
              comment: item.comment,
              updateId: item._id
            })
            this.submitUpdatedManuLine();
            break;
        case Constants.details_delete:
          //TODO CHECK THAT NO SKUS ASSOCIATED WITH THIS MANU LINE.  
          if(window.confirm("Deleting this manufacturing line will unschedule all activities scheduled to it. Are you sure you want to delete it?")){
              this.onDeleteManuLine(item._id)
              return true;
            }
            return false;
    }
      await this.setState({ 
          data: newData,
          detail_view_action: '',
          detail_view_options: [],
          details_modal: false,
          selected_manu_line: {}
      });
      console.log("this is the aaaaa sel_manu_line: "+JSON.stringify(this.state.selected_manu_line));
      this.loadManuLinesFromServer();
      return true;
  }

  // submitManuLine = (e) => {
  //   e.preventDefault();
  //   const { name, updateId } = this.state;
  //   if (!name) return;
  //   if (updateId) {
  //     this.submitUpdatedManuLine();
  //   } else {
  //     this.submitNewManuLine();
  //   }
  // }

  //TODO DOES THIS NEED TO BE BINDED
  validateUniqueShortName = async (short_name, manu_line_id) => {
    console.log("sn    "+short_name);
    console.log("manulineid    :"+manu_line_id);
    let res = await SubmitRequest.submitGetManufacturingLineByShortName(short_name);
    console.log("this is the res in shortname: "+JSON.stringify(res));
    if(res.success) {
      // if(!manu_line_id || manu_line_id != res.data[0]._id){
      if(manu_line_id === res.data[0]._id){
        console.log("true");
        return true;
      } 
    }
    return !res.success
  }

  async submitNewManuLine() {
    console.log("item skus")
    const { name, short_name, comment } = this.state;
    let res = await SubmitRequest.submitCreateItem(Constants.manu_line_page_name, { name, short_name, comment });
    if (!res.success) {
      this.setState({ error: res.error });
    }
    else {
      console.log("this is res. "+JSON.stringify(res));
      var updateRes = await this.updateSKUManuLines(res.data);
      if(!updateRes.success){
        this.setState({ error: updateRes.error });
      }
      else{
        this.setState({ name: '', error: null });
      }
    }  
}

  async updateSKUManuLines(manu_line){
    //need to check that the skus are not deleted. from the manu line if it was the only sku the manuline had.
    
    if(this.state.skus!=undefined){
      //need to go into these skus and add this manu_line
      for(let s = 0; s<this.state.skus.length; s++){
        var curSKU = this.state.skus[s];
        console.log("curSKU: "+ JSON.stringify(curSKU));
        //get the current sku, add the manu line to it, then update in db.
          var manu_lines = curSKU.manu_lines;
          manu_lines.push(manu_line._id);
          curSKU.manu_lines = manu_lines;
          console.log("cur SKU: "+ JSON.stringify(curSKU));

          let updateRes = await SubmitRequest.submitUpdateItem(Constants.skus_page_name, curSKU);
          console.log("updateRes: "+ JSON.stringify(updateRes));

          if(!updateRes.success){
            return {error: updateRes.error, success: false};
          }
          else{
            return{ name: '', error: null, success: true };

          }
      }
    }
  }



  async submitUpdatedManuLine() {
    const { name, short_name, comment, updateId } = this.state;
    let item = { name, short_name, comment, _id: updateId };
    console.log("this is the item: "+ JSON.stringify(item));
    console.log("this is the updateid; "+updateId);
    let res = await SubmitRequest.submitUpdateItem(Constants.manu_line_page_name, item);
    
    if (!res.success) {
      this.setState({ error: res.error });
    }
    else {
      console.log("this is res. "+JSON.stringify(res));
      var updateRes = await this.updateSKUManuLines(res.data);
      if(!updateRes.success){
        this.setState({ error: updateRes.error });
      }
      else{
        this.setState({ name: '', error: null });
      }
    }  
  }





  async componentDidMount() {
    this.loadManuLinesFromServer();
    //await this.setSKUSForManuLine();
    if (!this.pollInterval) {
      this.pollInterval = setInterval(this.loadManuLinesFromServer, 2000);
    }
  }




  componentWillUnmount() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.pollInterval = null;
  }

  async loadSkusforLines(all_manu_lines) {
    var manu_lines = [];
    for( const manu_line of all_manu_lines ){ 
      let res = await SubmitRequest.submitGetSKUsByManuLine(manu_line._id);
      console.log("this is the response in loadSKUS: "+ JSON.stringify(res));
      if (!res.success) {
        this.setState({ error: res.error});
      }
      else {

        var skus = res.data;
      }
      var manu_line_with_sku = {
        ...manu_line,
        skus: skus
      }
      manu_lines.push(manu_line_with_sku);
    };
    return manu_lines;
  }


  onDetailViewSelect = async (event, item) => {
    console.log("this is the item in the detail view select: "+JSON.stringify(item));
    if(currentUserIsAdmin().isValid){
        await this.setState({ 
        selected_manu_line: item,
        previous_skus: item.skus,
        details_modal: true,
        detail_view_action: Constants.details_edit,
        detail_view_options: [Constants.details_save, Constants.details_cancel]
        });
        console.log("this is the xxx sel_manu_line: "+JSON.stringify(this.state.selected_manu_line));

    }
    else{
        await this.setState({ 
            selected_manu_line: item,
            previous_skus: item.skus,
            details_modal: true,
            detail_view_action: Constants.details_view,
            detail_view_options: [Constants.details_exit]
            });
            console.log("this is the ttttt sel_manu_line: "+JSON.stringify(this.state.selected_manu_line));

    }
    console.log("this is the bbbbbb sel_manu_line: "+JSON.stringify(this.state.selected_manu_line));

};

  async loadManuLinesFromServer() {
    let res = await SubmitRequest.submitGetData(Constants.manu_line_page_name);
    if (!res.success) {
      this.setState({ error: res.error });
    }
    else {
      var all_manu_lines = res.data;
    }
    var manu_lines = await this.loadSkusforLines(all_manu_lines);
    await this.setState({data: manu_lines});
  }

  render() {
    return (
      <div className="goalsbox">
            <h1 id = "manufacturing_goals_title">{''}</h1>
        <div className="goals">
          <ManufacturingLineList
            data={this.state.data}
            handleDeleteManuLine={this.onDeleteManuLine}
            handleUpdateManuLine={this.onUpdateManuLine}
            handleReportSelect={this.props.handleManuScheduleReportSelect}
            handleDetailViewSelect = {this.onDetailViewSelect}
            handleDetailViewSubmit= {this.handleDetailViewSubmit}
            validateShortName = {this.validateUniqueShortName} 
                      />
        </div>
        <div className="form">
          <ExportSimple data = {this.state.data} fileTitle = {"manufacturingLines"}/> 
        </div>
        {/* {this.state.error && <p>{this.state.error}</p>} */}
      </div>
    );
  }
}

ManufacturingLinesBox.propTypes = {
  handleManuScheduleReportSelect: PropTypes.func,
  handleDetailViewSelect:PropTypes.func
};