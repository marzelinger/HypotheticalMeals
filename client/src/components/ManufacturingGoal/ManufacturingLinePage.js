import React from 'react';
import GeneralNavBar from '../GeneralNavBar';
import PageTable from '../ListPage/PageTable'
import ManufacturingLineBox from './Lines/ManufacturingLineBox'
import * as Constants from '../../resources/Constants';
import '../../style/ManufacturingGoalsStyle.css';

export default class ManufacturingLinePage extends React.Component {
  render() {
    return (
      <div>
        <ManufacturingLineBox></ManufacturingLineBox>
      </div>
    );
  }
}
