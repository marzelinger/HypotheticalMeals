// SkusPage.js
// Riley
// Larger page component to be shown in PageTemplate
// THIS PAGE IS DEPRICATED

import React from 'react';
import Filter from './Filter';
import GoalsSkuTable from './GoalsSkuTable'
import TableOptions from './TableOptions'
import ItemStore from './../../helpers/ItemStore'
import ItemDetails from './ItemDetails'
import AddToManuGoal from './AddToManuGoal'
import { 
    Alert,
    Button,
    DropdownToggle,
    Modal} from 'reactstrap';
import * as Constants from './../../resources/Constants';
import './../../style/SkusPage.css';
import GeneralNavBar from "../GeneralNavBar";
import ExportSimple from '../export/ExportSimple';
import DependencyReport from '../export/DependencyReport';
import SubmitRequest from './../../helpers/SubmitRequest';


export default class ManuGoalsTables extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            query: props.query,
            page_title: 'SKUs',
            table_columns: ['Name', 'Number', 'Case UPC', 'Unit UPC', 'Unit Size', 'Cost per Case', 'Product Line', 'Quantity'],
            table_properties: ['name', 'num', 'case_upc', 'unit_upc', 'unit_size', 'cpc', 'prod_line', 'quantity'],
            data: [],
            error: null,
            onDeleteSku: props.onDeleteSku
        };

        this.loadDataFromServer = this.loadDataFromServer.bind(this);
    }

    componentDidMount = () => {
        this.loadDataFromServer();
    }

    async loadDataFromServer() {
        console.log(this.state.query);
        let res = await SubmitRequest.submitQueryString(this.state.query);
        if (!res.success) {
            this.setState({ error: res.error });
        }
        else {
            this.setState({ data: res.data });
        }
    }

    onSort = (event, sortKey) => {
        const data = this.state.data;
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
                    <GoalsSkuTable
                        onQuantityChange = {this.props.onQuantityChange}
                        columns={this.state.table_columns} 
                        table_properties={this.state.table_properties} 
                        list_items={this.state.data}
                        selected_items={this.state.selected_items}
                        handleSort={this.onSort}
                        handleSelect={this.onSelect}
                        handleDetailViewSelect={this.onDetailViewSelect}
                    />
                </div>
                <ExportSimple data = {this.state.data} fileTitle = {this.state.page_name}/>               
            </div>
        );
    }
}