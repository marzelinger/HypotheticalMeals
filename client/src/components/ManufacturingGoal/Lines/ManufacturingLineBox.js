import React, { Component } from 'react';
import 'whatwg-fetch';
import ManufacturingLineList from './ManufacturingLineList';
import * as Constants from '../../../resources/Constants';
import SubmitRequest from '../../../helpers/SubmitRequest';
import '../../../style/ManufacturingGoalsBox.css'
import ExportSimple from '../../export/ExportSimple';
import ManufacturingLineDetails from './ManufacturingLineDetails';
import PropTypes from "prop-types";
const jwt_decode = require('jwt-decode');

export default class ManufacturingLinesBox extends Component {
  constructor() {
    super();
    this.state = {
      data: [],
      error: null,
      name: '',
      short_name: '',
      comment: ''
    };
    this.pollInterval = null;
    this.submitNewManuLine = this.submitNewManuLine.bind(this);
    this.onDeleteManuLine = this.onDeleteManuLine.bind(this);
    this.loadManuLinesFromServer = this.loadManuLinesFromServer.bind(this);
    this.submitUpdatedManuLine = this.submitUpdatedManuLine.bind(this);
    this.handleDetailViewSubmit = this.handleDetailViewSubmit.bind(this);
  }

  onChangeText = (e) => {
    const newState = { ...this.state };
    newState[e.target.name] = e.target.value;
    this.setState(newState);
  }

  onUpdateManuLine = async (id, name) => {
    console.log('updating line')
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
    console.log(item);
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
    }
      this.setState({ 
          data: newData,
      });
      this.loadManuLinesFromServer();
      return true;
  }

  submitManuLine = (e) => {
    e.preventDefault();
    const { name, updateId } = this.state;
    if (!name) return;
    if (updateId) {
      this.submitUpdatedManuLine();
    } else {
      this.submitNewManuLine();
    }
  }

  validateUniqueShortName = async (short_name) => {
    console.log(short_name)
    let res = await SubmitRequest.submitGetManufacturingLineByShortName(short_name);
    console.log(res);
    return !res.success
  }

  async submitNewManuLine() {
    const { name, short_name, comment } = this.state;
    let res = await SubmitRequest.submitCreateItem(Constants.manu_line_page_name, { name, short_name, comment });
    if (!res.success) {
      this.setState({ error: res.error });
    }
    else {
      this.setState({ name: '', error: null });
    }
  }

  async submitUpdatedManuLine() {
    const { name, short_name, comment, updateId } = this.state;
    let item = { name,short_name, comment, _id: updateId };
    let res = await SubmitRequest.submitUpdateItem(Constants.manu_line_page_name, item);
    if (!res.success) {
      this.setState({ error: res.error});
    }
    else {
      this.setState({ name: '', error: null })
    }
  }

  componentDidMount() {
    this.loadManuLinesFromServer();
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
      let res = await SubmitRequest.submitGetFilterData(Constants.sku_filter_path, '_', '_', '_', '_', '_', '_', manu_line._id);
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
            <h1 id = "manufacturing_goals_title">{Constants.manu_line_title}</h1>
        <div className="goals">
          <ManufacturingLineList
            data={this.state.data}
            handleDeleteManuLine={this.onDeleteManuLine}
            handleUpdateManuLine={this.onUpdateManuLine}
            handleReportSelect={this.props.handleManuScheduleReportSelect}
          />
        </div>
        <div className="form">
          <ManufacturingLineDetails validateShortName = {this.validateUniqueShortName} handleDetailViewSubmit = {this.handleDetailViewSubmit}></ManufacturingLineDetails>
          <ExportSimple data = {this.state.data} fileTitle = {"manufacturingLines"}/> 
        </div>
        {this.state.error && <p>{this.state.error}</p>}
      </div>
    );
  }
}

ManufacturingLinesBox.propTypes = {
  handleManuScheduleReportSelect: PropTypes.func
};