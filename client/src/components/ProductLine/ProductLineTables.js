// SkusPage.js
// Riley
// Larger page component to be shown in PageTemplate
// THIS PAGE IS DEPRICATED

import React from 'react';
import ProductLineSkuTable from './ProductLineSkuTable'
// import '../../style/SkusPage.css';
import ExportSimple from '../export/ExportSimple';


export default class ProductLineTables extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            page_title: 'skus',
            table_columns: ['Name', 'Number',  'Unit Size', 'Count per Case', 'Product Line'],
            table_properties: ['name', 'num', 'unit_size', 'cpc', 'prod_line'],
            error: null
        };
    }

    onSort = (event, sortKey) => {
        const data = this.props.data;
        data.sort((a,b) => {
            if (/^\d+$/.test(a[sortKey]) && /^\d+$/.test(b[sortKey])) {
                return parseInt(a[sortKey])-parseInt(b[sortKey]);
            }
            else {
                if (a[sortKey] === undefined && b[sortKey] === undefined) return a;
                else if (a[sortKey] === undefined) return b;
                else if (b[sortKey] === undefined) return a;
                return a[sortKey].toString().localeCompare(b[sortKey]);
            }
        })
        this.setState({data})
    };

    render() {
        return (
            <div className="list-page">
                <div>
                    <ProductLineSkuTable
                        onProdLineChange = {this.props.onProdLineChange}
                        columns={this.state.table_columns} 
                        table_properties={this.state.table_properties} 
                        list_items={this.props.data}
                        handleSort={this.onSort}
                        options = {this.props.prod_lines}
                    />
                </div>              
            </div>
        );
    }
}