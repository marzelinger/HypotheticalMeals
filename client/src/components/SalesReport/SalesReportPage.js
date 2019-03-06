import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import GeneralNavBar from '../GeneralNavBar';
import CustomerSelectSalesReport from './CustomerSelectSalesReport';

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



    onHandleSelectCustomer = (value) => {
        var isAll = value.selectAll;
        var customer = value.customer;
        this.setState({
            customer: customer,
            allCustomers: isAll
        });
    }

    render() {
        // const { classes } = this.props;

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
                <div>hello</div>
                <CustomerSelectSalesReport>
                    item = {this.state.customer}
                    handleSelectCustomer = {this.onHandleSelectCustomer}
                    
                </CustomerSelectSalesReport>
                {this.state.value ? null : null } {/* first is General, Second is SKU */}
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