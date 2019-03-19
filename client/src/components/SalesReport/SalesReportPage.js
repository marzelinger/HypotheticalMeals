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
    state = {
        value: 0,
        customer: {},
        allCustomers: false,
        selected_sku: {}
    };

    handleChange = (event, value) => {
        console.log(value)
        this.setState({ value });
    };

    onSelectSku = async (sku) => {
        await this.setState({ selected_sku: sku })
    };

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
                    <GeneralReport/> : 
                    <SkuDrilldown 
                        sku={this.state.selected_sku}
                        handleSelectSku={this.onSelectSku}
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