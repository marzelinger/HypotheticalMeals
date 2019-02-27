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
            end_date: props.manuData.end_date
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


    masterHeader = () => {
        // var start = 
        // var end = 
        var curStart = new Date(this.props.manuData.start_date);
        var curEnd = new Date(this.props.manuData.end_date);
        var strStart = (""+curStart).split(" ");
        var start = strStart[0]+" "+strStart[1]+" "+strStart[2]+" "+strStart[3]+" "+strStart[4];
        var strEnd = (""+curEnd).split(" ");
        var end = strEnd[0]+" "+strEnd[1]+" "+strEnd[2]+" "+strEnd[3]+" "+strEnd[4];
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
        console.log("this is the sku: "+JSON.stringify(sku));
        if(sku!=undefined){
            console.log('sku yes');

        return (
            <div>
        <Table>
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
            console.log('ingtable yes');
        return (
            <div>
                <Table>
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
            else{
                return;
            }
    }

    
    formatActivity = (curAct) => {
        console.log("these are the cur: "+JSON.stringify(curAct));

            var curStart = new Date(curAct.start);
            var curEnd = new Date(curAct.start);
            curEnd.setMilliseconds(curEnd.getMilliseconds() + Math.floor(curAct.duration/10)*24*60*60*1000 + (curAct.duration%10 * 60 * 60 * 1000));
            //Sat Feb 23 2019 08:00:00
            //Wed Feb 20 2019 03:00:00 GMT-0500 (Eastern Standard Time)
            var strStart = (""+curStart).split(" ");
            var start = strStart[0]+" "+strStart[1]+" "+strStart[2]+" "+strStart[3]+" "+strStart[4];
            var strEnd = (""+curEnd).split(" ");
            var end = strEnd[0]+" "+strEnd[1]+" "+strEnd[2]+" "+strEnd[3]+" "+strEnd[4];
            // var strStart = curStart.getUTCFullYear()+"-"+curStart.getUTCMonth()+"-"+curStart.getUTCDate()+"  "+curStart.getHours();
            // var strEnd = curEnd.getUTCFullYear()+"-"+curEnd.getUTCMonth()+"-"+curEnd.getUTCDate()+"  "+curEnd.getHours();
            var header = `Manufacturing Activity from ${start} to ${end} with Duration of ${curAct.duration} hour(s) to produce ${curAct.quantity} case(s).`;
            console.log("this is the header: "+header);
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
            var header = `Manufacturing Activity from ${start} to ${end} with Duration of ${curAct.duration} hour(s) to produce ${curAct.quantity} case(s).`;
            console.log("this is the header: "+header);
            return (
                <div>
                    {header}
                </div>

            );
    }
    



    // {this.props.list_items.map((item, index) => 
    //     <TableRow className = {`myrow ${this.state.showCheckboxes ? " trselect":""}`} selected = {this.determineSelected(index)} key={index}>
    //       {this.props.table_properties.map(prop => 
    //         <TableRowColumn
    //           key={prop}
    //           onClick={e => this.props.handleSelect(e, item)}
    //           style={{ height: 'auto !important' }}
    //         >
    //           {this.displayValue(item, prop)}
    //         </TableRowColumn>
    //       )}
    summationTable = () => {
        return (
            <div></div>
        );
    }

    badActivities = (type, data) => {

        return (
            <div></div>
        );
    }


    render() {
        console.log("propsdata "+JSON.stringify(this.props.data));
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
                {this.masterHeader()}
                <div>
                {this.props.data.complete.map((item, index) =>
                    <div key = {index} >
                    {this.formatActivity(item)}
                    </div>)}
                </div>
                <div>
                    SUMMATION
                </div>
                <div>
                {(this.props.data.all_cut !=undefined) ? 
                    (this.props.data.all_cut.length>0 ?
                        <div>
                        <h6>The Following Activitities Began Before the Timespan and End After the Timespan.</h6>
                        {this.props.data.all_cut.map((item, index) =>
                            <div key = {index} >
                            {this.badActivity(item)}
                            </div>)}
                            </div>
                        : <div></div>
                )
                : <div></div>
                }
                </div>
                <div>
                {(this.props.data.end_cut !=undefined) ? 
                    (this.props.data.end_cut.length>0 ?
                        <div>
                    <h6>The Following Activitities Began During the Timespan and End After the Timespan.</h6>
                        {this.props.data.end_cut.map((item, index) =>
                            <div key = {index} >
                            {this.badActivity(item)}
                            </div>)}
                            </div>
                        : <div></div>
                )
                : <div></div>
                }
                </div>
                <div>
                {(this.props.data.beg_cut !=undefined) ? 
                    (this.props.data.beg_cut.length>0 ?
                        <div>
                        <h6>The Following Activitities Began Before the Timespan and End During the Timespan.</h6>
                        {this.props.data.beg_cut.map((item, index) =>
                            <div key = {index} >
                            {this.badActivity(item)}
                            </div>)}
                            </div>
                        : <div></div>
                )
                : <div></div>
                }
                </div>

            
            </ModalBody>
            <ModalFooter>
                {/* <ExportSimple name = {'Export'} data = {this.state.data} fileTitle = {this.state.page_title}/> */}
                <div className = "exportbutton pdfbutton hoverable" onClick = {() => this.print()}>Export PDF</div>
            </ModalFooter>                 
            </div>
        );
    }
}

ManufacturingReport.propTypes = {
    //data: PropTypes.array,
    //manuData: PropTypes.array,
}