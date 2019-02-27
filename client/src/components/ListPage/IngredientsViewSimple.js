// IngredientsViewSimple.js
// Riley
// Ingredients view for SKU details page

import React from 'react';
import PropTypes from 'prop-types';
import PageTable from './PageTable';
import './../../style/SkusPage.css';
import DataStore from './../../helpers/DataStore';
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import TablePagination from './TablePagination'

export default class IngredientsViewSimple extends React.Component {
    constructor(props) {
        super(props);

        let {
            table_columns, 
            table_properties } = DataStore.getIngredientDataSimple();

        this.state = {
            formula_id: props.formula._id,
            formula: props.formula,
            table_columns: [...table_columns, 'Quantity'],
            table_properties: [...table_properties, 'quantity'],
            selected_items: [],
            currentPage: 0,
            previousPage:0,
            pageSize: 6,
            pagesCount: 0,
            itemCount: 0,
            currItems: [],
            currQtys: []
        };
        this.onQuantityChange = this.onQuantityChange.bind(this);
        this.handlePageClick=this.handlePageClick.bind(this);
        //this.setNumberPages();
        this.setInitPages();
        console.log("this is the ingredients view simple props: "+JSON.stringify(this.props));
    }


    //what about the load data thing?
    //        await this.checkCurrentPageInBounds(resALL);

    //the input here needs to be the dataResAll --> all the ings associated with this formula.
    async checkCurrentPageInBounds(dataResAll){
        var prev = this.state.previousPage;
        //there is no data. update the current index stuff
        if (this.props.formula === undefined) {
            this.setState({
                currentPage: 0,
                previousPage: prev,
                pagesCount: 0,
            });
        }
        else{
            //there is some sort of data response
            var dataLength = this.props.formula.ingredients.length;
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
        //need to get all the ingredients for the formula.

        //let allData = await SubmitRequest.submitGetData(this.state.page_name);
        //should we go directily to the database/ probably
        //let allFormula = await SubmitRequest.submitGetFormulaByID(this.state.formula_id);
       // var curCount = Math.ceil(allFormula.data.length/Number(this.state.pageSize));
        if(this.props.formula!=undefined){
        var curCount = Math.ceil(this.props.formula.length/Number(this.state.pageSize));
        this.setState({
            currentPage: 0,
            previousPage: 0,
            pagesCount: curCount,
        }); 
    }
    }

    async componentDidMount() {
        this.setNumberPages();
    }

    async componentDidUpdate (prevProps, prevState) {
        //identify is you've changed an ingredient 
        let starting_index = this.state.pageSize * this.state.currentPage;
        let cQtys = this.props.formula.ingredient_quantities.slice(starting_index, starting_index+this.state.pageSize);
        cQtys.forEach((qt, index) => {
            if(qt != this.state.currQtys[index]){
                this.setNumberPages();
            }
        })
        if (this.props.formula.ingredients.length != this.state.itemCount){
            this.setNumberPages();
        }
        //
    }

    async handlePageClick(e, index) {
        e.preventDefault();
        await this.setState({
            currentPage: index
        });
        await this.setNumberPages();
        //need to load the data.
    }

    async setNumberPages(){
        var curCount = Math.ceil(this.props.formula.ingredients.length/Number(this.state.pageSize));

        let starting_index = this.state.pageSize * this.state.currentPage;
        let cItems = this.props.formula.ingredients.slice(starting_index, starting_index+this.state.pageSize);
        let cQtys = this.props.formula.ingredient_quantities.slice(starting_index, starting_index+this.state.pageSize);
        await this.setState({
            itemCount: this.props.formula.ingredients.length,
            currentPage: this.state.currentPage <= curCount ? this.state.currentPage : this.state.currentPage-1,
            pagesCount: curCount,
            currItems: cItems,
            currQtys: cQtys
        }); 
    }


    onSort = () => {}

    onSelect = () => {}

    onDetailViewSelect = () => {}

    onQuantityChange (e, index) {
        console.log("in on quantitychange first ");

        let cQtys = this.state.currQtys.slice();
        cQtys[index] = e.target.value;
        this.setState({ currQtys: cQtys })
        let ind_actual = this.state.currentPage * this.state.pageSize + index;
        console.log(this.props.formula.ingredient_quantities);
        var ing_quant = this.props.formula.ingredient_quantities.slice();
        console.log(e.target.value);
        ing_quant[ind_actual] = e.target.value;
        console.log("in on quantitychange: "+JSON.stringify(ing_quant));
        console.log("in on quantitychange2: "+ind_actual);
        this.props.handlePropChange(ing_quant, this.props.formula, 'ingredient_quantities');
        //this.props.handlePropChange(ing_quant, this.props.formula, 'ingredient_quantities');
    }

    getButtons = () => {
        return (
        <div className = "ingbuttons">     
            {/* <DependencyReport data = {this.state.exportData} /> */}
            {/* <ExportSimple data = {this.state.exportData} fileTitle = {this.state.page_name}/>  */}
        </div>
        );
    }
    render() {
        return (
            <div className="list-page">
                <div>
                    <PageTable 
                        columns={this.state.table_columns} 
                        table_properties={this.state.table_properties} 
                        list_items={this.state.currItems}
                        quantities={(this.state.currItems !== null) ? this.state.currQtys : null}
                        selected_items={this.state.selected_items}
                        handleSort={this.onSort}
                        handleSelect={this.onSelect}
                        handleDetailViewSelect={this.onDetailViewSelect}
                        handleQuantityChange={this.onQuantityChange}
                        selectable = {false}
                        title = {'Ingredients'}
                        disable_inputs = {this.props.disabled}
                    />
                </div>
                {/* <div className = "pagination-wrapper">
                <Pagination aria-label="Page navigation example">
                    <PaginationItem disabled={this.state.currentPage <= 0}>
                        <PaginationLink
                            onClick={e => this.handlePageClick(e, this.state.currentPage - 1)}
                            previous
                            href="#"
                        />
                    </PaginationItem>
                    {[...Array(this.state.pagesCount)].map((page, i) => 
                    <PaginationItem active={i === this.state.currentPage} key={i}>
                        <PaginationLink onClick={e => this.handlePageClick(e, i) } href="#">
                        {i + 1}
                        </PaginationLink>
                    </PaginationItem>
                    )}
                    <PaginationItem disabled={this.state.currentPage >= this.state.pagesCount - 1}>
                        <PaginationLink
                            onClick={e => this.handlePageClick(e, this.state.currentPage + 1)}
                            next
                            href="#"
                        />
                    </PaginationItem>
                </Pagination> */}
                <TablePagination
                 currentPage = {this.state.currentPage}
                 pagesCount = {this.state.pagesCount}
                 handlePageClick = {this.handlePageClick}
                 getButtons = {this.getButtons}
                >
                </TablePagination>
                {/* </div>   */}
            </div>
        );
    }

}

IngredientsViewSimple.propTypes = {
    formula: PropTypes.object,
    handlePropChange: PropTypes.func,
    disabled: PropTypes.bool
    //handleFormulaPropChange: PropTypes.func

}