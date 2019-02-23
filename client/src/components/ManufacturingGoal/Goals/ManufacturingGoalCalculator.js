import React from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, ModalHeader, ModalBody } from 'reactstrap';
import calculatorButton from '../../../resources/calculator.png';
import ManuGoalsCalculatorTable from '../ManuGoalsCalculatorTable';
import SubmitRequest from '../../../helpers/SubmitRequest';

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

  addIngredientInfo = async (ingredient, quantity) => {
    if(this.state.current_ingredient_ids.includes(ingredient._id)){
       var index =  this.state.current_ingredient_ids.indexOf(ingredient._id);
       var currentData = this.state.ingredients_info;
       currentData[index].unitQuantity = currentData[index].unitQuantity + (quantity * ingredient.quantity);
       await this.setState({ingredients_info: currentData});
    }   
    else{
      // also need package quantity which is quantity * ingredient quantity (total amount of ingredients in formula units / total number of ingredient in a package in package units)
        console.log('setting state');
        console.log(ingredient.quantity);
        var newIngredient = {
            ...ingredient, 
            unitQuantity: quantity * ingredient.quantity
        }
        let info = this.state.ingredients_info;
        info.push(newIngredient);
        await this.setState({ingredients_info: info, current_ingredient_ids: [...this.state.current_ingredient_ids, ingredient._id]})
    }
  }

  // broken rn bc using old structure of skus
  getIngredientInfo = async () => {
      console.log(this.props.activities);
      let index = 0;
      await this.props.activities.forEach( async (activity) => {
        var quantity = activity.quantity * activity.sku.scale_factor;
        var ingredients = activity.sku.formula.ingredients;
        var ingr_quantities = activity.sku.formula.ingredient_quantities;
        for(var i = 0; i < ingredients.length; i ++){
          var ingr_with_quantity = {
            ...ingredients[i],
            quantity: ingr_quantities[i]
          }
          console.log(ingr_with_quantity)
          await this.addIngredientInfo(ingr_with_quantity, quantity);
        }
        index++;
      })
      return this.state.ingredients_info
  }

  render(){
    
    return (
      <div>
        <img className = "hoverable" id = "button" src={calculatorButton} onClick={this.toggle}></img>
        <Modal size = {'lg'} isOpen={this.state.modal} toggle={this.toggle} id="popup">
          <ModalHeader toggle={this.toggle}>Calculator Results</ModalHeader>
          <ModalBody class = "modal">
              <ManuGoalsCalculatorTable data = {this.state.ingredients_info}></ManuGoalsCalculatorTable>
          </ModalBody>
        </Modal>
      </div>
    )
  }
}

ManufacturingGoalCalculator.propTypes = {
    activities: PropTypes.array,
    name: PropTypes.string,
};