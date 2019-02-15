// Comment.js
import React from 'react';
import { Modal } from 'reactstrap';
import PropTypes from 'prop-types';
import '../../style/ManufacturingGoalsBox.css'
import DataStore from '.././../helpers/DataStore';
import * as Constants from '../../resources/Constants';
import { InputGroup, InputGroupAddon, Input, ModalHeader, ModalBody, ModalFooter, Button, FormGroup } from 'reactstrap';


export default class SelectQuantities extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            quantities: {}
        }
    }

    getQuantities = () => {
        return this.state.quantities;
    }

    updateQuantity = (e, skuId) => {
        var quantities = this.state.quantities;
        quantities[skuId] = Number(e.target.value);
        this.setState({quantities: quantities});
    }

    render(){
        const skuNodes = this.props.data.map(sku => (
            <InputGroup key = {sku._id}>
                <InputGroupAddon addonType="prepend">{sku.name}</InputGroupAddon>
                    <Input min = {1} onChange = {(e) => this.updateQuantity(e, sku._id)} className = "inputs" placeholder="Amount" type="number" step="1" />
                <InputGroupAddon addonType="append">{'* ' + sku.unit_size + ' * ' + sku.cpc} </InputGroupAddon>
            </InputGroup>
          ));

        return (
            <div>
                <ModalHeader toggle={this.toggle}>Input SKU Quantities</ModalHeader>
                <ModalBody>
                    {skuNodes}
                </ModalBody>
                <ModalFooter>
                    <Button id = "submitbutton" type="submit" color="primary" onClick={() => this.props.handleSubmit(this.getQuantities())}>Submit</Button>{' '}
                </ModalFooter>
            </div>
        );
    };
}

SelectQuantities.propTypes = {
    data: PropTypes.array,
    handleSubmit: PropTypes.func,
    toggle: PropTypes.func
}