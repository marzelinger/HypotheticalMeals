

import React from 'react';
import PropTypes from 'prop-types';
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';


export default class TablePagination extends React.Component {
    constructor(props){
        super(props);
    }

    render = () => {
        return (
            <div className = "pagination-wrapper">
            <Pagination aria-label="Page navigation example">
            <div>
                <PaginationItem disabled={this.props.currentPage <= 0}>
                    <PaginationLink
                        onClick={e => this.props.handlePageClick(e, this.props.currentPage - 1)}
                        previous
                        href="#"
                    />
                </PaginationItem>

                {[...Array(this.props.pagesCount)].map((page, i) => 
                <PaginationItem active={i === this.props.currentPage} key={i}>
                    <PaginationLink onClick={e => {
                        this.props.handlePageClick(e, i)
                        // this.setState({
                        //     currentPage: i
                        // });
                        // this.loadDataFromServer();     
                    }
                } href="#">
                    {i + 1}
                    </PaginationLink>
                </PaginationItem>
                )}

                <PaginationItem disabled={this.props.currentPage >= this.props.pagesCount - 1}>
          
                <PaginationLink
                    onClick={e => this.props.handlePageClick(e, this.props.currentPage + 1)}
                    next
                    href="#"
                />
                </PaginationItem>
                </div>
                {this.props.getButtons != undefined ? this.props.getButtons() : <div></div>}
                </Pagination>
            </div>  
        )
    }
}


Pagination.propTypes = {
    currentPage: PropTypes.number,
    exportData: PropTypes.array,
    page_name: PropTypes.string,
    pagesCount: PropTypes.number,
    handlePageClick: PropTypes.func
}