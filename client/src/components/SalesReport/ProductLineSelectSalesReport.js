// ProductLineSelectSalesReport.js

import React from 'react';
import PropTypes from 'prop-types';
import PageTable from '../ListPage/PageTable'
import SubmitRequest from '../../helpers/SubmitRequest';
import * as Constants from '../../resources/Constants';
import DataStore from '../../helpers/DataStore'
import TablePagination from '../ListPage/TablePagination'

import '../../style/SkusPage.css'
import '../../style/GeneralReportTableStyle.css'
import '../../style/SkuTableStyle.css'
import '../../style/GeneralReport.css'
const jwt_decode = require('jwt-decode');

const currentUserIsAdmin = require("../auth/currentUserIsAdmin");

export default class ProductLineSelectSalesReport extends React.Component {
    constructor(props) {
        super(props);

        let {
            page_name,
            page_title,
            table_columns, 
            table_properties, 
            table_options,  } = DataStore.getProdLineReportData();

         
        this.state = {
            page_name,
            page_title,
            table_columns,
            table_properties,
            table_options,
            selected_items: [],
            selected_indexes: [],
            detail_view_item: {},
            detail_view_formula_item: {},
            detail_view_options: [],
            detail_view_action:'',
            data: [],
            sort_field: '_',
            error: null,
            details_modal: false,
            manu_goals_modal: false,
            manu_goals_data: [],
            manu_lines_modal: false,
            manu_lines_data: [],
            simple: props.simple || false,
            user:'',
            currentPage: 0,
            previousPage: 0,
            pageSize: props.simple ? 4 : 20,
            pagesCount: 0,
            filters: {
                'keyword': '',
            },
            filterChange: false,
            product_lines: []
        };
        if(localStorage != null){
            if(localStorage.getItem("jwtToken")!= null){
                this.state.user = jwt_decode(localStorage.getItem("jwtToken")).username;
            }
        }
        this.onFilterValueSelection = this.onFilterValueSelection.bind(this);
        this.onFilterValueChange = this.onFilterValueChange.bind(this);
        this.onSort = this.onSort.bind(this);
        this.handlePageClick=this.handlePageClick.bind(this);
        this.onSelect = this.onSelect.bind(this)
        this.setInitPages();
    }  

    async componentDidMount() {
        // if (this.props.default_ing_filter !== undefined){
        //     await this.onFilterValueSelection([{ value: { _id : this.props.default_ing_filter._id }}], null, 'ingredients');
        // }
        this.loadDataFromServer();
    }


    // createProductLineElement = (item, index) => {
    //     const options = this.props.options
    //     let defaultValue = {};
    //     options.forEach(option => {
    //       if(option.label == item.prod_line.name){
    //         defaultValue = option;
    //       }
    //     })
    //     let dataSourceConfig = {
    //       text: 'label',
    //       value: 'value',
    //     };
    //     const customStyles = {
    //       control: (base, state) => ({
    //           ...base,
    //           borderColor: this.props.invalid ? 'red' : '#ddd',
    //           height: '30px',
    //           'min-height': '30px',
    //           width: '150px'
    //       })
    //     }
       
    //     return (<Select  styles={customStyles} className = "select" defaultValue = {defaultValue} onChange = {(newval, {action}) => this.props.onProdLineChange(newval, index, action) } options={options} />);
    // }

    async componentDidUpdate (prevProps, prevState) {
        if (this.state.filterChange) {
            await this.loadDataFromServer();
        }
    }

    updateDataState = async () => {
        //var {data: productlines} = await SubmitRequest.submitGetData(Constants.prod_line_page_name);
        //this.setState({product_lines: productlines});
    }


    async loadDataFromServer() {
        var final_keyword_filter = this.state.filters['keyword'];
        //Check how the filter state is being set   
        console.log("loading data from the server. substring: "+final_keyword_filter);  
        if(final_keyword_filter != ''){
            var resALL = await SubmitRequest.submitGetProductLinesByNameSubstring(final_keyword_filter, 0, 0);
            console.log("loading resALL: "+JSON.stringify(resALL));  
            await this.checkCurrentPageInBounds(resALL);  
            var res = await SubmitRequest.submitGetProductLinesByNameSubstring(final_keyword_filter, this.state.currentPage, this.state.pageSize);
            
        }
        else{
            var resALL = await SubmitRequest.submitGetDataPaginated(Constants.prod_line_page_name, 0, 0);
            console.log("loading in the general get: "+JSON.stringify(resALL));  
    
            await this.checkCurrentPageInBounds(resALL);  
            var res = await SubmitRequest.submitGetDataPaginated(Constants.prod_line_page_name, this.state.currentPage, this.state.pageSize);
        }

        if (res === undefined || !res.success) {
            res.data = [];
            resALL.data = [];
        }
        await this.setState({
            data: res.data,
            filterChange: false
        })
        this.updateDataState();
    }

    async checkCurrentPageInBounds(dataResAll){
        var prev = this.state.previousPage;
        //there is no data. update the current index stuff
        if (dataResAll === undefined || !dataResAll.success) {
            this.setState({
                currentPage: 0,
                previousPage: prev,
                pagesCount: 0,
            });
        }
        else{
            //there is some sort of data response
            var dataLength = dataResAll.data.length;
            var curCount = Math.ceil(dataLength/Number(this.state.pageSize));
            if(curCount != this.state.pagesCount){
                //number pages changed.
                if(this.state.currentPage>= curCount){
                    //previous index out of bounds. want to set the index to be 0.
                    this.setState({
                        currentPage: 0,
                        previousPage: prev,
                        pagesCount: curCount,
                    }); 
                }
                else{
                    //the number of pages has changed but the index is still in bounds.
                    //don't need to page change here.
                    this.setState({
                        pagesCount: curCount,
                    }); 
                }
            }
        }

    }


    async setInitPages(){
        let allData = await SubmitRequest.submitGetData(this.state.page_name);
        var curCount = 0;
        if(allData!=undefined){
            if(allData.data!=undefined){
                 curCount = Math.ceil(allData.data.length/Number(this.state.pageSize));
            }
        }
        this.setState({
            currentPage: 0,
            previousPage: 0,
            pagesCount: curCount,
        }); 
    }

    onFilterValueChange = (e, value, filterType) => {
        console.log(this.state.filters)
        var filters = this.state.filters;
        if(filterType == 'keyword'){
            filters[filterType] = value;
        }
        this.setState({filters: filters, filterChange: true}) ;
    }

    handlePageClick = (e, index) => {
        e.preventDefault();
        this.setState({
            currentPage: index
        });
        this.loadDataFromServer();
    }

    onFilterValueSelection (vals, e, type)  {
        var filters = this.state.filters;
        filters[type] = []
        vals.map((item) => {
            filters[type].push(item.value._id);
        })
        this.setState({
            filters: filters,
            filterChange: true
        });
    }

    onTableOptionSelection = async(e, opt) => {
    }


    getPropertyLabel = (col) => {
        return this.props.columns[this.props.table_properties.indexOf(col)];
      }

    async onSort(event, sortKey) {
        await this.setState({sort_field: sortKey})
        this.loadDataFromServer();
    };

    onSelect = async (rowIndexes) => {
        if(rowIndexes == 'all'){
            var indexes = []
            for(var i = 0; i < this.state.data.length; i ++){
                indexes.push(i);
            }
            await this.setState({selected_items: this.state.data, selected_indexes: indexes});
            return;
        }
        else if(rowIndexes == 'none'){
            rowIndexes = [];
        }
        console.log(rowIndexes);
        var newState = [];
        rowIndexes.forEach( index => {
            newState.push(this.state.data[index]);
        });
        await this.setState({ selected_items: newState, selected_indexes: rowIndexes});
    };

     onDetailViewSelect = async (event, item) => {

    };

    getButtons = () => {
        return (
        <div className = "ingbuttons"> 
        </div>
        );
    }

    render() {

        // var rev_index = this.state.data.length;
        // let tablebody = (
        //     this.state.data.map((item, index) => {
        //       rev_index = rev_index - 1;
        //       return (<TableRow
        //       key={item.num + index}
        //     >
        //       {this.props.table_properties.map(prop => 
        //         <TableRowColumn style = {{overflow: prop == 'prod_line' ? 'visible' : 'hidden', zIndex: `${rev_index}`}}  key={prop}>
        //           {prop == 'prod_line' ? this.createProductLineElement(item, index) : item[prop]}
        //         </TableRowColumn>
        //       )}
        //     </TableRow>
        //       )

        //     }

        //   ))
        

        return (
            <div className="prod-line-select-page">
                <div className = "prod-line-select-table ">
                    <PageTable 
                        columns={this.state.table_columns} 
                        table_properties={this.state.table_properties} 
                        list_items={this.state.data}
                        selected_items={this.state.selected_items}
                        selected_indexes = {this.state.selected_indexes}
                        handleSort={this.onSort}
                        handleSelect={this.onSelect}
                        handleDetailViewSelect={this.onDetailViewSelect}
                        showDetails = {false}
                        selectable = {true}
                        sortable = {true}
                        title = {this.state.page_title}
                        showHeader = {true}
                        simple = {this.props.simple}
                        filters = {this.state.filters}
                        table_options = {this.state.table_options}
                        onFilterValueSelection = {this.onFilterValueSelection}
                        onFilterValueChange = {this.onFilterValueChange}
                        onRemoveFilter = {this.onRemoveFilter}
                        ingredients = {this.state.ingredients}
                        products = {this.state.product_lines}
                        onTableOptionSelection = {this.onTableOptionSelection}
                        reportSelect = {true}
                    />
                </div>                
                {/* <div className = 'prod-line-select-table'>
          <Table height = {'100px'}>
            <TableHeader displaySelectAll={true} adjustForCheckbox={true}>
              <TableRow class= "cols trselect">
                {this.state.table_properties.map(prop => 
                  <TableHeaderColumn tooltip = {"Sort By " + this.getPropertyLabel(prop)} className = "hoverable" key={prop}>
                    <div onClick={e => this.onSort(e, prop)}>{this.getPropertyLabel(prop)}</div>
                  </TableHeaderColumn>
                )}
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox = {this.state.showCheckboxes}>
                {tablebody}
            </TableBody>
          </Table>
        </div> */}
                <TablePagination
                    currentPage = {this.state.currentPage}
                    pagesCount = {this.state.pagesCount}
                    handlePageClick = {this.handlePageClick}
                    getButtons = {this.getButtons}
                />
            </div>
        );
    }
}

ProductLineSelectSalesReport.propTypes = {
    handleSelectProdLines: PropTypes.func,
    simple: PropTypes.bool
}
