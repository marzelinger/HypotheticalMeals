// SkusPage.js
// Riley
// Larger page component to be shown in PageTemplate
// THIS PAGE IS DEPRICATED

import React from 'react';
import GoalsSkuTable from './GoalsSkuTable'
import * as Constants from './../../resources/Constants';
import './../../style/SkusPage.css';
import './../../style/GoalsTableStyle.css';
import SubmitRequest from './../../helpers/SubmitRequest';


export default class ManuGoalsTables extends React.Component {
    constructor(props) {
        console.log(props.skus)
        super(props);
        this.state = {
            page_title: 'SKUs',
            table_columns: ['Name', 'Number', 'Unit Size', 'Count per Case', 'Quantity', 'Manufacturing Rate', 'Duration'],
            table_properties: ['name', 'num', 'unit_size', 'cpc', 'quantity', 'manu_rate', 'duration'],
            data: this.props.activities,
            error: null,
            onDeleteSku: props.onDeleteSku,
            sortKey:''
        };
    }

    onSort = (event, sortKey) => {
        this.setState({sortKey})
    }

    sortData = (data) => {
        var newdata = [...data];
        var sortKey = this.state.sortKey
        if(this.state.sortKey == ''){
            return data;
        }
        data.sort((activitya,activityb) => {
            let a, b;
            if(sortKey == 'quantity'){
                a = activitya;
                b = activityb;
            }
            else{
                a = activitya.sku
                b = activityb.sku
            }
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
        return data
    };



    render() {
        return (
            <div className="list-page goals-table">
                <div>
                    <GoalsSkuTable
                        onQuantityChange = {this.props.onQuantityChange}
                        columns={this.state.table_columns} 
                        table_properties={this.state.table_properties} 
                        list_items={this.sortData(this.props.activities)}
                        selected_items={this.state.selected_items}
                        handleSort={this.onSort}
                        handleSelect={this.onSelect}
                        handleDetailViewSelect={this.onDetailViewSelect}
                        handleDeleteActivities = {this.props.handleDeleteActivities}
                        simple = {true}
                    />
                </div>              
            </div>
        );
    }
}