// IngredientItemDetails.js
// Riley
// Item details popup that is used for viewing, editing and creating Ingredients

import React from 'react'
import PropTypes from 'prop-types';
import * as Constants from '../../resources/Constants';
import { 
    Button,
    Input,
    InputGroup,
    InputGroupAddon} from 'reactstrap';
import DataStore from '../../helpers/DataStore'
import DetailsViewSkuTable from './DetailsViewSkuTable'
import ItemSearchInput from './ItemSearchInput';
import SubmitRequest from '../../helpers/SubmitRequest';


export default class SkuDetails extends React.Component {
    constructor(props) {
        super(props);

        let {
            item_properties, 
            item_property_labels } = DataStore.getSkuData();

        this.state = {
            item_properties,
            item_property_labels,
            assisted_search_results: [],
            prod_line_item: {}
        }
    }

    async componentDidMount() {
        await this.fillProductLine();
    }

    async fillProductLine() {
        var res = {};
        if (this.props.item.prod_line !== '') {
            res = await SubmitRequest.submitGetProductLineByID(this.props.item.prod_line);
            if (res === undefined || !res.success) res.data[0] = {};
        }
        else {
            res.data = {}
            res.data[0] = {}
        }
        this.setState({ prod_line_item: res.data[0] });
    }

    getPropertyLabel = (prop) => {
        return this.state.item_property_labels[this.state.item_properties.indexOf(prop)];
    }

    onSelectProductLine = (pl) => {
        this.props.handlePropChange(pl._id, this.props.item, 'prod_line');
        this.setState({
            prod_line_item: pl
        })
    }

    injectProperties = () => {
        if (this.props.item){
            return (this.state.item_properties.map(prop => 
                <InputGroup key={prop}>
                    <InputGroupAddon addonType="prepend">{this.getPropertyLabel(prop)}</InputGroupAddon>
                    <Input 
                        value={ this.props.item[prop] }
                        onChange={ (e) => this.props.handlePropChange(e.target.value, this.props.item, prop) }
                    />
                </InputGroup>));
        }
        return;
    }

    render() {
        return (
        <div className='item-details'>
            <div className='item-title'>
                <h1>{ this.props.item  ? this.props.item.name : Constants.undefined }</h1>
            </div>
            <div className='item-properties'>
                { this.injectProperties() }
                <ItemSearchInput
                    curr_item={this.state.prod_line_item}
                    item_type={Constants.prod_line_label}
                    handleSelectItem={this.onSelectProductLine}
                />
            </div>
            <div className='item-options'>
                { this.props.detail_view_options.map(opt => 
                    <Button key={opt} onClick={(e) => this.props.handleDetailViewSubmit(e, this.props.item, opt)}>
                        {opt}
                    </Button>
                )}
            </div>
        </div>
        );
    }
}

SkuDetails.propTypes = {
    item: PropTypes.object,
    detail_view_options: PropTypes.arrayOf(PropTypes.string),
    handlePropChange: PropTypes.func,
    handleDetailViewSubmit: PropTypes.func
  };