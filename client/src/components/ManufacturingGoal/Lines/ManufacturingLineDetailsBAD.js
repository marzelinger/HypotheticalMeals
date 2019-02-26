
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

export default class ManufacturingLineDetailsBAD extends React.Component {
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
            //modal: false,
            // detail_view_options: [Constants.details_create, Constants.details_cancel],
            manu_line: Object.assign({}, props.manu_line),
            //item_skus: {skus: []},
            page_title: 'SKUs',
        }
        // this.toggle = this.toggle.bind(this);
        this.setState({manu_line:{skus:[]}});
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

    // onPropChange = (value, item, prop) => {
    //     item[prop] = value
    //     this.setState({ item_skus: item });

    // };

        onPropChange = (value, manu_line, prop) => {
        manu_line[prop] = value
        this.setState({ manu_line: manu_line });

    };

    onModifyList = (option, value) => {
        var item = Object.assign({}, this.state.manu_line);
        switch (option) {
            case Constants.details_add:
                this.addSku(item, value);
                break;
            case Constants.details_remove:
                this.removeSku(item, value);
                break;
        }
        this.setState({ 
            manu_line: item,
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
        this.setState({ manu_line: item })
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
        this.setState({ manu_line: item })
    }

    async handleSubmit(e, opt) {
        if (![Constants.details_save, Constants.details_create].includes(opt)) {
            if(this.props.handleDetailViewSubmit(e, this.state.manu_line, opt)){
                //this.setState({modal: false})
            };
            return;
        }
        await this.validateInputs();
        let alert_string = 'Invalid Fields';
        let inv = this.state.invalid_inputs;
        if (inv.length === 0) {
            if(this.props.handleDetailViewSubmit(e, this.state.manu_line, opt)){
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
            if (!this.state.manu_line[prop].toString().match(this.getPropertyPattern(prop))) inv_in.push(prop);
        })
        if(!inv_in.includes('short_name')){
            let vsm = await this.props.validateShortName(this.state.manu_line.short_name);
            if(!vsm){
                inv_in.push('short_name');
            }
        }
        await this.setState({ invalid_inputs: inv_in });
    }

    injectProperties = () => {
        if (this.state.manu_line!=undefined){
            return (this.state.item_properties.map(prop => 
                <FormGroup key={prop}>
                    <Label>{this.getPropertyLabel(prop)}</Label>
                    <Input 
                        type={this.getPropertyFieldType(prop)}
                        value={ this.state.manu_line[prop] }
                        invalid={ this.state.invalid_inputs.includes(prop) }
                        onChange={ (e) => this.onPropChange(e.target.value, this.state.manu_line, prop)}
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
    //             modal: !this.state.modal,
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
            {//onclick should happen when you are using the details at the bottom, not if you are just editing it with pencil
            }
            {/* {this.props.detail_view_action===Constants.details_create ? 
        (<img className = "hoverable" id = "button" src={addButton} onClick={this.toggle}></img>)
        :<div/>} */}
            <Modal isOpen={this.props.modal} id="popup" className='item-details'>
            <div className='item-details'>
                <div className='item-title'>
                    <h1>{ this.state.manu_line  ? this.state.manu_line.name : Constants.undefined }</h1>
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
                        this.state.manu_line.skus.map(sku => {
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

ManufacturingLineDetailsBAD.propTypes = {
    handleDetailViewSubmit: PropTypes.func,
    detail_view_options: PropTypes.arrayOf(PropTypes.string),
    detail_view_action: PropTypes.string,
    validateShortName: PropTypes.func,
    modal:PropTypes.bool,
    manu_line:PropTypes.object
  };