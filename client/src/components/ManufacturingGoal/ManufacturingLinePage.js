import React from 'react';
import GeneralNavBar from '../GeneralNavBar';
import PageTable from '../ListPage/PageTable'
import ManufacturingLineBox from './Lines/ManufacturingLineBox'
import * as Constants from '../../resources/Constants';
import '../../style/ManufacturingGoalsStyle.css';
import SubmitRequest from '../../helpers/SubmitRequest';
import { Modal } from 'reactstrap';

import ManufacturingScheduleReportDetails from './ManufacturingScheduleReportDetails';
import ManufacturingReport from './ManufacturingReport';
import { exportManuScheduleReport} from "../../actions/ManufacturingScheduleReport";
const jwt_decode = require('jwt-decode');



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
        details_modal: false,
        manu_report_data_modal: false,
        reportData: {},
        manuData: {},
        complete: [],
        beg_cut: [],
        end_cut: [],
        all_cut: [],
        summation: [],
        current_user: {},
        token: ''


    };
    this.toggle = this.toggle.bind(this);
    this.print = this.print.bind(this);
    // this.onDetailViewSubmit = this.onDetailViewSubmit.bind(this);
    // this.setInitPages();
    this.determineUser = this.determineUser.bind(this);
    this.determineUser();
  }

  async determineUser() {
    var res = await AuthRoleValidation.determineUser();
    if(res!=null){
        var user = res.user;
        var token = res.token;
        await this.setState({
            current_user: user,
            token: token
        })
    }
  }

  async componentDidUpdate (prevProps, prevState) {

    if(localStorage != null){
        if(localStorage.getItem("jwtToken")!= null){
            var token = localStorage.getItem("jwtToken");
            if(this.state.token!=null){
                if(this.state.token != token){
                    await this.determineUser();
                }
            }
        }
    }
    
    if(this.state.current_user._id != AuthRoleValidation.getUserID()){
        await this.determineUser();
    }
  }

  print() {
    var content = document.getElementById('printarea');
    var pri = document.getElementById('ifmcontentstoprint').contentWindow;
    pri.document.open();
    pri.document.write(content.innerHTML);
    pri.document.close();
    pri.focus();
    pri.print();
}

  toggle = (modalType) => {
    switch(modalType){
        case Constants.manu_report_modal:
            this.setState({manu_report_modal: !this.state.manu_report_modal})
            // console.log("the toggle of manu_report_modal is: "+this.state.manu_report_modal);
            break;
        case Constants.manu_report_data_modal:
            this.setState({manu_report_data_modal: !this.state.manu_report_data_modal})
            break;
    }
  } 

  onManuReportSelect = async (e, manu_line_id) => {
    //want to set the selected manu_line and then toggle the thing open.
    //do we also want to get all the SKUS scheduled for that?
    // console.log("manureportselected: "+manu_line_id);
    var new_manu_line = await SubmitRequest.submitGetManufacturingLineByID(manu_line_id);
    // console.log("new_manu_line: "+JSON.stringify(new_manu_line));

    await this.setState({
      selected_manu_line: new_manu_line.data[0],
      detail_view_options: [Constants.details_export, Constants.details_cancel],
      detail_view_action: Constants.details_edit

    })
    // await this.onReportViewSelect();
    this.toggle(Constants.manu_report_modal);
  }

  onDetailViewSubmitReport= async (event, manuData, option) => {
    switch (option) {
        case Constants.details_cancel:
              await this.setState({ 
                selected_manu_line: null,
                detail_view_options: [],
                detail_view_action: '',
                manu_report_modal: false
              });
            break;
        case Constants.details_export:
            let reportData = await exportManuScheduleReport(manuData);
              await this.setState({
                reportData: reportData,
                manuData: manuData
              });
            console.log("this is the reportData: "+JSON.stringify(this.state.reportData));
            await this.setState({ 
              selected_manu_line: null,
              detail_view_options: [Constants.details_export, Constants.details_cancel],
              detail_view_action: '',
              manu_report_modal: false,
              manu_report_data_modal: true

            });
            break;
        };
  }

  onDetailViewDataSubmit= async (event, manuData, option) => {
    switch (option) {
        case Constants.details_cancel:
              await this.setState({ 
                selected_manu_line: null,
                detail_view_options: [],
                detail_view_action: '',
                manu_report_data_modal: false
              });
            break;
        };
  }


  render() {
    return (
      <div>
        <GeneralNavBar title={Constants.ManuLineTitle}></GeneralNavBar>
        <ManufacturingLineBox
          handleManuScheduleReportSelect = {this.onManuReportSelect}
          user = {this.state.current_user}
        ></ManufacturingLineBox>
        <Modal isOpen={this.state.manu_report_modal} toggle={this.toggle} id="popup" className='manu-report-details'>
                    <ManufacturingScheduleReportDetails
                            manu_line={this.state.selected_manu_line}
                            detail_view_options={this.state.detail_view_options}
                            detail_view_action = {this.state.detail_view_action}
                            handleDetailViewSubmit={this.onDetailViewSubmitReport}
                            user = {this.state.current_user}
                        />
        </Modal>
        <Modal isOpen={this.state.manu_report_data_modal} toggle={this.toggle} id="popup" className='manu-report-display'>
                    <ManufacturingReport
                            data = {this.state.reportData}
                            manuData = {this.state.manuData}
                            detail_view_options = {this.state.detail_view_options}
                            handleDetailViewSubmit={this.onDetailViewDataSubmit}
                            user = {this.state.current_user}
                    />
        </Modal>
      </div>
    );
  }
}