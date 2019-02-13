
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

export default class ManuGoalsCalculatorTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: props.data,
            page_title: 'calculator',
            table_columns: ['Name', 'Number', 'Vendor Information', 'Package Size', 'Package Cost', 'Quantity in Goal'],
            table_properties: ['name', 'num', 'vendor_info', 'pkg_size', 'pkg_cost', 'goalQuantity']
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
    
    exportPDF = async () => {
        html2canvas(document.querySelector("#table"),{width: 750, height: 1050})
        .then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF();
            pdf.addImage(imgData, 'PNG', 0, 0);
            pdf.save("calculator.pdf");  
        });
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
                <div id = "table">
                    <Table selectable={this.state.selectable}
                        multiSelectable={this.state.multiSelectable}
                        onRowSelection = {(res) => this.props.handleSelect(res)}
                         >
                    <TableHeader
                        displaySelectAll={false}
                        adjustForCheckbox={this.state.selectable}
                        enableSelectAll={false}
                    >
                        <TableRow>
                            {this.state.table_properties.map(prop => 
                            <TableHeaderColumn key={prop}>
                                {this.getPropertyLabel(prop)}
                            </TableHeaderColumn>
                            )}
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {this.state.data.map((item, index) => 
                            <TableRow displayRowCheckbox = {false} key={item.num + index}>
                            {this.state.table_properties.map(prop => 
                                <TableRowColumn key={prop}>
                                {item[prop]}
                                </TableRowColumn>
                            )}
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                </div>
            </ModalBody>
            <ModalFooter>
                <ExportSimple name = {'Export'} data = {this.state.data} fileTitle = {this.state.page_title}/>
                <div className = "exportbutton pdfbutton hoverable" onClick = {() => this.print()}>Export PDF</div>
            </ModalFooter>                 
            </div>
        );
    }
}

ManuGoalsCalculatorTable.propTypes = {
    data: PropTypes.array
}