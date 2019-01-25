import React from 'react';
import Filter from './Filter';
import PageTable from './PageTable'
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import * as Constants from '../resources/Constants';


export default class ListPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            page_name: 'ingredients',
            page_title: '',
            num_filters: 0,
            filter_options: [],
            data: []
        };
    }

    loadDataFromServer = () => {
        fetch('/api/' + this.state.page_name + '/', { method: 'GET' })
          .then(data => data.json())
          .then((res) => {
            if (!res.success) this.setState({ error: res.error });
            else this.setState({ data: res.data });
          });
        console.log(this.state.data);
    }

    render() {
        return (
            <div classname="list-page">
                <Button onClick={this.loadDataFromServer}></Button>
                <div className="title-bar">
                    <h1>{this.page_title}</h1>
                </div>
                <div classname="filter-bar">
                    <Filter>
                    </Filter>
                </div>
                <div classname='table'>
                    <PageTable data={this.state.data}>
                    </PageTable>
                </div>
            </div>
        );
    }

}