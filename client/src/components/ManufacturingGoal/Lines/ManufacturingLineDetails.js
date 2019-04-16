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
import AuthRoleValidation from '../../auth/AuthRoleValidation';
import SubmitRequest from '../../../helpers/SubmitRequest';
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

    async checkUserPlantManagersBeforeDelete(){
        var plant_manager_by_manu_line = await SubmitRequest.submitGetPlantManagerByManuLineID(this.props.item._id);
        console.log(" all_skus_manu_line: "+JSON.stringify(plant_manager_by_manu_line));
        if(plant_manager_by_manu_line.success){
          if(plant_manager_by_manu_line.data!=undefined){
            for(let u = 0; u<plant_manager_by_manu_line.data.length; u++){
              var curUser = plant_manager_by_manu_line.data[u];
              var manu_lines = curUser.manu_lines;
              console.log("manu_lines: "+JSON.stringify(manu_lines));
              if(manu_lines.length == 1){
                  //this is plant m only has this manu_line
                  //can't delete this.
                  return {error: true}
              }
            }
          }
            return { name: '', error: null, success: true };
          }
        return {error: plant_manager_by_manu_line.error, success: false};
    }








    async handleSubmit(e, opt) {
        if (![Constants.details_save, Constants.details_create].includes(opt)) {
            if(this.props.handleDetailViewSubmit(e, this.state.item, opt)){
                //TODO CHECK IF YOU CAN DELETE THIS.
                await this.setState({modal: false})
            };
            return;
        }
        if([Constants.details_delete].includes(opt)){
            //go through the users and make sure that can't delete one if a plant manager is only for that line.
            var res = await this.checkUserPlantManagersBeforeDelete();
            if(!res.error){
                if(this.props.handleDetailViewSubmit(e, this.state.item, opt)){
                    await this.setState({modal: false})
                };
                return;
            }
            else if(res.error){
                alert("This manufacturing line cannot be deleted because it is still being managed by one or more plant managers. Please reassign those plant managers before deleting this manufacturing line.");
            }
        }
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
                        disabled = {!AuthRoleValidation.checkRole(this.props.user, Constants.product_manager)}
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
        return (
        <div>
        
            {!AuthRoleValidation.checkRole(this.props.user, Constants.product_manager) && this.props.buttonImage===addButton
            ?
            <div/>
            :
            <img id = "buttonline" src={this.props.buttonImage} onClick={this.toggle}></img>
            }
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
                        disabled = {!AuthRoleValidation.checkRole(this.props.user, Constants.product_manager)}
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
