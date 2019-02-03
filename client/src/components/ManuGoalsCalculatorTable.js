
import React from 'react';
import ExportSimple from './export/ExportSimple';
import PropTypes from 'prop-types';
import { Button, Table, ModalBody, ModalFooter } from 'reactstrap';
const html2canvas = require('html2canvas');
const jsPDF = require('jspdf');

export default class ManuGoalsCalculatorTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: props.data,
            page_title: 'calculator',
            table_columns: ['Name', 'Number', 'Vendor Information', 'Package Size', 'Package Cost', 'SKUs', 'Quantity in Goal'],
            table_properties: ['name', 'num', 'vendor_info', 'pkg_size', 'pkg_cost', 'skus', 'goalQuantity']
        };
    }

    getPropertyLabel = (col) => {
        return this.state.table_columns[this.state.table_properties.indexOf(col)];
      }
    
    exportPDF = async () => {
        html2canvas(document.querySelector("#table"))
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
            <ModalBody>
                <div id = "table">
                    <Table>
                        <thead>
                        <tr>
                            {this.state.table_properties.map(prop => 
                            <th key={prop}>
                                {this.getPropertyLabel(prop)}
                            </th>
                            )}
                        </tr>
                        </thead>
                        <tbody>
                        {this.state.data.map((item, index) => 
                            <tr key={item.num + index}>
                            {this.state.table_properties.map(prop => 
                                <td key={prop}>
                                {item[prop]}
                                </td>
                            )}
                            </tr>
                        )}
                        </tbody>
                    </Table>
                </div>
            </ModalBody>
            <ModalFooter>
                <ExportSimple name = {'Export CSV'} data = {this.state.data} fileTitle = {this.state.page_title}/>
                <Button onClick = {() => this.exportPDF()}>Export PDF</Button>
            </ModalFooter>                 
            </div>
        );
    }
}

ManuGoalsCalculatorTable.propTypes = {
    data: PropTypes.array
}