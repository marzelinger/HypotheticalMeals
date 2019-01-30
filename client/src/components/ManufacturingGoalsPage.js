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
        <h1 id = "manufacturing_goals_title">{Constants.MANUFACTURING_TITLE}</h1>
        <ManufacturingGoalsBox></ManufacturingGoalsBox>
      </div>
    );
  }
}