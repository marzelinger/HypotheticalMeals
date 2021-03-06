import React from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, ModalHeader, ModalBody } from 'reactstrap';
import calculatorButton from '../../../resources/calculator.png';
import ManuGoalsCalculatorTable from '../ManuGoalsCalculatorTable';
import SubmitRequest from '../../../helpers/SubmitRequest';
import UnitConversion from '../../../helpers/UnitConversion';


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
    console.log('toggling')
    this.setState({
      modal: !this.state.modal
    });
    console.log("this is the toggleYES: ");
    await this.setState({ingredients_info: [], current_ingredient_ids: []});
    await this.getIngredientInfo();
  }

  addIngredientInfo = async (ingredient, quantity) => {
    let ingPckgData = await this.parseIngUnit(ingredient.pkg_size);
    var ingValPCK = ingPckgData['val'];
    //convert ingVal to be same unit as ingValpck
    var convertVal= 0;
    let {success,func} = UnitConversion.getConversionFunction(ingredient.pkg_size);
    if(success){
      var result = func(ingredient.quantity);
      let resData = await this.parseIngUnit(result);
      var convertVal = resData['val'];
    }
    else {console.log('failure in getConversionFunction ' + ingredient.name)}
    if(this.state.current_ingredient_ids.includes(ingredient._id)){
       var index =  this.state.current_ingredient_ids.indexOf(ingredient._id);
       var currentData = this.state.ingredients_info;
       currentData[index].unitQuantity = currentData[index].unitQuantity + (quantity * convertVal);
       currentData[index].pckgQuant = currentData[index].pckgQuant + (quantity * convertVal)/ingValPCK;
       await this.setState({ingredients_info: currentData});
    }   
    else{
      // also need package quantity which is quantity * ingredient quantity (total amount of ingredients in formula units / total number of ingredient in a package in package units)
        var newIngredient = {
            ...ingredient, 
            unitQuantity: (quantity * convertVal),
            pckgQuant: (quantity * convertVal)/ingValPCK
            //unitQuantity: quantityVal * ingredient.quantity
        }
        let info = this.state.ingredients_info;
        info.push(newIngredient);
        await this.setState({ingredients_info: info, current_ingredient_ids: [...this.state.current_ingredient_ids, ingredient._id]})
    }
  }

  // broken rn bc using old structure of skus
  getIngredientInfo = async () => {
      console.log("activities" + JSON.stringify(this.props.activities));

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
          console.log("ingr with quantity"+JSON.stringify(ingr_with_quantity));
          console.log("this is the quant: "+quantity);
          await this.addIngredientInfo(ingr_with_quantity, quantity);
        }
        index++;
      })
      return this.state.ingredients_info
  }

  parseIngUnit = (unit_string) => {
    let match = unit_string.match('^([0-9]+(?:[\.][0-9]{0,20})?|\.[0-9]{1,20}) (oz|ounce|lb|pound|ton|g|gram|kg|kilogram|' + 
    'floz|fluidounce|pt|pint|qt|quart|gal|gallon|ml|milliliter|l|liter|ct|count)$')
    if (match === null) {
      console.log('no match for ' + unit_string)
      return {};
    }
  
    let val = match[1]
    let unit = match[2]
    console.log("val: "+ val + "    unit: "+unit);
    return  {val: val, unit: unit};
  }


  render(){
    
    return (
      <div>
        <img id = "button" src={calculatorButton} onClick={this.toggle}></img>
        <Modal isOpen={this.state.modal} toggle={this.toggle} id="popup">
          <ModalHeader toggle={this.toggle}>Calculator Results</ModalHeader>
          <ModalBody class = "modal">
              <ManuGoalsCalculatorTable toggle = {this.toggle} data = {this.state.ingredients_info}></ManuGoalsCalculatorTable>
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