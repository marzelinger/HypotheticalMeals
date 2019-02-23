// ItemSearchModifyListQuantity.js
// Riley
// Individual search component to add/delete items to a list

import React from 'react'
import PropTypes from 'prop-types';
import { 
    Button,
    Input,
    Label,
    FormGroup, 
    ListGroup,
    ListGroupItem} from 'reactstrap';
import * as Constants from '../../resources/Constants';
import SubmitRequest from '../../helpers/SubmitRequest'
import FormulaDetails from '../ListPage/FormulaDetails';
import IngredientsViewSimple from './IngredientsViewSimple'
import ItemSearchInput from './ItemSearchInput';
import ItemSearchModifyListQuantity from './ItemSearchModifyListQuantity';
import printFuncFront from '../../printFuncFront';
import DataStore from '../../helpers/DataStore'



import Filter from './Filter'

const currentUserIsAdmin = require("../auth/currentUserIsAdmin");


export default class SkuFormulaDetails extends React.Component {
    constructor(props) {
        super(props);

        let {
            formula_item_properties, 
            formula_item_property_labels,
            formula_item_property_patterns,
            formula_item_property_field_type } = DataStore.getSkuFormulaDetailsData();

        this.toggleFocus = this.toggleFocus.bind(this);
        this.toggleBlur = this.toggleBlur.bind(this);
        this.onFilterValueChange = this.onFilterValueChange.bind(this);
        this.state = {
            width: 100,
            focus: false,
            substr: '',
            value: '',
            qty: 0,
            assisted_search_results: [],
            newFormula: false,
            existingFormula: false,
            // sku: {this.props.sku}
            item: Object.assign({}, this.props.item),
            // formula_item: Object.assign({}, props.formula_item),
            formula_item_properties,
            formula_item_property_labels,
            formula_item_property_patterns,
            formula_item_property_field_type,
            invalid_inputs: [],
            // assisted_search_results: [],
            // prod_line_item: {},
            // to_undo: {}
        };
    }

    async componentDidUpdate (prevProps, prevState) {
        if (prevState.substr !== this.state.substr) {
            await this.updateResults();
        }

    }

    async updateResults() {
        if (this.props.item_type === Constants.details_modify_ingredient && this.state.substr.length > 0) {
            var res = await SubmitRequest.submitGetIngredientsByNameSubstring(this.state.substr);
        }
        if (this.props.item_type === Constants.modify_manu_lines_label && this.state.substr.length > 0) {
            var res = await SubmitRequest.submitGetManufacturingLinesByNameSubstring(this.state.substr);
        }
        // if (this.props.item_type === Constants.details_modify_formula && this.state.substr.length > 0) {
        //     var res = await SubmitRequest.submitGetIngrByNameSubstring(this.state.substr);
        // }

        else {
            var res = {};
            res.data = []
        }
        if (res === undefined || !res.success) res.data = [];
        this.setState({ assisted_search_results: res.data });
    }

    toggleFocus() {
        if (this){
            this.setState({
                focus: true
            })
        }
    }

    toggleBlur() {
        if (this){
            this.setState({
                focus: false
            })
        }
    }

    onFilterValueChange = (value, e) => {
        if (e.action === 'input-change'){
            this.setState({
                substr: value
            });
            return value;
        }
        return this.setState.substr;
    }

    onQuantityChange = (e) => {
        this.setState({
            qty: e.target.value
        });
    }

    getFormulaPropertyLabel = (prop) => {
        return this.state.formula_item_property_labels[this.state.formula_item_properties.indexOf(prop)];
    }

    

    getFormulaPropertyPattern = (prop) => {
        return this.state.formula_item_property_patterns[this.state.formula_item_properties.indexOf(prop)];
    }

    getFormulaPropertyFieldType = (prop) => {
        return this.state.formula_item_property_field_type[this.state.formula_item_properties.indexOf(prop)];
    }

    async onFilterValueSelection (name, value, e) {
        console.log(value);
        this.setState({value: value});
    }

    determineButtonDisplay(state, option) {
        switch (option) {
            case Constants.details_add:
                return (state.value === '' || (state.qty <= 0 && this.props.qty_disable !== true))
            case Constants.details_remove:
                return (state.value === '' || (state.qty <= 0 && this.props.qty_disable !== true))
        }
    }

    handleNewFormula = (value) => {
        this.setState({
            newFormula: true
        });

        //want to show the formula details module.


    }

    handleExistingFormula = () => {
        this.setState({
            existingFormula: true
        });

    }

    switchFormulaInitial = () =>{

        switch(this.props.detail_view_action){
            //creating a newFormula
          //case Constants.details_create:
            //want to show the buttons here.
            // return (<div>
            //             <Button color="primary" onClick = {(e) => this.handleNewFormula(e.target.value)}>Create New Formula</Button>{' '}
            //             <Button color="secondary" onClick = {() => this.handleExistingFormula()} disabled = {this.state.newFormula}>Add Existing Formula</Button>{' '}
            //         </div>);
          case Constants.details_edit:
            //want to show the regular stuff here.
            return  (
                <div>
              {this.formulaPropItemIng()}
              </div>
            );
        }



    }

    formulaPropItemIng = () => {
        return  (
            <div>
              { this.injectFormulaProperties() }
              <ItemSearchModifyListQuantity
                  api_route={Constants.ingredients_page_name}
                  item_type={Constants.details_modify_ingredient}
                  options={[Constants.details_add, Constants.details_remove]}
                  handleModifyList={this.props.handleModifyList}
                  disabled = {currentUserIsAdmin().isValid ? false : true}
              />
              <IngredientsViewSimple 
                  formula={this.props.formula_item} 
                  handlePropChange={this.props.handleFormulaPropChange}
                  //handleFormulaPropChange={this.props.handleFormulaPropChange}
                  disabled={currentUserIsAdmin().isValid ? false : true}
              />
            
          </div>
          );
    }

    switchFormulaCreateDisplay = () => {
        console.log("this is the param:");
        //either want to show the existing formula situation
        //or we want to show the buttons for the choosing between new and old.
            switch(this.state.newFormula){
                //creating a newFormula
            case true:
                return (
                <div>
                    {this.formulaPropItemIng()}
                </div>
                );
            // case false:
            //     return  (
            //     <div> 
            //         {/* {this.formulaSelectButtons()} */}
            //     </div>
            //     );
        }
        switch(this.state.existingFormula){
            //using existing Formula
        case true:
            return (
            <div>
                <ItemSearchInput
                    curr_item={this.props.formula_item}
                    item_type={Constants.formula_label}
                    invalid_inputs={this.state.invalid_inputs}
                    handleSelectItem={this.props.handleSelectFormulaItem}
                    disabled = {currentUserIsAdmin().isValid ? false : true}
                />
                {this.props.existingFormulaSelected}
                        {this.props.existingFormulaSelected?
            <div>
            {this.formulaPropItemIng()}
            </div>
            :
            <div>no existingformulaselected</div>
        }
            </div>
            );
        // case false:
        //     return  (
        //     <div> 
        //     </div>
        //     );
    }
        
      };




    formulaSelectButtons = () => {
        return (
            <div>
                        <Button color="primary" onClick = {(e) => this.handleNewFormula(e.target.value)} disabled = {this.state.existingFormula}>Create New Formula</Button>{' '}
                        <Button color="secondary" onClick = {() => this.handleExistingFormula()} disabled = {this.state.newFormula}>Add Existing Formula</Button>{' '}
            </div>
        );
    }


    removeIngredient(item, value, qty) {
        
        let ind = -1;
        qty = parseInt(qty);
        item.ingredients.map((ing, index) => {
            if (ing._id === value._id)
                ind = index;
        });
        if (ind > -1) {
            let curr_qty = item.ingredient_quantities[ind];
            curr_qty = curr_qty - qty;
            if (curr_qty > 0) item.ingredient_quantities[ind] = curr_qty;
            else {
                item.ingredients.splice(ind,1);
                item.ingredient_quantities.splice(ind,1);
            }
        }
        this.setState({ item: item })
    }

    addIngredient(item, value, qty) {
        let ind = -1;
        qty = parseInt(qty);
        printFuncFront("this is the current item trying to add to: "+JSON.stringify(item));
        item.ingredients.map((ing, index) => {
            if (ing._id === value._id)
                ind = index;
        });
        console.log()
        if (ind > -1){
            let curr_qty = item.ingredient_quantities[ind];
            curr_qty = curr_qty + qty;
            item.ingredient_quantities[ind] = curr_qty;
        }
        else {
            item.ingredients.push(value);
            item.ingredient_quantities.push(qty);
        }
        this.setState({ item: item })
    }

   injectFormulaProperties = () => {
    if (this.props.formula_item){
        //printFuncFront('this is the item in the injecting formulaprops: '+JSON.stringify(this.state.formula_item));
        //let formula = await SubmitRequest.submitGetFormulaByID(this.state.item.formula);
        //printFuncFront('this is the formula: '+JSON.stringify(formula));
        // console.log()
        return (this.state.formula_item_properties.map(prop => 
            <FormGroup key={prop}>
                <Label>{this.getFormulaPropertyLabel(prop)}</Label>
                <Input 
                    type={this.getFormulaPropertyFieldType(prop)}
                    value={ this.props.formula_item[prop] }
                    invalid={ this.state.invalid_inputs.includes(prop) }
                    onChange={ (e) => this.props.handleFormulaPropChange(e.target.value, this.props.formula_item, prop)}
                    disabled = {currentUserIsAdmin().isValid ? "" : "disabled"}
               />
            </FormGroup>));
    }
    return;
}

    render() {
        return (
        <div className='item-properties'>
        <div>Formula</div>
        {this.switchFormulaInitial()}
        {this.props.detail_view_action===Constants.details_create ?
            <div>
            {this.formulaSelectButtons()}
            {this.switchFormulaCreateDisplay()}
            </div>
            :
            <div/>
        }
        {/* {this.switchFormulaCreateDisplay()} */}

        {/* <ItemSearchModifyListQuantity
                    api_route={Constants.ingredients_page_name}
                    item_type={Constants.details_modify_ingredient}
                    options={[Constants.details_add, Constants.details_remove]}
                    handleModifyList={this.props.handleModifyList}
                    disabled = {currentUserIsAdmin().isValid ? false : true}
                />
        <IngredientsViewSimple 
                    formula={this.state.formula_item} 
                    handlePropChange={this.props.handleFormulaPropChange}
                    //handleFormulaPropChange={this.props.handleFormulaPropChange}
                    disabled={currentUserIsAdmin().isValid ? false : true}
                /> */}
        </div>
        );
    }
}

SkuFormulaDetails.propTypes = {
    item: PropTypes.object,
    formula_item: PropTypes.object,
    handleFormulaPropChange: PropTypes.func,
    handleModifyList: PropTypes.func,
    detail_view_action: PropTypes.string,
    handleSelectFormulaItem: PropTypes.func,
    formula_line_item: PropTypes.object,
    existingFormulaSelected: PropTypes.bool
    //handleNewFormula: PropTypes.func,
    //handleExistingFormula: PropTypes.func
    //options: PropTypes.arrayOf(PropTypes.string),
    //handleModifyList: PropTypes.func,
    //qty_disable: PropTypes.bool,
    //disabled: PropTypes.bool
  };