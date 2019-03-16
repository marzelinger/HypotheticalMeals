//salesreportpage.js

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import GeneralNavBar from '../GeneralNavBar';
import CustomerSelectSalesReport from './CustomerSelectSalesReport';
import SkuDrilldown from './SkuDrilldown';
import GeneralReport from './GeneralReport';
import '../../style/SalesReportPageStyle.css'

class SalesReportPage extends React.Component {
    state = {
        value: 0,
        customer: {},
        allCustomers: false,
    };

    handleChange = (event, value) => {
        console.log(value)
        this.setState({ value });
    };


    render() {

        return (
            <div>
                <GeneralNavBar></GeneralNavBar>
                <Paper >
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
<<<<<<< HEAD
                {this.state.value === 0 ? <GeneralReport/> : <SkuDrilldown/> } 
                {/* first is General, Second is SKU */}
=======
                {this.state.value === 0 ? null : <SkuDrilldown/> } {/* first is General, Second is SKU */}
>>>>>>> 0387e3440c74c0b27a34b7a6952ab25275062a88
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