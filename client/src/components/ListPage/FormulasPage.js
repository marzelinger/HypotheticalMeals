// FormulaPage.js
// Belal

import React from 'react';
import PropTypes from 'prop-types';
import PageTable from './PageTable'
import SubmitRequest from '../../helpers/SubmitRequest'
import ItemStore from '../../helpers/ItemStore'
import DataStore from './../../helpers/DataStore'
import TablePagination from './TablePagination'

const currentUserIsAdmin = require("../auth/currentUserIsAdmin");

export default class FormulasPage extends React.Component {
    constructor(props){
        super(props);

        let{
            page_name,
            page_title,
            table_columns,
            table_properties,
            table_options} = DataStore.getFormulaData();

        this.state = {
            page_name,
            page_title,
            table_columns,
            table_properties,
            table_options,
            detail_view_item: null,
            detail_view_options,
            data: [],
            exportData: [],
            sort_field: '_',
            error: null,
            modal: false,
            simple: props.simple || false,
            currentPage: 0,
            previousPage: 0,
            pageSize: 20,
            pagesCount: 0,
            filters: {
                'keyword': '',
                'ingredients': []
            },
            filterChange: false,
        };

        this.toggleModal = this.toggleModalModa.bind(this);
        this.onFilterValueSelection = this.onFilterValueSelection.bind(this);
    }
}