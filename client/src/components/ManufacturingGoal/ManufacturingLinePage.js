import React from 'react';
import GeneralNavBar from '../GeneralNavBar';
import PageTable from '../ListPage/PageTable'
import ManufacturingLineBox from './Lines/ManufacturingLineBox'
import * as Constants from '../../resources/Constants';
import '../../style/ManufacturingGoalsStyle.css';
import SubmitRequest from '../../helpers/SubmitRequest';
import { Modal } from 'reactstrap';
import ManuLineDetails from './Lines/ManufacturingLineDetails';

import ManufacturingScheduleReportDetails from './ManufacturingScheduleReportDetails';
import { exportManuScheduleReport} from "../../actions/ManufacturingScheduleReport";
const jwt_decode = require('jwt-decode');
const currentUserIsAdmin = require("../../components/auth/currentUserIsAdmin");



export default class ManufacturingLinePage extends React.Component {
  constructor(props) {
    super(props);
    // let {
    //   page_name, 
    //   page_title, 
    //   table_columns, 
    //   table_properties, 
    //   table_options,  } = props.simple ? DataStore.getSkuDataSimple() : DataStore.getManuLineData();


    this.state = {
        // page_name,
        // page_title,
        // table_columns,
        // table_properties,
        // table_options,
        selected_items: [],
        selected_indexes: [],
        detail_view_item: {},
        detail_view_formula_item: {},
        detail_view_options: [],
        detail_view_action:'',
        data: [],
        exportData: [],
        sort_field: '_',
        error: null,
        user:'',
        currentPage: 0,
        previousPage: 0,
        pageSize: props.simple ? 4 : 20,
        pagesCount: 0,


        selected_manu_line: {},
        manu_report_modal: false,
        details_modal: false


    };
    if(localStorage != null){
        if(localStorage.getItem("jwtToken")!= null){
            this.state.user = jwt_decode(localStorage.getItem("jwtToken")).username;
        }
    }
    this.toggle = this.toggle.bind(this);
    // this.onDetailViewSubmit = this.onDetailViewSubmit.bind(this);
    // this.setInitPages();
  }

  toggle = (modalType) => {
    switch(modalType){
        case Constants.manu_report_modal:
            this.setState({manu_report_modal: !this.state.manu_report_modal})
            console.log("the toggle of manu_report_modal is: "+this.state.manu_report_modal);
            break;
        // case Constants.details_modal:
        //     this.setState({details_modal: !this.state.details_modal})
        //     break;
    }
  } 

  onManuReportSelect = async (e, manu_line_id) => {
    //want to set the selected manu_line and then toggle the thing open.
    //do we also want to get all the SKUS scheduled for that?
    console.log("manureportselected: "+manu_line_id);
    var new_manu_line = await SubmitRequest.submitGetManufacturingLineByID(manu_line_id);
    console.log("new_manu_line: "+JSON.stringify(new_manu_line));

    await this.setState({
      selected_manu_line: new_manu_line.data[0],
      detail_view_options: [Constants.details_export, Constants.details_cancel],
      detail_view_action: Constants.details_edit

    })
    // await this.onReportViewSelect();
    this.toggle(Constants.manu_report_modal);
  }

  onDetailViewSubmitReport= async (event, reportData, option) => {
    console.log("this is the item  state."+ JSON.stringify(reportData));

    switch (option) {
        case Constants.details_export:
            exportManuScheduleReport(reportData);
            break;
        // case Constants.details_cancel:
        //     break;
        };

        await this.setState({ 
            selected_manu_line: null,
            detail_view_options: [],
            detail_view_action: ''
        });
        this.toggle(Constants.manu_report_modal);
    
  }

  render() {
    return (
      <div>
        <GeneralNavBar></GeneralNavBar>
        <ManufacturingLineBox
        handleManuScheduleReportSelect = {this.onManuReportSelect}
        ></ManufacturingLineBox>
        <Modal isOpen={this.state.manu_report_modal} toggle={this.toggle} id="popup" className='manu-report-details'>
                    <ManufacturingScheduleReportDetails
                            manu_line={this.state.selected_manu_line}
                            detail_view_options={this.state.detail_view_options}
                            detail_view_action = {this.state.detail_view_action}
                            handleDetailViewSubmit={this.onDetailViewSubmitReport}
                        />
        </Modal>
      </div>
    );
  }
}