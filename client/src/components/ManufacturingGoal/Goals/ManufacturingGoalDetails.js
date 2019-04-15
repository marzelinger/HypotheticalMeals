
import React from 'react'
import PropTypes from 'prop-types';
import CheckDigit from '../../../helpers/CheckDigit';
import * as Constants from '../../../resources/Constants';
import { 
    Button,
    Input,
    FormGroup,
    Label,
    Modal, FormFeedback } from 'reactstrap';
import DataStore from '../../../helpers/DataStore'
import ItemStore from '../../../helpers/ItemStore';
import ItemSearchModifyListQuantity from '../../ListPage/ItemSearchModifyListQuantity';
import SimpleGoalTable from '../SimpleGoalTable';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import SubmitRequest from '../../../helpers/SubmitRequest';
import Switch from "react-switch";
import SalesProjectionModal from './SalesProjectionModal';
import AuthRoleValidation from '../../auth/AuthRoleValidation';


export default class ManufacturingGoalDetails extends React.Component {
    constructor(props) {
        super(props);
        let {
            item_properties, 
            item_property_labels,
            item_property_patterns,
            item_property_field_type } = DataStore.getGoalData();

        this.state = {
            item: Object.assign({}, props.item),
            item_properties,
            item_property_labels,
            item_property_patterns,
            item_property_field_type,
            invalid_inputs: [],
            page_title: 'SKUs',
            data: [],
            showSalesProjection: false,
            sku_sales_projection: null,
            deleted_activities: []
        }

        this.onModifyList = this.onModifyList.bind(this);
        this.removeSku = this.removeSku.bind(this);
        this.addSku = this.addSku.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.validateInputs = this.validateInputs.bind(this);
        this.onEnable = this.onEnable.bind(this);
        this.toggleSalesProjection = this.toggleSalesProjection.bind(this);
        this.onSalesProjectionExitButton = this.onSalesProjectionExitButton.bind(this);
        this.useAverageFromSalesProjection = this.useAverageFromSalesProjection.bind(this);
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

    onPropChange = async (value, item, prop) => {
        item[prop] = value
        await this.setState({ item: item });
    };

    toggleSalesProjection = async () => {
        await this.setState({
            showSalesProjection: !this.state.showSalesProjection,
        })
    }

    async onSalesProjectionExitButton() {
        await this.setState({
            showSalesProjection: false,
        });
    }

    onModifyList = async (option, value, qty) => {
        var item = Object.assign({}, this.state.item);
        switch (option) {
            case Constants.details_add:
                await this.addSku(item, value, qty);
                break;
            case Constants.details_remove:
                await this.removeSku(item, value, qty);
                break;
            case Constants.details_sales_projection:
                await this.setState({
                    sku_sales_projection: value,
                    showSalesProjection: true,
                });
                break;
        }
        await this.setState({ 
            item: item,
            item_changed: true 
        })
    }

    removeSku = async (item, value, qty) => {
        let ind = -1;
        qty = parseInt(qty);
        item.activities.map((activity, index) => {
            if (activity.sku._id === value._id)
                ind = index;
        });
        if (ind > -1) {
            if(item.activities[ind].scheduled){
                alert("You cannot edit activities that have already been scheduled");
                return;
            }
            let curr_qty = item.activities[ind].quantity
            curr_qty = curr_qty - qty;
            if (curr_qty > 0){
                item.activities[ind].quantity = Math.round(item.activities[ind].quantity - qty);
            } 
            else {
                //want to add this item to the deletect_activities variable.
                console.log("activities to delete in details11: "+JSON.stringify(activities_to_delete));
                var act = item.activities[ind];
                var activities_to_delete = this.state.deleted_activities;
                activities_to_delete.push(act);
                console.log("activities to delete in details: "+JSON.stringify(activities_to_delete));
                await this.setState({
                    deleted_activities: activities_to_delete
                });
                //splicing it from the activities that will eventually be added.
                item.activities.splice(ind,1);
            }
        }
        await this.setState({ item: item })
    }

    addSku = async(item, value, qty) => {
        let ind = -1;
        qty = parseInt(qty);
        item.activities.map((activity, index) => {
            if (activity.sku._id === value._id)
                ind = index;
        });
        if (ind > -1){
            if(item.activities[ind].scheduled){
                alert("You cannot edit activities that have already been scheduled");
                return;
            }
            item.activities[ind].quantity  = Math.round(item.activities[ind].quantity + qty);
        }
        else {
            var new_activity = {sku: value, quantity: qty}
            item.activities.push(new_activity);
        }
        await this.setState({ item: item })
    }

    // handleDeleteGoal = async () => {
    //     //if any activities are scheduled
    //     if(this.props.goal.enabled){
    //       alert("You cannot delete an enabled manufacturing goal")
    //       console.log("return false")
    //       return false;
    //     }
    //     else{
    //       if(this.props.activities.filter((activity => activity.scheduled)).length != 0){
    //         if(window.confirm("Deleting this goal will remove all orphaned activities from the schedule, are you sure you want to delete?")){
    //           for(var i = 0; i < this.props.activities.length; i ++){
    //             await SubmitRequest.submitDeleteItem('manuactivities', this.props.activities[i]);
    //             this.props.activities.splice(i, 1);
    //           }
    //           this.props.handleDeleteGoal(this.props.id)
    //           return true;
    //         }
    //         return false;
    //       }
    //       else{
    //         for(var i = 0; i < this.props.activities.length; i ++){
    //           console.log('deleting activity')
    //           await SubmitRequest.submitDeleteItem('manuactivities', this.props.activities[i]);
    //           this.props.activities.splice(i, 1);
    //         }
    //         this.props.handleDeleteGoal(this.props.id)
    //         return true;
    //       }
    //     }
    //   }

    async handleSubmit(e, opt) {
        if (![Constants.details_save, Constants.details_create, Constants.details_delete].includes(opt)) {
            var return_val = await this.props.handleDetailViewSubmit(e, this.state.item, opt);
            if(return_val){
                this.props.toggle();
            };
            return;
        }
        if ([Constants.details_delete].includes(opt)) {
            if(this.state.item.enabled){
                alert("You cannot delete an enabled manufacturing goal")
                return false;
            }
            var return_val = await this.props.handleDetailViewSubmit(e, this.state.item, opt);
            if(return_val){
                this.props.toggle();
            };
            return;
        }
        await this.validateInputs();
        let alert_string = 'Invalid Fields';
        let inv = this.state.invalid_inputs;
        if (inv.length === 0) {
            var item = this.state.item;
            item.deadline = new Date(item.deadline)
            var return_val = await this.props.handleDetailViewSubmit(e, item, opt)
            if(return_val.success){
                await this.setState({errorText: ''})
                this.props.toggle();
            }
            else{
                alert(`${alert_string}, ${return_val.error}`)
                // this.setState({invalid_inputs: [...this.state.invalid_inputs, 'name']})
            }
        }
        else {
            alert(alert_string);
        } 
    }

    async validateInputs() { 
        var inv_in = [];
        var error_text = '';
        this.state.item_properties.forEach(prop => {
            if (!this.state.item[prop].toString().match(this.getPropertyPattern(prop))){
                inv_in.push(prop);
                error_text = 'Manufacturing Goals need a name.'
            }
        })
        if(inv_in.length == 0){
            var resp = await SubmitRequest.submitQueryString(`/api/manugoals_name/${this.state.item.name}`);
            if(resp.success) {
                if(!this.state.item._id || this.state.item._id != resp.data[0]._id){
                    inv_in.push('name');
                    error_text = 'Manufacturing Goal with this name already exists.'
                } 
            }
        }
        var date = new Date(this.state.item['deadline'])
        if(!Boolean(+date))inv_in.push('deadline')
        await this.setState({ invalid_inputs: inv_in, errorText: error_text });
    }

    useAverageFromSalesProjection(avg) {
        var qty = {};
        qty.target = {};
        qty.target.value = avg
        this.refs.child.onQuantityChange(qty)

        this.setState({
            showSalesProjection: false,
        })
    }

    onEnable = async () => {
        var action = !this.state.item.enabled ? 'enable' : 'disable';
        var result = !this.state.item.enabled ? 'a need to schedule all currently scheduled activities' : 'all currently scheduled activities becoming orphaned.';

        if(window.confirm(`Are you sure you want to ${action} this goal? Doing so will result in ${result}`)){
            var item = this.state.item
            await this.setState({
                item: {...item, enabled: !this.state.item.enabled}
            });
        }
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
                        errorText = {this.state.errorText}
                        onChange={ (e) => this.onPropChange(e.target.value, this.state.item, prop)}
                        disabled = {!((AuthRoleValidation.checkRole(this.props.user, Constants.business_manager) && this.props.item.user ==this.props.user.username)|| AuthRoleValidation.checkRole(this.props.user, Constants.admin))}
                    />
                    <FormFeedback invalid>{this.state.errorText}</FormFeedback>
                </FormGroup>));

            var enable = this.props.detail_view_options.includes(Constants.details_save) && ((AuthRoleValidation.checkRole(this.props.user, Constants.business_manager) && this.props.item.user ==this.props.user.username)|| AuthRoleValidation.checkRole(this.props.user, Constants.admin)) ? 
            <FormGroup>
                <Label>Enabled</Label>
                <br></br>
                <Switch 
                onColor = '#98FB98' 
                onChange={this.onEnable} 
                checked={this.state.item.enabled} 
                disabled = {!((AuthRoleValidation.checkRole(this.props.user, Constants.business_manager) && this.props.item.user ==this.props.user.username)|| AuthRoleValidation.checkRole(this.props.user, Constants.admin))}


                />
            </FormGroup> : 
            <div></div>
            return (
                <div>
                    {inputs}
                    {enable}
                    <FormGroup>
                    <Label>Deadline</Label>
                    <br></br>
                    <TextField
                        id="data"
                        type="date"
                        value = {this.state.item['deadline']}
                        className={`text ${this.state.invalid_inputs.includes('deadline') ? 'is-invalid form-control' : ''}`}
                        onClick = {(event) => this.onPropChange(event.target.value, this.state.item, 'deadline')}
                        onKeyPress = {(event) => this.onPropChange(event.target.value, this.state.item, 'deadline')}
                        onChange = {(event) => this.onPropChange((event.target.value), this.state.item, 'deadline')}
                        disabled = {!((AuthRoleValidation.checkRole(this.props.user, Constants.business_manager) && this.props.item.user ==this.props.user.username)|| AuthRoleValidation.checkRole(this.props.user, Constants.admin))}
                        
                        
                        InputLabelProps={{
                        shrink: true,
                        }}
                    />
                    </FormGroup>
                </div>
                )
        }

    }

    render() {
        return (
        <div className = 'details' style = {{border: this.state.item.enabled ? 'solid thick #98FB98' : 'solid thick grey'}}>
            <div className='item-details'>
                <div className='item-title'>
                    <h1>{ this.state.item  ? this.state.item.name : Constants.undefined }</h1>
                </div>
                <div className='item-properties'>
                    { this.injectProperties() }
                    <ItemSearchModifyListQuantity ref="child"
                        api_route={Constants.skus_page_name}
                        item_type={Constants.details_modify_skus}
                        options={[Constants.details_add, Constants.details_remove, Constants.details_sales_projection]}
                        handleModifyList={this.onModifyList}
                        disabled = {!((AuthRoleValidation.checkRole(this.props.user, Constants.business_manager) && this.props.item.user ==this.props.user.username)|| AuthRoleValidation.checkRole(this.props.user, Constants.admin))}


                    />
                    <Modal isOpen={this.state.showSalesProjection} toggle={this.toggleSalesProjection}>
                        <SalesProjectionModal 
                            item={this.state.sku_sales_projection}
                            onExitButton={this.onSalesProjectionExitButton}
                            useAverage={this.useAverageFromSalesProjection}>
                        </SalesProjectionModal>
                    </Modal>

                    <SimpleGoalTable
                    activities = {this.state.item.activities}
                    ></SimpleGoalTable>
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
        </div>
        );
    }
}

ManufacturingGoalDetails.propTypes = {
    handleDetailViewSubmit: PropTypes.func,
  };