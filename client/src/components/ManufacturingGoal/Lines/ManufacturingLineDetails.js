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
import SimpleLineTable from './SimpleLineTable';
import ItemSearchModifyListQuantity from '../../ListPage/ItemSearchModifyListQuantity';
// import { constants } from 'http2';

export default class ManufacturingLineDetails extends React.Component {
    constructor(props) {
        super(props);

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
            modal: false,
            detail_view_options: this.props.options,
            item: {skus: []},
            page_title: 'SKUs',
            data: [],
            shortNameChanged: false
        }
        this.toggle = this.toggle.bind(this);
        this.onModifyList = this.onModifyList.bind(this);
        this.removeSku = this.removeSku.bind(this);
        this.addSku = this.addSku.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
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

    onPropChange = async(value, item, prop) => {
        if (prop === 'short_name' && value.length > 5) {
            alert('Manufacturing Line shortname must be a maximum of 5 characters!')
            return
        }
        if (prop === 'name' && value.length > 32) {
            alert('Manufacturing Line name must be a maximum of 32 characters!')
            return
        }
        item[prop] = value
        await this.setState({ item: item });
    };

    onModifyList = async(option, value) => {
        var item = Object.assign({}, this.state.item);
        console.log("this is the modify list: ");
        switch (option) {
            case Constants.details_add:
                this.addSku(item, value);
                break;
            case Constants.details_remove:
                this.removeSku(item, value);
                break;
        }
        await this.setState({ 
            item: item,
            item_changed: true 
        })
    }

    async removeSku(item, value) {
        // console.log("deleting sku");
        let ind = -1;
        item.skus.map((sku, index) => {
            // console.log("here is the sku: "+JSON.stringify(sku));
            if (sku._id === value._id)
                ind = index;
                // console.log("here is the ind: "+JSON.stringify(ind));

        });
        if (ind > -1) {
            item.skus.splice(ind,1);
            // console.log("this is the itme skus: "+JSON.stringify(item.skus));
            // var skus_to_delete = [];
            // skus_to_delete.push()
        }
        await this.setState({ item: item })
    }

    async addSku(item, value) {
        // console.log("adding sku");
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
        await this.setState({ item: item })
    }

    async checkSKUsManuLinesBeforeDelete(){
        //go through skus, if any of them only have that manu line, cannot delete
        var depend_skus = [];
        if(this.state.item.skus!=undefined){
            for(let s = 0; s<this.state.item.skus.length; s++){
                var curSKU = this.state.item.skus[s];
                if(curSKU.manu_lines!=undefined){
                    if(curSKU.manu_lines.includes(this.state.item._id)){
                        if(curSKU.manu_lines.length==1){
                            //this is the only manu line the sku has, cannot be deleted.
                            depend_skus.push(curSKU.name);
                        }
                    }
                }
            }
        }
        if(depend_skus.length!=0){
            alert(Constants.sku_dependency_exists+JSON.stringify(depend_skus));
            return {error: true};
        }
        else{
            return {error: false};
        }

    }
    async handleSubmit(e, opt) {
        if (![Constants.details_save, Constants.details_create].includes(opt)) {
            if(this.props.handleDetailViewSubmit(e, this.state.item, opt)){
                //TODO CHECK IF YOU CAN DELETE THIS.
                await this.setState({modal: false})
            };
            return;
        }
        // if([Constants.details_delete].includes(opt)){
        //     //go through the skus and make sure that can't delete one if the skus.
        //     var res = await this.checkSKUsManuLinesBeforeDelete();
        //     if(!res.error){
        //         if(this.props.handleDetailViewSubmit(e, this.state.item, opt)){
        //             //TODO CHECK IF YOU CAN DELETE THIS.
        //             await this.setState({modal: false})
        //         };
        //         return;
        //     }
        // }
        else{
            await this.validateInputs();
            let alert_string = 'Invalid Fields';
            let inv = this.state.invalid_inputs;
            if (inv.length === 0) {
                if(this.props.handleDetailViewSubmit(e, this.state.item, opt)){
                    await this.setState({modal: false})
                }
            }
            else {
                alert(alert_string);
            } 
        }
    }

    async validateInputs() { 
        var inv_in = [];
        this.state.item_properties.map(prop => {
            if (!this.state.item[prop].toString().match(this.getPropertyPattern(prop))) inv_in.push(prop);
        })
        if(!inv_in.includes('short_name')){
            let vsm = await this.props.validateShortName(this.state.item.short_name, this.state.item._id);
            // console.log("vsm: "+vsm);
            if(!vsm){
                inv_in.push('short_name');
            }
        }
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
        // console.log('toggling');
        try{
            var item = this.props.item || await ItemStore.getEmptyItem(Constants.manu_line_page_name);

            //var item = await ItemStore.getEmptyItem(Constants.manu_line_page_name);
            // console.log(item);
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
        // console.log("these are the skus: "+JSON.stringify(this.state.item));
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
                    <ItemSearchModifyListQuantity
                        api_route={Constants.skus_page_name}
                        item_type={Constants.details_modify_skus}
                        options={[Constants.details_add, Constants.details_remove]}
                        handleModifyList={this.onModifyList}
                        qty_disable = {true}
                    />
                    <SimpleLineTable skus = {this.state.item.skus} >
                    </SimpleLineTable>
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

ManufacturingLineDetails.propTypes = {
    handleDetailViewSubmit: PropTypes.func
    
  };
