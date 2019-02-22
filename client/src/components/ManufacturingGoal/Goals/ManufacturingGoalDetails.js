
import React from 'react'
import PropTypes from 'prop-types';
import CheckDigit from '../../../helpers/CheckDigit';
import * as Constants from '../../../resources/Constants';
import { 
    Button,
    Input,
    FormGroup,
    Label,
    Modal } from 'reactstrap';
import DataStore from '../../../helpers/DataStore'
import ItemStore from '../../../helpers/ItemStore';
import addButton from '../../../resources/add.png';
import ItemSearchModifyListQuantity from '../../ListPage/ItemSearchModifyListQuantity';
import SimpleGoalTable from '../SimpleGoalTable';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';


export default class ManufacturingGoalDetails extends React.Component {
    constructor(props) {
        super(props);

        let {
            item_properties, 
            item_property_labels,
            item_property_patterns,
            item_property_field_type } = DataStore.getGoalData();

        this.state = {
            item_properties,
            item_property_labels,
            item_property_patterns,
            item_property_field_type,
            invalid_inputs: [],
            modal: false,
            detail_view_options: [Constants.details_create, Constants.details_cancel],
            item: {},
            page_title: 'SKUs',
            data: [],
        }
        this.toggle = this.toggle.bind(this);
    }

    async componentDidMount() {

    }

    getPropertyLabel = (prop) => {
        return this.state.item_property_labels[this.state.item_properties.indexOf(prop)];
    }

    getPropertyPattern = (prop) => {
        return this.state.item_property_patterns[this.state.item_properties.indexOf(prop)];
    }

    getPropertyFieldType = (prop) => {
        return this.state.item_property_field_type[this.state.item_properties.indexOf(prop)];
    }

    onPropChange = (value, item, prop) => {
        console.log(value)
        item[prop] = value
        this.setState({ item: item });
    };

    onModifyList = (option, value, qty) => {
        var item = Object.assign({}, this.state.item);
        switch (option) {
            case Constants.details_add:
                this.addSku(item, value, qty);
                break;
            case Constants.details_remove:
                this.removeSku(item, value, qty);
                break;
        }
        this.setState({ 
            item: item,
            item_changed: true 
        })
    }

    removeSku(item, value, qty) {
        let ind = -1;
        qty = parseInt(qty);
        item.skus.map((sku, index) => {
            if (sku._id === value._id)
                ind = index;
        });
        if (ind > -1) {
            let curr_qty = item.quantities[ind];
            curr_qty = curr_qty - qty;
            if (curr_qty > 0) item.quantities[ind] = curr_qty;
            else {
                item.skus.splice(ind,1);
                item.quantities.splice(ind,1);
            }
        }
        this.setState({ item: item })
    }

    addSku(item, value, qty) {
        let ind = -1;
        qty = parseInt(qty);
        item.skus.map((sku, index) => {
            if (sku._id === value._id)
                ind = index;
        });
        if (ind > -1){
            let curr_qty = item.quantities[ind];
            curr_qty = curr_qty + qty;
            item.quantities[ind] = curr_qty;
        }
        else {
            item.skus.push(value);
            item.quantities.push(qty);
        }
        this.setState({ item: item })
    }

    async handleSubmit(e, opt) {
        if (![Constants.details_save, Constants.details_create].includes(opt)) {
            if(this.props.handleDetailViewSubmit(e, this.state.item, opt)){
                this.setState({modal: false})
            };
            return;
        }
        await this.validateInputs();
        let alert_string = 'Invalid Fields';
        let inv = this.state.invalid_inputs;
        if (inv.length === 0) {
            if(this.props.handleDetailViewSubmit(e, this.state.item, opt)){
                this.setState({modal: false})
            }
        }
        else {
            alert(alert_string);
        } 
    }

    async validateInputs() { 
        var inv_in = [];
        this.state.item_properties.map(prop => {
            if (!this.state.item[prop].toString().match(this.getPropertyPattern(prop))) inv_in.push(prop);
        })
        await this.setState({ invalid_inputs: inv_in });
    }

    injectProperties = () => {
        if (this.state.item!=undefined){
            var inputs =  (this.state.item_properties.map(prop => 
                <FormGroup key={prop}>
                    <Label>{this.getPropertyLabel(prop)}</Label>
                    <Input 
                        type={this.getPropertyFieldType(prop)}
                        value={ this.state.item[prop] }
                        invalid={ this.state.invalid_inputs.includes(prop) }
                        onChange={ (e) => this.onPropChange(e.target.value, this.state.item, prop)}
                    />
                </FormGroup>));
            return (
                <div>
                    {inputs}
                    <TextField
                        id="datetime-local"
                        label="Deadline"
                        type="datetime-local"
                        defaultValue="2017-05-24T10:30"
                        className={'text'}
                        onChange = {(event) => this.onPropChange(event.target.value, this.state.item, 'deadline')}
                        InputLabelProps={{
                        shrink: true,
                        }}
                    />
                    {/* <FormGroup>
                        <Label>Deadline</Label>
                        <DatePicker value={ this.state.item['deadline']} onChange={ (e, date) => this.onPropChange(date, this.state.item, 'deadline')} hintText="Select deadline" />
                    </FormGroup> */}
                </div>
                )
        }

    }

    toggle = async () => {
        console.log('toggling');
        try{
            var item = await ItemStore.getEmptyItem(Constants.manugoals_page_name);
            console.log(item);
            await this.setState({ 
                modal: !this.state.modal,
                item: item,
                detail_view_options: [Constants.details_create, Constants.details_delete, Constants.details_cancel]
            })
        } catch (e){
            console.log(e);
        }
        
      }

    render() {
        return (
        <div>
        <img className = "hoverable" id = "button" src={addButton} onClick={this.toggle}></img>
            <Modal isOpen={this.state.modal} toggle={this.toggle} id="popup" className='item-details'>
            <div className='item-details'>
                <div className='item-title'>
                    <h1>{ this.state.item  ? this.state.item.name : Constants.undefined }</h1>
                </div>
                <div className='item-properties'>
                    { this.injectProperties() }
                    <ItemSearchModifyListQuantity
                        api_route={Constants.skus_page_name}
                        item_type={Constants.details_add_sku}
                        options={[Constants.details_add, Constants.details_remove]}
                        handleModifyList={this.onModifyList}
                    />
                    <SimpleGoalTable
                    skus = {this.state.item.skus}
                    quantities = {this.state.item.quantities}
                    ></SimpleGoalTable>
                </div>
                <div className='item-options'>
                    { this.state.detail_view_options.map(opt => 
                        <Button 
                            className = "detailButtons"
                            key={opt} 
                            onClick={(e) => this.handleSubmit(e, opt)}
                        >{opt}</Button>
                    )}
                </div>
            </div>
            </Modal>
        </div>
        );
    }
}

ManufacturingGoalDetails.propTypes = {
    handleDetailViewSubmit: PropTypes.func,
  };