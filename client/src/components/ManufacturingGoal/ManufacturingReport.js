
import React from 'react';
import ExportSimple from '../export/ExportSimple';
import PropTypes from 'prop-types';
import {
    Table,
    TableBody,
    TableFooter,
    TableHeader,
    TableHeaderColumn,
    TableRow,
    TableRowColumn,
  } from 'material-ui/Table';
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
        var head = `Manufacturing Schedule Report for ${new Date(this.state.start_date)} to ${new Date(this.state.end_date)} (Duration ${this.state.duration}hour(s)) on Manufacturing Line: ${this.state.manu_line.short_name}`;
        return (
            <div>{head}</div>
        );
    }


    formatSKUTable = (sku) => {
        console.log("this is the sku: "+JSON.stringify(sku));
        if(sku!=undefined){
        return (
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
            <th scope="row">{sku.num}</th>
            <td>{sku.name}</td>
            <td>{sku.formula.name}</td>
            <td>{sku.scale_factor}</td>
          </tr>
        </tbody>
      </Table>
        );
        }
        else {
            return;
        }
    }

    formatIngTable = (sku) => {
        if(sku!=undefined){
        return (
        <Table>
        <thead>
          <tr>
            <th>Ingr#</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
            {sku.formula.ingredients.map(i =>
                <tr>
                    <th>{sku.formula.ingredients[i]}</th>
                    <th>{sku.formula.ingredient_quantities[i]}</th>
                </tr>
            )}
        </tbody>
      </Table>
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
            var header = `Manufacturing Activity from ${curStart} to ${curEnd} with Duration of ${curAct.duration} hour(s) to produce ${curAct.quantity} case(s).`;
            return (
                <div>
                    {header}
                    {this.formatSKUTable(curAct.sku)}
                    {this.formatIngTable(curAct.sku)}
                </div>

            );
    }

    formatCompleteActivities = () => {
        console.log("these are the complete: "+JSON.stringify(this.state.data.complete));
        return(
            <div>
                {this.state.data.complete.map((item, key) =>
                    {this.formatActivity(item)})}
                {/* {this.state.data.complete.map( function(index){
                    return (this.formatActivity(this.state.data.complete[index]));}}
            </div> */}
            </div>

        );            
    }
    
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
        console.log(this.state.data)
        return (
            <div>
            <iframe id="ifmcontentstoprint" style={{
                        height: '0px',
                        width: '0px',
                        position: 'absolute'
                    }}></iframe>  
            <ModalBody id = "printarea">
                {this.masterHeader()}
                {this.formatCompleteActivities()}
                {/* {this.summationTable()}
                {this.badActivities("all", this.props.data.all_cut)}
                {this.badActivities("beg", this.props.data.beg_cut)}
                {this.badActivities("end",this.props.data.end_cut)} */}

                
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