//salesreportpage.js

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import GeneralNavBar from '../GeneralNavBar';
import * as Constants from '../../resources/Constants';
import CustomerSelectSalesReport from './CustomerSelectSalesReport';
import SkuDrilldown from './SkuDrilldown';
import GeneralReport from './GeneralReport';
import '../../style/SalesReportPageStyle.css'

class SalesReportPage extends React.Component {
    constructor(props) {
        super(props)
        let today = new Date()
        today.setTime(today.getTime() - 300*60*1000)
        let last_year = new Date(today.getTime() - 300*60*1000)
        last_year.setFullYear(today.getFullYear() - 1)

        this.state = {
            value: 0,
            general_report_data: {},
            general_prod_lines: {},
            general_customers: {},
            allCustomers: false,
            selected_sku: {},
            general_customer: {},
            drilldown_customer: {},
            dateRange: { 'startdate': last_year.toISOString().substr(0,10), 'enddate': today.toISOString().substr(0,10)},
        }

        this.onDateRangeSelect = this.onDateRangeSelect.bind(this);
    }

    handleChange = (event, value) => {
        console.log(value)
        this.setState({ value });
    };

    onSelectSku = async (sku) => {
        await this.setState({ selected_sku: sku })
    };

    onSelectSkuFromGeneral = async (sku, gen_report_data, gen_prod_lines, gen_customers) => {
        await this.setState({
            selected_sku: sku,
            value : 1,
        })
        await this.onChangeGeneralReportData(gen_report_data, gen_prod_lines, gen_customers);
    }

    onChangeGeneralReportData = async (gen_report_data, gen_prod_lines, gen_customers) => {
        await this.setState({
            general_report_data: gen_report_data,
            general_prod_lines: gen_prod_lines,
            general_customers: gen_customers
        })
    }

    onSelectGeneralCustomer = async (customer) => {
        await this.setState({ general_customer: customer })
    };

    onSelectDrilldownCustomer = async (customer) => {
        await this.setState({ drilldown_customer: customer })
    };

    onDateRangeSelect(event, type) {
        console.log(type)
        let newRange = Object.assign({}, this.state.dateRange)
        newRange[type] = event.target.value
        this.setState({
            dateRange: newRange
        })
    }

    render() {

        return (
            <div>
                <GeneralNavBar title = {Constants.SalesReportTitle}></GeneralNavBar>
                <Paper className='report-picker-container'>
                    {/* className={classes.root}> */}
                    <Tabs
                        value={this.state.value}
                        onChange={this.handleChange}
                        indicatorColor="primary"
                        textColor="primary"
                        centered
                    >
                        <Tab label="General Report" />
                        <Tab label="SKU Report" />
                        
                    </Tabs>
                </Paper>
                {this.state.value === 0 ? 
                    <GeneralReport
                        general_report_data = {this.state.general_report_data}
                        general_customers = {this.state.general_customers}
                        general_prod_lines = {this.state.general_prod_lines}
                        handleGeneralReportDataChange = {this.onChangeGeneralReportData}
                        handleSkuSelect = {this.onSelectSkuFromGeneral}
                        /> : 
                    <SkuDrilldown 
                        sku={this.state.selected_sku}
                        customer={this.state.drilldown_customer}
                        handleSelectSku={this.onSelectSku}
                        handleSelectCustomer={this.onSelectDrilldownCustomer}
                        dateRange={this.state.dateRange}
                        handleDateRangeSelect={this.onDateRangeSelect}
                    /> 
                } 
                {/* first is General, Second is SKU */}
            </div>
        );
    }
}

const styles = {
    root: {
        flexGrow: 1,
    },
};

SalesReportPage.propTypes = {
    // classes: PropTypes.object.isRequired,
};

export default SalesReportPage; //withStyles(styles)(