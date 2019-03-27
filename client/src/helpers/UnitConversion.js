import { bool } from "prop-types";
import Calculations from "../components/SalesReport/Calculations";

// Unit conversion for Ingredients units

export default class UnitConversion {
    static toOunce(val){
        let num = parseFloat(val.split(' ')[0]);
        let unit = val.split(' ')[1];
        switch (unit){
            case 'oz':
                var number = Calculations.checkValLength(num);
                return number + ' oz';
            case 'ounce':
                var number = Calculations.checkValLength(num);
                return number + ' oz';            
            case 'lb':
            case 'pound':
                var number = Calculations.checkValLength(num*16);
                return number + ' oz'
            case 'ton':
                var number = Calculations.checkValLength(num*32000);
                return number + ' oz';
            case 'g':
            case 'gram':
                var number = Calculations.checkValLength(num*0.035274);
                return number + ' oz'
            case 'kg':
            case 'kilogram':
                var number = Calculations.checkValLength(num*35.274);
                return number + ' oz'
            default:
                return 'invalid unit';
        }
    }
    static toPound(val){
        let num = parseFloat(val.split(' ')[0]);
        let unit = val.split(' ')[1];
        switch (unit){
            case 'ounce':
            case 'oz':
                var number = Calculations.checkValLength(num/16);
                return number + ' lb'
            case 'lb':
            case 'pound':
                var number = Calculations.checkValLength(num);
                return number + ' lb'
            case 'ton':
                var number = Calculations.checkValLength(num*2000);
                return number + ' lb'
            case 'g':
            case 'gram':
                var number = Calculations.checkValLength(num*0.00220462);
                return number + ' lb'
            case 'kg':
            case 'kilogram':
                var number = Calculations.checkValLength(num*2.20462);
                return number + ' lb'
            default:
                return 'invalid unit'
        }
    }

    static toTon(val){
        let num = parseFloat(val.split(' ')[0]);
        let unit = val.split(' ')[1];
        switch (unit){
            case 'oz':
            case 'ounce':
                var number = Calculations.checkValLength(num/16);
                return number + ' ton'
            case 'lb':
            case 'pound':
                var number = Calculations.checkValLength(num/32000);

                return number + ' ton'
            case 'ton':
                var number = Calculations.checkValLength(num);
                return number + ' ton'
            case 'g':
            case 'gram':
                var number = Calculations.checkValLength(num/907185);
                return number + ' ton'
            case 'kg':
            case 'kilogram':
                var number = Calculations.checkValLength(num/907.185);
                return number + ' ton'
            default:
                return 'invalid unit'
        }
    }

    static toGram(val){
        let num = parseFloat(val.split(' ')[0]);
        let unit = val.split(' ')[1];
        switch (unit){
            case 'oz':
            case 'ounce':
                var number = Calculations.checkValLength(num*28.3495);
                return number + ' g'
            case 'lb':
            case 'pound':
                var number = Calculations.checkValLength(num*453.592);
                return number + ' g'
            case 'ton':
                var number = Calculations.checkValLength(num*907185);
                return number + ' g'
            case 'g':
            case 'gram':
                var number = Calculations.checkValLength(num);
                return number + ' g'
            case 'kg':
            case 'kilogram':
                var number = Calculations.checkValLength(num*1000);
                return number + ' g'
            default:
                return 'invalid unit'
        }
    }

    static toKilogram(val){
        let num = parseFloat(val.split(' ')[0]);
        let unit = val.split(' ')[1];
        switch (unit){
            case 'oz':
            case 'ounce':
                var number = Calculations.checkValLength(num/35.274);
                return number + ' kg'
            case 'lb':
            case 'pound':
                var number = Calculations.checkValLength(num/2.20462);
                return number + ' kg'
            case 'ton':
                var number = Calculations.checkValLength(num*907.185);
                return number + ' kg'
            case 'g':
            case 'gram':
                var number = Calculations.checkValLength(num/1000);
                return number + ' kg'
            case 'kg':
            case 'kilogram':
                var number = Calculations.checkValLength(num);
                return number + ' kg'            
            default:
                return 'invalid unit'
        }
    }

    static toFluidOunce(val){
        let num = parseFloat(val.split(' ')[0]);
        let unit = val.split(' ')[1];
        switch (unit){
            case 'floz':
            case 'fluidounce':
                var number = Calculations.checkValLength(num);
                return number + ' floz'
            case 'pt':
            case 'pint':
                var number = Calculations.checkValLength(num/0.0625);
                return  number  + ' floz'
            case 'qt':
            case 'quart':
                var number = Calculations.checkValLength(num/0.03125);
                return  number  + ' floz'
            case 'gal':
            case 'gallon':
                var number = Calculations.checkValLength(num/0.0078125);
                return  number  + ' floz'
            case 'ml':
            case "milliliter":
                var number = Calculations.checkValLength(num/29.5735);
                return  number  + ' floz'
            case 'l':
            case "liter":
                var number = Calculations.checkValLength(num/0.0295735);
                return  number  + ' floz'
            default:
                return 'invalid unit'
        }
    }

    static toPint(val){
        let num = parseFloat(val.split(' ')[0]);
        let unit = val.split(' ')[1];
        switch (unit){
            case 'floz':
            case 'fluidounce':
                var number = Calculations.checkValLength(num/16);
                return  number  + ' pt'
            case 'pt':
            case 'pint':
                var number = Calculations.checkValLength(num);
                return number + ' pt'
            case 'qt':
            case 'quart':
                var number = Calculations.checkValLength(num/0.5);
                return  number + ' pt'
            case 'gal':
            case 'gallon':
                var number = Calculations.checkValLength(num/0.125);
                return  number  + ' pt'
            case 'ml':
            case 'milliliter':
                var number = Calculations.checkValLength(num/473.176);
                return  number  + ' pt'
            case 'l':
            case 'liter':
                var number = Calculations.checkValLength(num/0.473176);
                return  number + ' pt'
            default:
                return 'invalid unit'
        }
    }

    static toQuart(val){
        let num = parseFloat(val.split(' ')[0]);
        let unit = val.split(' ')[1];
        switch (unit){
            case 'floz':
            case 'fluidounce':
                var number = Calculations.checkValLength(num*0.03125);
                return  number  + ' qt'
            case 'pt':
            case 'pint':
                var number = Calculations.checkValLength(num*0.5);
                return  number  + ' qt'
            case 'qt':
            case 'quart':
                var number = Calculations.checkValLength(num);
                return number + ' qt'
            case 'gal':
            case 'gallon':
                var number = Calculations.checkValLength(num*4);
                return  number  + ' qt'
            case 'ml':
            case 'milliliter':
                var number = Calculations.checkValLength(num*0.00105669);
                return  number  + ' qt'
            case 'l':
            case 'liter':
                var number = Calculations.checkValLength(num*1.05669);
                return  number  + ' qt'
            default:
                return 'invalid unit'
        }
    }

    static toGallon(val){
        let num = parseFloat(val.split(' ')[0]);
        let unit = val.split(' ')[1];
        switch (unit){
            case 'floz':
            case 'fluidounce':
                var number = Calculations.checkValLength(num*0.0078125);
                return  number  + ' gal'
            case 'pt':
            case 'pint':
                var number = Calculations.checkValLength(num*0.125);
                return  number  + ' gal'
            case 'qt':
            case 'quart': 
                var number = Calculations.checkValLength(num*0.25);
                return  number  + ' gal'
            case 'gal':
            case 'gallon':
                var number = Calculations.checkValLength(num);
                return  number  + ' gal'
            case 'ml':
            case 'milliliter':
                var number = Calculations.checkValLength(num*0.000264172);
                return  number  + ' gal'
            case 'l':
            case 'liter':
                var number = Calculations.checkValLength(num*0.264172);
                return  number  + ' gal'
            default:
                return 'invalid unit'
        }
    }

    static toMilliliter(val){
        let num = parseFloat(val.split(' ')[0]);
        let unit = val.split(' ')[1];
        switch (unit){
            case 'floz':
            case 'fluidounce':
                var number = Calculations.checkValLength(num*29.5735);
                return  number  + ' ml'
            case 'pt':
            case 'pint':
                var number = Calculations.checkValLength(num*473.176);
                return  number  + ' ml'
            case 'qt':
            case 'quart':
                var number = Calculations.checkValLength(num*946.353);
                return  number  + ' ml'
            case 'gal':
            case 'gallon':
                var number = Calculations.checkValLength(num*3785.41);
                return  number  + ' ml'
            case 'ml':
            case 'milliliter':
                var number = Calculations.checkValLength(num);
                return  number  + ' ml'
            case 'l':
            case 'liter':
                var number = Calculations.checkValLength(num*1000);
                return  number  + ' ml'
            default:
                return 'invalid unit'
        }
    }

    static toLiter(val){
        let num = parseFloat(val.split(' ')[0]);
        let unit = val.split(' ')[1];
        switch (unit){
            case 'floz':
            case 'fluidounce':
                var number = Calculations.checkValLength(num*0.0295735);
                return  number + ' l'
            case 'pt':
            case 'pint':
                var number = Calculations.checkValLength(num*0.473176);
                return  number  + ' l'
            case 'qt':
            case 'quart':
                var number = Calculations.checkValLength(num*0.946353);
                return  number  + ' l'
            case 'gal':
            case 'gallon':
                var number = Calculations.checkValLength(num*3.78541);
                return  number  + ' l'
            case 'ml':
            case 'milliliter':
                var number = Calculations.checkValLength(num*0.001);
                return  number  + ' l'
            case 'l':
            case 'liter':
                var number = Calculations.checkValLength(num);
                return  number  + ' l'
            default:
                return 'invalid unit'
        }
    }

    static toCount(val){
        let unit = val.split(' ')[1];
        if (unit === 'ct' || unit === 'count'){
            return val
        }
        return 'invalid unit'
    }
    /*
    let t = getconv()
    t = { success: bool, func: f}
    t.func(val)*/

    static getConversionFunction(unit_string) {
        
        let match = unit_string.match('^([0-9]+(?:[\.][0-9]{0,20})?|\.[0-9]{1,20}) (oz|ounce|lb|pound|ton|g|gram|kg|kilogram|' + 
                                      'floz|fluidounce|pt|pint|qt|quart|gal|gallon|ml|milliliter|l|liter|ct|count)$')
        if (match === null) {
            return { success: false, error: 'Incorrect String Format'}
        }
        let val = match[1]
        let unit = match[2]
      
        switch (unit) {
            case 'oz':
            case 'ounce': 
                return { success: true, func: UnitConversion.toOunce};
            case 'lb':
            case 'pound':
                return { success: true, func: UnitConversion.toPound};
            case 'ton':
                return { success: true, func: UnitConversion.toTon};
            case 'g':
            case 'gram':
                return { success: true, func: UnitConversion.toGram};
            case 'kg':
            case 'kilogram':
                return { success: true, func: UnitConversion.toKilogram};
            case 'floz':
            case 'fluidounce':
                return { success: true, func: UnitConversion.toFluidOunce};
            case 'pt':
            case 'pint':
                return { success: true, func: UnitConversion.toPint};
            case 'qt':
            case 'quart':
                return { success: true, func: UnitConversion.toQuart};
            case 'gal':
            case 'gallon':
                return { success: true, func: UnitConversion.toGallon};
            case 'ml':
            case 'milliliter':
                return { success: true, func: UnitConversion.toMilliliter};
            case 'l':
            case 'liter':
                return { success: true, func: UnitConversion.toLiter};
            case 'ct':
            case 'count':
                return { success: true, func: UnitConversion.toCount};
            default:
                return { success: false, error: 'Incorrect String Format, code fault too'}
        
        }
    }

    static getUnitType(unit_string){
        if(/^([0-9]+(?:[\.][0-9]{0,20})?|\.[0-9]{1,20}) (oz|ounce|pound|lb|ton|g|gram|kilogram|kg)$/.test(unit_string)) return 1;
        if(/^([0-9]+(?:[\.][0-9]{0,20})?|\.[0-9]{1,20}) (floz|fluidounce|pint|pt|quart|qt|gallon|gal|ml|milliliter|liter|l)$/.test(unit_string)) return 2;
        if(/^([0-9]+(?:[\.][0-9]{0,20})?|\.[0-9]{1,20}) (ct|count)$/.test(unit_string)) return 3;
        return -1;
    }

    static getCleanUnitForm(unit_string) {
        let reg = unit_string.match('^([0-9]+(?:[\.][0-9]{0,20})?|\.[0-9]{1,20}) ?(.*)')
      
        let num = reg[1]
        unit_string = reg[2]
        unit_string = unit_string.replace(/ /g, '')
        unit_string = unit_string.replace(/\./g, '')
        unit_string = unit_string.toLowerCase();
        if (unit_string.substr(unit_string.length - 1) === 's'){
            unit_string = unit_string.substr(0, unit_string.length - 1)
        }
        let possible_units = ['oz', 'ounce', 'lb', 'pound', 'ton', 'g', 'gram', 'kg', 'kilogram', 'floz', 
                              'fluidounce', 'pt', 'pint', 'qt', 'quart', 'gal', 'gallon', 'ml', 'milliliter',
                              'l', 'liter', 'ct', 'count']
        if (possible_units.includes(unit_string)){
            return { success: true, data: num + ' ' + unit_string }
        }
        return { success: false, error: 'Incorrect String Format' }
    }

}