import React from 'react';
import GeneralNavBar from './GeneralNavBar';
import SkusPage from './ListPage/SkusPage'
import * as Constants from '../resources/Constants';
// import '../style/PageStyle.css';

export default class GeneralPage extends React.Component {
  render() {
    return (
      <div>
        <GeneralNavBar>
        </GeneralNavBar>
        <SkusPage>
        </SkusPage>
      </div>
    );
  }
}