import React from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import calculatorButton from '../resources/calculator.png';
import ManuGoalsCalculatorTable from './ManuGoalsCalculatorTable';
import SubmitRequest from './../helpers/SubmitRequest';

// * 1. need to iterate through each sku and get the quantity, calculate the quantity of the sku units
// * 2. for each sku need to iterate through each ingredient
// * 3. for each ingredient calculate the quantity based on the sku unit quantity (in packages)
// * 4. add this quantity to the ingredient entry if it exists, otherwise push it into the list of ingredients

export default class ManufacturingGoalCalculator extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      modal: false,
      ingredients_info: [],
      current_ingredient_ids: []
    };

    this.toggle = this.toggle.bind(this);
  }

  toggle = async () => {
    this.setState({
      modal: !this.state.modal
    });

    await this.setState({ingredients_info: [], current_ingredient_ids: []});
    await this.getIngredientInfo();
  }

  calculateSkuUnitQuantity = (quantity, sku) => {
      console.log(quantity);
      return quantity * Number(sku.cpc);
  }

  addIngredientInfo = async (ingredient, quantity) => {
    if(this.state.current_ingredient_ids.includes(ingredient.quantity)){
       var index =  this.state.current_ingredient_ids.indexOf(ingredient.id);
       var currentData = this.state.ingredients_info;
       currentData[index].quantity = currentData[index].quantity + (quantity * ingredient.quantity);
       await this.setState({ingredients_info: currentData});
    }   
    else{
        console.log('setting state');
        console.log(ingredient.quantity);
        var newIngredient = {
            ...ingredient, 
            goalQuantity: quantity * ingredient.quantity
        }
        let info = this.state.ingredients_info;
        info.push(newIngredient);
        await this.setState({ingredients_info: info, current_ingredient_ids: [...this.state.current_ingredient_ids, ingredient.id]})
    }
  }

  getIngredientInfo = async () => {
      console.log(this.props.skus);
      let index = 0;
      await this.props.skus.forEach( async (sku) => {
        var {data, skuData} = await SubmitRequest.submitGetPopulatedSkuIngredients(sku);
        var quantity = this.calculateSkuUnitQuantity(this.props.quantities[index], skuData);
        await data.forEach( async(ingredient) => {
            await this.addIngredientInfo(ingredient, quantity);
        })
        index++;
      })
      return this.state.ingredients_info
  }

  render(){
    
    return (
      <div>
        <img id = "button" src={calculatorButton} onClick={this.toggle}></img>
        <Modal isOpen={this.state.modal} toggle={this.toggle} id="popup">
          <ModalHeader toggle={this.toggle}>Calculator Results</ModalHeader>
          <ModalBody>
              <ManuGoalsCalculatorTable data = {this.state.ingredients_info}></ManuGoalsCalculatorTable>
          </ModalBody>
        </Modal>
      </div>
    )
  }
}

ManufacturingGoalCalculator.PropTypes = {
    skus: PropTypes.array,
    name: PropTypes.string,
    quantities: PropTypes.array
};