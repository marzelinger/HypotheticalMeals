// BulkEditManuLines.js
import React from 'react';
import { Button, Modal, ModalHeader, ModalBody } from 'reactstrap';
import PropTypes from 'prop-types';
import ModifyManuLines from './ModifyManuLines';
import ItemSearchModifyListQuantity from './ItemSearchModifyListQuantity';
import '../../style/ManufacturingGoalsBox.css'
import * as Constants from '../../resources/Constants';
import { ModalBase } from 'office-ui-fabric-react';
import SubmitRequest from '../../helpers/SubmitRequest';

export default class BulkEditManuLines extends React.Component {
    constructor(props){
        super(props);

        let newSkus = props.selected_skus.slice();
        this.state = {
            skus: newSkus,
            submit_options: [Constants.details_save, Constants.details_cancel]
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.selected_skus !== this.props.selected_skus){
            let newSkus = this.props.selected_skus.slice();
            this.setState({
                skus: newSkus
            })
        }
    }

    onModifyList = (option, value, qty) => {
        var skus = this.state.skus.slice();
        var newSkus = this.state.skus.slice();
        switch (option) {
            case Constants.details_add:
                skus.map((sku, ind) => {
                    newSkus[ind] = this.addManuLine(sku, value);
                })
                break;
            case Constants.details_remove:
                skus.map((sku, ind) => {
                    newSkus[ind] = this.removeManuLine(sku, value);
                })
                break;
        }
        console.log(newSkus)
        this.setState({ 
            skus: newSkus
        })
    }

    addManuLine(item, value) {
        let ind = -1;
        item.manu_lines.map((ml, index) => {
            if (ml === value._id)
                ind = index;
        });
        if (ind === -1) item.manu_lines.push(value._id);
        return item;
    }

    removeManuLine(item, value) {
        let ind = -1;
        item.manu_lines.map((ml, index) => {
            if (ml === value._id)
                ind = index;
        });
        if (ind > -1) item.manu_lines.splice(ind,1);
        return item;
    }

    onModifyManuLines = (id, list) => {
        let newSkus = this.state.skus.slice();
        let ind = -1;
        newSkus.map((sku, index) => {
            if (sku._id === id) ind = index
        })
        newSkus[ind]['manu_lines'] = list;
        console.log(newSkus[ind]);
        this.setState({
            skus: newSkus
        })
    }

    render(){
        return (
        <Modal 
            isOpen={this.props.isOpen} 
            id="popup" 
            className='item-details'
            shouldCloseOnOverlayClick={false}
        >
            <ModalHeader toggle={() =>  this.props.toggle(Constants.manu_lines_modal)}>Bulk Edit Manufacturing Lines</ModalHeader>
            <ModalBody>
                <ItemSearchModifyListQuantity
                    api_route={Constants.manu_line_page_name}
                    item_type={Constants.modify_manu_lines_label}
                    options={[Constants.details_add, Constants.details_remove]}
                    handleModifyList={this.onModifyList}
                    qty_disable={true}
                />
                {this.state.skus.map(sku => {
                    return ( 
                        <ModifyManuLines
                            item={sku}
                            label={sku.name}
                            handleModifyManuLines={(list) => this.onModifyManuLines(sku._id, list)}
                            user = {this.props.user}
                        />)
                })}
                {this.state.submit_options.map(opt => {
                    return (<Button 
                        className = "bulk-manu-lines"
                        key={opt} 
                        onClick={(e) => this.props.handleBulkManuLineSubmit(e, opt, this.state.skus)}
                    >{opt}</Button>)
                })}
            </ModalBody>
        </Modal>
        );
    };
}

BulkEditManuLines.propTypes = {
    isOpen: PropTypes.bool,
    toggle: PropTypes.func,
    selected_skus: PropTypes.array,
    handleBulkManuLineSubmit: PropTypes.func
}