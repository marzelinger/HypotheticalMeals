import React from 'react'
import PropTypes from 'prop-types';
import CheckDigit from 'checkdigit';
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

export default class ManufacturingLineDetailsEdit extends React.Component {
    constructor(props) {
        super(props);
        console.log("this is the whole props; "+JSON.stringify(this.props));

        let {
            item_properties, 
            item_property_labels,
            item_property_patterns,
            item_property_field_type } = DataStore.getLineData();

        this.state = {
            item_properties,
            item_property_labels,
            item_property_patterns,
            item_property_field_type,
            invalid_inputs: [],
            // detail_view_options: [Constants.details_create, Constants.details_cancel],
            item: {
                skus: [],
                name: props.manu_line.name,
                short_name: props.manu_line.short_name,
                comment: props.manu_line.comment},
            page_title: 'SKUs',
            data: [],
        }

        console.log("this is the itme in the constructor of edit; "+JSON.stringify(this.state.item));
        console.log("this is tprops; "+JSON.stringify(this.props.manu_line));

        // this.setState({
        //     item:{this.props.manu_line.
        //     name: item.name,
        //     skus: item.skus,
        //     short_name: item.short_name,
        //     comment: item.comment
        // })
        //this.toggle = this.toggle.bind(this);
    }

    async componentDidMount() {
        console.log("this is the compo; "+JSON.stringify(this.state.item));

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

    onModifyList = (option, value) => {
        var item = Object.assign({}, this.state.item);
        switch (option) {
            case Constants.details_add:
                this.addSku(item, value);
                break;
            case Constants.details_remove:
                this.removeSku(item, value);
                break;
        }
        this.setState({ 
            item: item,
            item_changed: true 
        })
    }

    removeSku(item, value) {
        let ind = -1;
        item.skus.map((sku, index) => {
            if (sku._id === value._id)
                ind = index;
        });
        if (ind > -1) {
            item.skus.splice(ind,1);
        }
        this.setState({ item: item })
    }

    addSku(item, value) {
        let ind = -1;
        item.skus.map((sku, index) => {
            if (sku._id === value._id)
                ind = index;
        });
        if (ind > -1){
            return;
        }
        else {
            item.skus.push(value);
        }
        this.setState({ item: item })
    }

    async handleSubmit(e, opt) {
        if (![Constants.details_save, Constants.details_create].includes(opt)) {
            if(this.props.handleDetailViewSubmit(e, this.state.item, opt)){
                //this.setState({modal: false})
            };
            return;
        }
        await this.validateInputs();
        let alert_string = 'Invalid Fields';
        let inv = this.state.invalid_inputs;
        if (inv.length === 0) {
            if(this.props.handleDetailViewSubmit(e, this.state.item, opt)){
                //this.setState({modal: false})
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
        if(!inv_in.includes('short_name')){
            let vsm = await this.props.validateShortName(this.state.item.short_name);
            if(!vsm){
                inv_in.push('short_name');
            }
        }
        await this.setState({ invalid_inputs: inv_in });
    }

    injectProperties = () => {
        //console.log("in inject; "+JSON.stringify(this.state.item));
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

    // toggle = async () => {
    //     console.log('toggling');
    //     try{
    //         var item = await ItemStore.getEmptyItem(Constants.manu_line_page_name);
    //         console.log(item);
    //         await this.setState({ 
    //             //modal: !this.state.modal,
    //             item: item,
    //             detail_view_options: [Constants.details_create, Constants.details_delete, Constants.details_cancel]
    //         })
    //     } catch (e){
    //         console.log(e);
    //     }
        
    //   }

    render() {
        return (
        <div>
        {/* <img className = "hoverable" id = "button" src={addButton} onClick={this.toggle}></img> */}
            {/* <Modal isOpen={this.props.details_modal} toggle={this.toggle} id="popup" className='item-details'> */}
            <Modal isOpen={this.props.details_modal} id="popup" className='item-details'>

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
                        simple = {true}
                    />
                    {
                        this.state.item.skus.map(sku => {
                            return (<h3>{sku.name}</h3>)
                        })
                    }
                </div>
                <div className='item-options'>
                    { this.props.detail_view_options.map(opt => 
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

ManufacturingLineDetailsEdit.propTypes = {
    handleDetailViewSubmit: PropTypes.func.isRequired,
    manu_line: PropTypes.object.isRequired,
    details_modal: PropTypes.bool.isRequired,
    detail_view_action: PropTypes.string,
    detail_view_options: PropTypes.arrayOf(PropTypes.string)
  };
