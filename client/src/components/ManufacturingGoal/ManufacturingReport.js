import React from 'react';
import ExportSimple from '../export/ExportSimple';
import PropTypes from 'prop-types';
import {
    // Table,
    TableBody,
    TableFooter,
    TableHeader,
    TableHeaderColumn,
    TableRow,
    TableRowColumn,
  } from 'material-ui/Table';
  import { Table } from 'reactstrap';

import { Button, ModalBody, ModalFooter } from 'reactstrap';
import * as Constants from '../../resources/Constants';
import UnitConversion from '../../helpers/UnitConversion';
import '../../style/printing.css'
const html2canvas = require('html2canvas');
const jsPDF = require('jspdf');

export default class ManufacturingReport extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: props.data,
            page_title: 'Manufacturing Schedule Report for',
            table_columns: ['Name', 'Number', 'Vendor Information', 'Package Size', 'Package Cost', 'Unit Quantity'],
            table_properties: ['name', 'num', 'vendor_info', 'pkg_size', 'pkg_cost', 'unitQuantity'],
            manu_line: Object.assign({}, props.manuData.manu_line),
            duration: props.manuData.duration,
            start_date: props.manuData.start_date,
            end_date: props.manuData.end_date,
            ingredients_info: [],
            current_ingredient_ids: []
                };
        this.print = this.print.bind(this);
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

    getPropertyLabel = (col) => {
        return this.state.table_columns[this.state.table_properties.indexOf(col)];
      }
    
    // exportPDF = async () => {
    //     html2canvas(document.querySelector("#table"),{width: 750, height: 1050})
    //     .then((canvas) => {
    //         const imgData = canvas.toDataURL('image/png');
    //         const pdf = new jsPDF();
    //         pdf.addImage(imgData, 'PNG', 0, 0);
    //         pdf.save("calculator.pdf");  
    //     });
    // }


    async handleSubmit(e, opt) {
        var reportData = {};
        if (![Constants.details_save, Constants.details_export, Constants.details_create].includes(opt)) {
            this.props.handleDetailViewSubmit(e, reportData, opt);
            return;
        }
        if([Constants.details_export].includes(opt)){
            this.print();
            return;
        }
    }


    masterHeader = () => {
        var curStart = new Date(this.props.manuData.start_date);
        var curEnd = new Date(this.props.manuData.end_date);
        var start = this.formatDate(curStart);
        var end = this.formatDate(curEnd);
        var head = `Manufacturing Schedule Report for ${start} to ${end}`;
        var head2 = `(Duration ${this.props.manuData.duration} hour(s)) on Manufacturing Line: ${this.props.manuData.manu_line.short_name}`;
        return (
            <div>
                <h5>
                    {head}
                </h5>
                <h6>
                    {head2}
                </h6>
            </div>
        );
    }


    formatSKUTable = (sku) => {
        // console.log("this is the sku: "+JSON.stringify(sku));
        if(sku!=undefined){
            // console.log('sku yes');

        return (
            <div>
        <Table className = "report-sku-table">
        <thead>
          <tr>
            <th>SKU#</th>
            <th>Name</th>
            <th>Formula#</th>
            <th>FormulaFactor</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{sku.num}</td>
            <td>{sku.name}</td>
            <td>{sku.formula.name}</td>
            <td>{sku.scale_factor}</td>
          </tr>
        </tbody>
      </Table>
      </div>
        );
        }
        else {
            return;
        }
    }

    formatIngTable = (sku) => {
        if(sku!=undefined){
            // console.log('ingtable yes');
        return (
            <div>
                <Table className = "report-ing-table">
        <thead>
          <tr>
            <th>Ingr#</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
            {sku.formula.ingredients.map((item, index) =>
                <tr>
                    <td>{sku.formula.ingredients[index].name}</td>
                    <td>{sku.formula.ingredient_quantities[index]}</td>
                </tr>
            )}
        </tbody>
      </Table>
      </div>
        );
            }
    }

    formatDate = (date) => {
        var str_split =(""+date).split(" ");
        return str_split[1]+" "+str_split[2]+" "+str_split[3];
    }

    
    formatActivity = (curAct) => {
            var curStart = new Date(curAct.start);
            var curEnd = new Date(curAct.start);
            curEnd.setMilliseconds(curEnd.getMilliseconds() + Math.floor(curAct.duration/10)*24*60*60*1000 + (curAct.duration%10 * 60 * 60 * 1000));
            var start = this.formatDate(curStart);
            var end = this.formatDate(curEnd);
            var header = `Manufacturing Activity from ${start} to ${end} with Duration of ${curAct.duration} hour(s) to produce ${curAct.quantity} case(s).`;
            // console.log("this is the header: "+header);
            return (
                <div>
                    {header}
                    {this.formatSKUTable(curAct.sku)}
                    {this.formatIngTable(curAct.sku)}
                </div>

            );
    }
    
    badActivity = (curAct) => {

            var curStart = new Date(curAct.start);
            var curEnd = new Date(curAct.start);
            curEnd.setMilliseconds(curEnd.getMilliseconds() + Math.floor(curAct.duration/10)*24*60*60*1000 + (curAct.duration%10 * 60 * 60 * 1000));
            var strStart = (""+curStart).split(" ");
            var start = strStart[0]+" "+strStart[1]+" "+strStart[2]+" "+strStart[3]+" "+strStart[4];
            var strEnd = (""+curEnd).split(" ");
            var end = strEnd[0]+" "+strEnd[1]+" "+strEnd[2]+" "+strEnd[3]+" "+strEnd[4];
            var sku = curAct.sku.name;
            var header = `Manufacturing Activity from ${start} to ${end} with Duration of ${curAct.duration} hour(s) to produce ${curAct.quantity} case(s) of SKU: ${sku}.`;
            
            // console.log("this is the header: "+header);
            return (
                <div>
                    {header}
                </div>

            );
    }

    formatSumTable = () => {
        if(this.props.data.reportData.complete.length>0){
            if(this.props.data.reportData.summation.summation.ingredientNames !=undefined){
                    return (
                        <div>
                            <h6>
                                Summation of All Ingredients Needed
                            </h6>
                            <Table className = "report-sum-table">
                                <thead>
                                    <tr>
                                        <th>Ingr. Name</th>
                                        <th>Unit Quantity</th>
                                        <th>Package Quantity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.props.data.reportData.summation.summation.ingredientNames.map((item, index) =>
                                        <tr>
                                            <td>{this.props.data.reportData.summation.summation.ingredientNames[index]}</td>
                                            <td>{this.props.data.reportData.summation.summation.ingredientQuantities[index]}</td>
                                            <td>{Math.round((this.props.data.reportData.summation.summation.ingredientPckgCounts[index]*100000))/100000}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                            </div>
                    );
            }
        }
    }

    render() {
        
        return (
            <div>
                <iframe id="ifmcontentstoprint" 
                style={{
                            height: '0px',
                            width: '0px',
                            position: 'absolute'
                        }}
                        ></iframe>  
                <ModalBody id = "printarea">
                    <div>
                        {this.masterHeader()}
                        {this.props.data.reportData.complete!=undefined ? this.props.data.reportData.complete.map((item, index) =>
                                        <div key = {index} >
                                            {this.formatActivity(item)}
                                        </div>) : <div/>}
                        {this.props.data.reportData.complete!=undefined ? this.formatSumTable() : <div/>}
                    <div>
                        {(this.props.data.reportData.all_cut !=undefined) ?
                            <div> 
                                {this.props.data.reportData.all_cut.length>0 ?
                                    <div>
                                        <h6>The Following Activitities Began Before the Timespan and End After the Timespan.</h6>
                                        {this.props.data.reportData.all_cut.map((item, index) =>
                                            <div key = {index} >
                                                {this.badActivity(item)}
                                            </div>)}
                                    </div>
                                    : 
                                    <div></div>
                                }
                            </div>
                            : 
                            <div></div>
                        }
                    </div>
                    <div>
                        {(this.props.data.reportData.end_cut !=undefined) ? 
                            <div>
                                {this.props.data.reportData.end_cut.length>0 ?
                                    <div>
                                        <h6>The Following Activitities Began During the Timespan and End After the Timespan.</h6>
                                        {this.props.data.reportData.end_cut.map((item, index) =>
                                            <div key = {index} >
                                                {this.badActivity(item)}
                                            </div>
                                        )}
                                    </div>
                                    : 
                                    <div></div>
                                }
                            </div>
                        : 
                        <div></div>
                        }
                    </div>
                    <div>
                        {(this.props.data.reportData.beg_cut !=undefined) ? 
                            <div>
                                {this.props.data.reportData.beg_cut.length>0 ?
                                    <div>
                                        <h6>The Following Activitities Began Before the Timespan and End During the Timespan.</h6>
                                        {this.props.data.reportData.beg_cut.map((item, index) =>
                                            <div key = {index} >
                                                {this.badActivity(item)}
                                            </div>
                                        )}
                                    </div>
                                    :
                                    <div></div>
                                }
                            </div>
                            :
                            <div></div>
                        }
                    </div>   
                  </div>
                </ModalBody>
                <ModalFooter>
                    {/* <ExportSimple name = {'Export'} data = {this.state.data} fileTitle = {this.state.page_title}/> */}
                    {/* <div className = "exportbutton pdfbutton hoverable" onClick = {() => this.print()}>Export PDF</div> */}

                    <div className='item-options'>
                        { this.props.detail_view_options.map(opt => 
                            <Button 
                                className = "detailButtons"
                                key={opt} 
                                onClick={(e) => this.handleSubmit(e, opt)}
                            >{opt}</Button>
                        )}
                    </div>
                </ModalFooter>                 
            </div>
        );    
    }
}


ManufacturingReport.propTypes = {
    data: PropTypes.array,
    manuData: PropTypes.array,
    detail_view_options: PropTypes.arrayOf(PropTypes.string),
}