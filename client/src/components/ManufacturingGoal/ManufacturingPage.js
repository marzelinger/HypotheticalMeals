import React from 'react';
import GeneralNavBar from '../GeneralNavBar';
import PageTable from '../ListPage/PageTable'
import ManufacturingGoalsBox from './Goals/ManufacturingGoalsBox'
import ManufacturingLineBox from './Lines/ManufacturingLineBox'
import * as Constants from '../../resources/Constants';
import '../../style/ManufacturingGoalsStyle.css';

export default class ManufacturingPage extends React.Component {
  render() {
    return (
      <div>
        <GeneralNavBar></GeneralNavBar>
        <ManufacturingGoalsBox></ManufacturingGoalsBox>
        <ManufacturingLineBox></ManufacturingLineBox>
      </div>
    );
  }
}