import { bool } from "prop-types";

// Unit conversion for Ingredients units

export default class UnitConversion {
    static toOunce(val){
        let num = parseFloat(val.split(' ')[0]);
        let unit = val.split(' ')[1];
        switch (unit){
            case 'ounce': 
            case 'oz':
                return val;
            case 'ounce':
                return num + ' oz';
            case 'lb':
            case 'pound':
                return num*16 + ' oz'
            case 'pound':
                return num*16 + ' oz'
            case 'ton':
                return num*32000 + ' oz';
            case 'g':
            case 'gram':
                return num*0.035274 + ' oz'
            case 'kg':
            case 'kilogram':
                return num*35.274 + ' oz'
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
                return num/16 + ' lb'
            case 'lb':
            case 'pound':
                return val
            case 'pound':
                return num + ' lb'
            case 'ton':
                return num*2000 + ' lb'
            case 'g':
            case 'gram':
                return num*0.00220462 + ' lb'
            case 'kg':
            case 'kilogram':
                return num*2.20462 + ' lb'
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
                return num/16 + ' ton'
            case 'lb':
            case 'pound':
                return num/32000 + ' ton'
            case 'pound':
                return num/32000 + ' ton'
            case 'ton':
                return val
            case 'g':
            case 'gram':
                return num/907185 + ' ton'
            case 'kg':
            case 'kilogram':
                return num/907.185 + ' ton'
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
                return num*28.3495 + ' g'
            case 'lb':
            case 'pound':
                return num*453.592 + ' g'
            case 'pound':
                return num*453.592 + ' g'
            case 'ton':
                return num*907185 + ' g'
            case 'g':
            case 'gram':
                return val
            case 'kg':
            case 'kilogram':
                return num*1000 + ' g'
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
                return num/35.274 + ' kg'
            case 'lb':
            case 'pound':
                return num/2.20462 + ' kg'
            case 'pound':
                return num/2.20462 + ' kg'
            case 'ton':
                return num*907.185 + ' kg'
            case 'g':
            case 'gram':
                return num/1000 + ' kg'
            case 'kg':
            case 'kilogram':
                return val
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
                return val
            case 'pt':
            case 'pint':
                return  num/0.0625  + ' floz'
            case 'qt':
            case 'quart':
                return  num/0.03125  + ' floz'
            case 'gal':
            case 'gallon':
                return  num/0.0078125  + ' floz'
            case 'ml':
            case "milliliter":
                return  num/29.5735  + ' floz'
            case 'l':
            case "liter":
                return  num/0.0295735  + ' floz'
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
                return  num/16  + ' pt'
            case 'pt':
            case 'pint':
                return val
            case 'qt':
            case 'quart':
                return  num/0.5  + ' pt'
            case 'gal':
            case 'gallon':
                return  num/0.125  + ' pt'
            case 'ml':
            case 'milliliter':
                return  num/473.176  + ' pt'
            case 'l':
            case 'liter':
                return  num/0.473176  + ' pt'
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
                return  num*0.03125  + ' qt'
            case 'pt':
            case 'pint':
                return  num*0.5  + ' qt'
            case 'qt':
            case 'quart':
                return val
            case 'gal':
            case 'gallon':
                return  num*4  + ' qt'
            case 'ml':
            case 'milliliter':
                return  num*0.00105669  + ' qt'
            case 'l':
            case 'liter':
                return  num*1.05669  + ' qt'
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
                return  num*0.0078125  + ' gal'
            case 'pt':
            case 'pint':
                return  num*0.125  + ' gal'
            case 'qt':
            case 'quart': 
                return  num*0.25  + ' gal'
            case 'gal':
            case 'gallon':
                return val
            case 'ml':
            case 'milliliter':
                return  num*0.000264172  + ' gal'
            case 'l':
            case 'liter':
                return  num*0.264172  + ' gal'
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
                return  num*29.5735  + ' ml'
            case 'pt':
            case 'pint':
                return  num*473.176  + ' ml'
            case 'qt':
            case 'quart':
                return  num*946.353  + ' ml'
            case 'gal':
            case 'gallon':
                return  num*3785.41  + ' ml'
            case 'ml':
            case 'milliliter':
                return val
            case 'l':
            case 'liter':
                return  num*1000  + ' ml'
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
                return  num*0.0295735  + ' l'
            case 'pt':
            case 'pint':
                return  num*0.473176  + ' l'
            case 'qt':
            case 'quart':
                return  num*0.946353  + ' l'
            case 'gal':
            case 'gallon':
                return  num*3.78541  + ' l'
            case 'ml':
            case 'milliliter':
                return  num*0.001  + ' l'
            case 'l':
            case 'liter':
                return val
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