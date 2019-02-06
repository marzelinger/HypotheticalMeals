import React, { Component } from 'react';
import 'whatwg-fetch';
import ProductLineList from './ProductLineList';
import ProductLineForm from './ProductLineForm';
import * as Constants from './../resources/Constants';
import SubmitRequest from './../helpers/SubmitRequest';
import '../style/ManufacturingGoalsBox.css'
const jwt_decode = require('jwt-decode');

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
  }

  onChangeText = (e) => {
    const newState = { ...this.state };
    newState[e.target.name] = e.target.value;
    this.setState(newState);
  }

  onUpdateProdLine = async (id) => {
    console.log('updating line')
    const oldProdLine = this.state.data.find(c => c._id === id);
    if (!oldProdLine) return;
    await this.setState({
        name: oldProdLine.name,
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
      alert('You cannot delete this product line, it is still used by skus');
      return;
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
    }
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
    let item = { name };
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
      let res = await SubmitRequest.submitGetFilterData(Constants.sku_filter_path, '_', '_', '_', '_', '_', prod_line._id);
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

  render() {
    return (
      <div className="goalsbox">
            <h1 id = "manufacturing_goals_title">{Constants.product_line_title}</h1>
        <div className="goals">
          <ProductLineList
            data={this.state.data}
            handleDeleteProdLine={this.onDeleteProdLine}
            handleUpdateGoal={this.onUpdateProdLine}
          />
        </div>
        <div className="form">
          <ProductLineForm
            name={this.state.name}
            handleChangeText={this.onChangeText}
            handleSubmit={this.submitProdLine}
          />
        </div>
        {this.state.error && <p>{this.state.error}</p>}
      </div>
    );
  }
}

export default ProductLinesBox;