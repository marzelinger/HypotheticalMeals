import React from 'react';
import * as Constants from '../../resources/Constants';
import '../../style/ManufacturingGoalsStyle.css';
import ProductLineBox from './ProductLineBox';
import GeneralNavBar from '../GeneralNavBar';

export default class ProductLinePage extends React.Component {
  render() {
    return (
      <div>
        <GeneralNavBar></GeneralNavBar>
        <ProductLineBox></ProductLineBox>
        
      </div>
    );
  }
}