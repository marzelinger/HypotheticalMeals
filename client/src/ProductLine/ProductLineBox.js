import React, { Component } from 'react';
import 'whatwg-fetch';
import ProductLineList from './ProductLineList';
import ProductLineForm from './ProductLineForm';
// import '../style/ProductLineBox.css';
import * as Constants from '../resources/Constants';
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

  onDeleteProdLine = (id) => {
    if(!this.checkValidDelete(id)){
      alert('You cannot delete this product line, it is still used by skus');
      return;
    }
    const i = this.state.data.findIndex(c => c._id === id);
    const data = [
      ...this.state.data.slice(0, i),
      ...this.state.data.slice(i + 1),
    ];
    this.setState({ data });
    fetch(`api/products/${id}`, { method: 'DELETE' })
      .then(res => res.json()).then((res) => {
        if (!res.success) this.setState({ error: res.error });
      });
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

  submitNewProdLine = () => {
    const { name } = this.state;
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name}),
    }).then(res => res.json()).then((res) => {
      if (!res.success) this.setState({ error: res.error.message || res.error });
      else this.setState({ name: '', error: null });
    });
  }

  submitUpdatedProdLine = () => {
    const { name,updateId} = this.state;
    fetch(`/api/products/${updateId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    }).then(res => res.json()).then((res) => {
      if (!res.success) this.setState({ error: res.error.message || res.error });
      else this.setState({ name: '', error: null });
    });
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

  loadSkusforLines = async (all_prod_lines) => {
    var prod_lines = [];
    for( const prod_line of all_prod_lines ){ 
      var skus = await fetch(`/api/skus_filter/_/_/_/_/_/${prod_line._id}`, {method: 'GET'})
      .then(data => data.json())
      .then((res) => {
        if (!res.success) this.setState({ error: res.error });
        else return res.data;
      });
      var prod_line_with_sku = {
        ...prod_line,
        skus: skus
      }
      prod_lines.push(prod_line_with_sku);
    };
    return prod_lines;
  }

  loadProdLinesFromServer = async() => {
    // fetch returns a promise. If you are not familiar with promises, see
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
    let all_prod_lines = await fetch(`/api/products`)
      .then(data => data.json())
      .then((res) => {
        if (!res.success) this.setState({ error: res.error });
        else return res.data;
      });
      var prod_lines = await this.loadSkusforLines(all_prod_lines);
      await this.setState({data: prod_lines});
  }

  render() {
    return (
      <div className="container">
        <div className="prodlines">
          <h2>Current Product Lines:</h2>
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