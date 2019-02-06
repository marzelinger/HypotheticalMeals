import React from 'react';
import * as Constants from './../resources/Constants';
import './../style/ManufacturingGoalsStyle.css';
import ProductLineBox from './ProductLineBox';

export default class ProductLinePage extends React.Component {
  render() {
    return (
      <div>
        <h1 id = "product_line_title">{Constants.product_line_title}</h1>
        <ProductLineBox></ProductLineBox>
      </div>
    );
  }
}