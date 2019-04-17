import React, { Component } from 'react';
import 'whatwg-fetch';
import ProductLineList from './ProductLineList';
import * as Constants from '../../resources/Constants';
import SubmitRequest from '../../helpers/SubmitRequest';
import '../../style/ManufacturingGoalsBox.css'
import ExportSimple from '../export/ExportSimple';
import addButton from '../../resources/add.png';
import ProductLineDetails from './ProductLineDetails';

class ProductLinesBox extends Component {
  constructor() {
    super();
    this.state = {
      data: [],
      error: null,
      name: ''
    };
    this.pollInterval = null;
    this.submitNewProdLine = this.submitNewProdLine.bind(this);
    this.onDeleteProdLine = this.onDeleteProdLine.bind(this);
    this.loadProdLinesFromServer = this.loadProdLinesFromServer.bind(this);
    this.submitUpdatedProdLine = this.submitUpdatedProdLine.bind(this);
    this.handleDetailViewSubmit = this.handleDetailViewSubmit.bind(this);
  }

  onChangeText = (e) => {
    const newState = { ...this.state };
    newState[e.target.name] = e.target.value;
    this.setState(newState);
  }

  onUpdateProdLine = async (id, name) => {
    console.log('updating line')
    const oldProdLine = this.state.data.find(c => c._id === id);
    if (!oldProdLine) return;
    await this.setState({
        name: name || oldProdLine.name,
        updateId: id
    });
    this.submitUpdatedProdLine();
  }

  checkValidDelete = (id) => {
    console.log('delete ' + id);
    var allowed = true;
    this.state.data.forEach((item) => {
      console.log(item._id);
      if(item._id == id && item.skus.length > 0){
        console.log('here');
        allowed =  false;
      }
    })
    return allowed;
  }

  async onDeleteProdLine(id) {
    if(!this.checkValidDelete(id)){
      alert('This product line is being used by one or more SKUs. You cannot delete a product line being used by a SKU.');
      return false;
    }
    const i = this.state.data.findIndex(c => c._id === id);
    let item = this.state.data[i];
    const data = [
      ...this.state.data.slice(0, i),
      ...this.state.data.slice(i + 1),
    ];
    this.setState({ data });
    
    let res = await SubmitRequest.submitDeleteItem(Constants.prod_line_page_name, item);
    if (!res.success) {
      this.setState({ error: res.error });
      return false;
    }
    return true;
  }

  submitProdLine = (e) => {
    e.preventDefault();
    const { name, updateId } = this.state;
    if (!name) return;
    if (updateId) {
      this.submitUpdatedProdLine();
    } else {
      this.submitNewProdLine();
    }
  }

  async submitNewProdLine() {
    const { name } = this.state;
    let res = await SubmitRequest.submitCreateItem(Constants.prod_line_page_name, { name });
    if (!res.success) {
      this.setState({ error: res.error });
    }
    else {
      this.setState({ name: '', error: null });
    }
  }

  async submitUpdatedProdLine() {
    const { name, updateId } = this.state;
    let item = { name, _id: updateId };
    console.log(name);
    let res = await SubmitRequest.submitUpdateItem(Constants.prod_line_page_name, item);
    if (!res.success) {
      this.setState({ error: res.error});
    }
    else {
      this.setState({ name: '', error: null })
    }
  }

  componentDidMount() {
    this.loadProdLinesFromServer();
    if (!this.pollInterval) {
      this.pollInterval = setInterval(this.loadProdLinesFromServer, 2000);
    }
  }

  componentWillUnmount() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.pollInterval = null;
  }

  async loadSkusforLines(all_prod_lines) {
    var prod_lines = [];
    for( const prod_line of all_prod_lines ){ 
      let res = await SubmitRequest.submitGetFilterData(Constants.sku_filter_path, '_', '_', '_', '_', '_', prod_line._id, '_');
      if (!res.success) {
        this.setState({ error: res.error});
      }
      else {
        var skus = res.data;
      }
      var prod_line_with_sku = {
        ...prod_line,
        skus: skus
      }
      prod_lines.push(prod_line_with_sku);
    };
    return prod_lines;
  }

  async loadProdLinesFromServer() {
    let res = await SubmitRequest.submitGetData(Constants.prod_line_page_name);
    if (!res.success) {
      this.setState({ error: res.error });
    }
    else {
      var all_prod_lines = res.data;
    }
    var prod_lines = await this.loadSkusforLines(all_prod_lines);
    await this.setState({data: prod_lines});
  }

  async handleDetailViewSubmit(event, item, option) {
    console.log(event)
    console.log(item)
    console.log(option)
    console.log(this.state)
    var newData = this.state.data;
    console.log(item);
    switch (option) {
        case Constants.details_create:
            newData.push(item);
            await this.setState({
              name: item.name,
            })
            this.submitNewProdLine();
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
              updateId: item._id
            })
            this.submitUpdatedProdLine();
            break;
        case Constants.details_delete:
          return await this.onDeleteProdLine(item._id)
    }
      await this.setState({ 
          data: newData,
      });
      this.loadProdLinesFromServer();
      return true;
  }

  

  render() {
    return (
      <div className="goalsbox">
            <h1 id = "manufacturing_goals_title">{''}</h1>
        <div className="goals">
          <ProductLineList
            data={this.state.data}
            handleDeleteProdLine={this.onDeleteProdLine}
            handleUpdateProdLine={this.onUpdateProdLine}
            handleDetailViewSubmit = {this.handleDetailViewSubmit}
            user = {this.props.user}
          />
        </div>
        <div className="form">
        <ProductLineDetails
                buttonImage = {addButton}
                handleDetailViewSubmit = {this.handleDetailViewSubmit}
                options = {[Constants.details_create]}
                user = {this.props.user}
                ></ProductLineDetails>
          <ExportSimple data = {this.state.data} fileTitle = {"productLines"}/> 

        </div>
        {this.state.error && <p>{this.state.error}</p>}
      </div>
    );
  }
}

export default ProductLinesBox;