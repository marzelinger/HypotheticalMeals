import React, { Component } from 'react';
import 'whatwg-fetch';
import ProductLineList from './ProductLineList';
import ProductLineForm from './ProductLineForm';
import '../style/ManufacturingGoalsBox.css';
import * as Constants from '../resources/Constants';


class ProductLineBox extends Component {
  constructor() {
    super();
    this.state = {
      data: [],
      error: null,
      name: '',
      skus: [],
      user: Constants.DEFAULT_USER
    };
    this.pollInterval = null;
  }

  onChangeText = (e) => {
    const newState = { ...this.state };
    newState[e.target.name] = e.target.value;
    this.setState(newState);
  }

  onUpdateProductLine = (id) => {
    const oldPL = this.state.data.find(c => c._id === id);
    if (!oldPL) return;
    this.setState({
        name: oldPL.name,
        skus: oldPL.skus,
        updateId: id,
        user: Constants.DEFAULT_USER
    });
  }

  onDeleteProductLine= (id) => {
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

  submitProductLine = (e) => {
    e.preventDefault();
    const { name, updateId } = this.state;
    if (!name) return;
    if (updateId) {
      this.submitUpdatedProductLine();
    } else {
      this.submitNewProductLine();
    }
  }

  submitNewProductLine = () => {
    const { name, skus, user } = this.state;
    const data = [
      ...this.state.data,
      {
          name,
          _id: Date.now().toString(),
          skus: [],
          user: Constants.DEFAULT_USER
      },
    ];
    this.setState({ data });
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, skus, user }),
    }).then(res => res.json()).then((res) => {
      if (!res.success) this.setState({ error: res.error.message || res.error });
      else this.setState({ name: '', skus: '', user: '', error: null });
    });
  }

  submitUpdatedProductLine = () => {
    const { name, skus, user, updateId } = this.state;
    fetch(`/api/products/${updateId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, skus, user }),
    }).then(res => res.json()).then((res) => {
      if (!res.success) this.setState({ error: res.error.message || res.error });
      else this.setState({ name: '', skus: '', user: '', error:null });
    });
  }

  componentDidMount() {
    this.loadProductLinesFromServer();
    if (!this.pollInterval) {
      this.pollInterval = setInterval(this.loadProductLinesFromServer, 2000);
    }
  }

  componentWillUnmount() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.pollInterval = null;
  }

  loadProductLinesFromServer = () => {
    // fetch returns a promise. If you are not familiar with promises, see
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
    fetch('/api/products')
      .then(data => data.json())
      .then((res) => {
        if (!res.success) this.setState({ error: res.error });
        else this.setState({ data: res.data });
      });
  }

  render() {
    return (
      <div className="container">
        <div className="product_lines">
          <h2>Current Product Lines:</h2>
          <ProductLineList
            data={this.state.data}
            handleDeleteProductLine={this.onDeleteProductLine}
            handleUpdateProductLine={this.onUpdateProductLine}
          />
        </div>
        <div className="form">
          <ProductLineForm
            name={this.state.name}
            user={this.state.user}
            skus={this.state.skus}
            handleChangeText={this.onChangeText}
            handleSubmit={this.submitProductLine}
          />
        </div>
        {this.state.error && <p>{this.state.error}</p>}
      </div>
    );
  }
}

export default ProductLineBox;