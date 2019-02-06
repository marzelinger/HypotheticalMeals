import React from 'react';
import GeneralNavBar from './GeneralNavBar';
import PageTable from './ListPage/PageTable'
import ManufacturingGoalsBox from './ManufacturingGoalsBox'
import * as Constants from '../resources/Constants';
import '../style/ManufacturingGoalsStyle.css';

export default class ManufacturingGoalsPage extends React.Component {
  render() {
    return (
      <div>
        <ManufacturingGoalsBox></ManufacturingGoalsBox>
      </div>
    );
  }
}