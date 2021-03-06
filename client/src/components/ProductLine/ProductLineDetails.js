import React from 'react'
import PropTypes from 'prop-types';
import * as Constants from '../../resources/Constants';
import { 
    Button,
    Input,
    FormGroup,
    Label,
    Modal } from 'reactstrap';
import DataStore from '../../helpers/DataStore'
import ItemStore from '../../helpers/ItemStore';
import addButton from '../../resources/add.png';

export default class ProductLineDetails extends React.Component {
    constructor(props) {
        super(props);
        let {
            item_properties, 
            item_property_labels,
            item_property_patterns,
            item_property_field_type } = DataStore.getProductLineData();

        this.state = {
            item_properties,
            item_property_labels,
            item_property_patterns,
            item_property_field_type,
            invalid_inputs: [],
            modal: false,
            detail_view_options: this.props.options,
            item: {skus: []},
            page_title: 'SKUs',
            data: [],
            shortNameChanged: false
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
        item[prop] = value
        this.setState({ item: item });
    };

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
            return (this.state.item_properties.map(prop => 
                <FormGroup key={prop}>
                    <Label>{this.getPropertyLabel(prop)}</Label>
                    <Input 
                        type={this.getPropertyFieldType(prop)}
                        value={ this.state.item[prop] }
                        invalid={ this.state.invalid_inputs.includes(prop) }
                        onChange={ (e) => this.onPropChange(e.target.value, this.state.item, prop)}
                    />
                </FormGroup>));
        }
        return;
    }

    toggle = async () => {
        console.log('toggling');
        try{
            var item = this.props.item || await ItemStore.getEmptyItem(Constants.manu_line_page_name);
            await this.setState({ 
                modal: !this.state.modal,
                item: item,
                //detail_view_options: [Constants.details_create, Constants.details_delete, Constants.details_cancel]
            })
        } catch (e){
            console.log(e);
        }
        
      }

    render() {
        return (
        <div>
        <img id = "buttonline" src={this.props.buttonImage} onClick={this.toggle}></img>
            <Modal isOpen={this.state.modal} toggle={this.toggle} id="popup" className='item-details'>
            <div className='item-details'>
                <div className='item-title'>
                    <h1>{ this.state.item  ? this.state.item.name : Constants.undefined }</h1>
                </div>
                <div className='item-properties'>
                    { this.injectProperties() }
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

ProductLineDetails.propTypes = {
    handleDetailViewSubmit: PropTypes.func
  };
