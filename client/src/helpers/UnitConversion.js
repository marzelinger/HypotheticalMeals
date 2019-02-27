// Unit conversion for Ingredients units

export default class UnitConversion {
    static toOunce(val){
        let num = parseFloat(val.split(' ')[0]);
        let unit = val.split(' ')[1];
        switch (unit){
            case 'oz':
                return val;
            case 'lb':
                return num*16 + ' oz'
            case 'ton':
                return num*32000 + ' oz'
            case 'g':
                return num*0.035274 + ' oz'
            case 'kg':
                return num*35.274 + ' oz'
            default:
                return 'invalid unit'
        }
    }
    static toPound(val){
        let num = parseFloat(val.split(' ')[0]);
        let unit = val.split(' ')[1];
        switch (unit){
            case 'oz':
                return num/16 + ' lb'
            case 'lb':
                return val
            case 'ton':
                return num*2000 + ' lb'
            case 'g':
                return num*0.00220462 + ' lb'
            case 'kg':
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
                return num/16 + ' ton'
            case 'lb':
                return num/32000 + ' ton'
            case 'ton':
                return val
            case 'g':
                return num/907185 + ' ton'
            case 'kg':
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
                return num*28.3495 + ' g'
            case 'lb':
                return num*453.592 + ' g'
            case 'ton':
                return num*907185 + ' g'
            case 'g':
                return val
            case 'kg':
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
                return num/35.274 + ' kg'
            case 'lb':
                return num/2.20462 + ' kg'
            case 'ton':
                return num*907.185 + ' kg'
            case 'g':
                return num/1000 + ' kg'
            case 'kg':
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
                return val
            case 'pt':
                return  num/0.0625  + ' floz'
            case 'qt':
                return  num/0.03125  + ' floz'
            case 'gal':
                return  num/0.0078125  + ' floz'
            case 'ml':
                return  num/29.5735  + ' floz'
            case 'l':
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
                return  num/16  + ' pt'
            case 'pt':
                return val
            case 'qt':
                return  num/0.5  + ' pt'
            case 'gal':
                return  num/0.125  + ' pt'
            case 'ml':
                return  num/473.176  + ' pt'
            case 'l':
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
                return  num*0.03125  + ' qt'
            case 'pt':
                return  num*0.5  + ' qt'
            case 'qt':
                return val
            case 'gal':
                return  num*4  + ' qt'
            case 'ml':
                return  num*0.00105669  + ' qt'
            case 'l':
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
                return  num*0.0078125  + ' gal'
            case 'pt':
                return  num*0.125  + ' gal'
            case 'qt':
                return  num*0.25  + ' gal'
            case 'gal':
                return val
            case 'ml':
                return  num*0.000264172  + ' gal'
            case 'l':
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
                return  num*29.5735  + ' ml'
            case 'pt':
                return  num*473.176  + ' ml'
            case 'qt':
                return  num*946.353  + ' ml'
            case 'gal':
                return  num*3785.41  + ' ml'
            case 'ml':
                return val
            case 'l':
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
                return  num*0.0295735  + ' l'
            case 'pt':
                return  num*0.473176  + ' l'
            case 'qt':
                return  num*0.946353  + ' l'
            case 'gal':
                return  num*3.78541  + ' l'
            case 'ml':
                return  num*0.001  + ' l'
            case 'l':
                return val
            default:
                return 'invalid unit'
        }
    }

    static toCount(val){
        let unit = val.split(' ')[1];
        if (unit === 'ct'){
            return val
        }
        return 'invalid unit'
    }

    static getConversionFunction(unit_string) {
        console.log(unit_string)
        let match = unit_string.match('^([0-9]+(?:[\.][0-9]{0,10})?|\.[0-9]{1,10}) (oz|ounce|lb|pound|ton|g|gram|kg|kilogram|' + 
                                      'floz|fluidounce|pt|pint|qt|quart|gal|gallon|ml|milliliter|l|liter|ct|count)$')
        if (match === null) {
            return { success: false, error: 'Incorrect String Format'}
        }
        let val = match[1]
        let unit = match[2]
        console.log(match)
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

    static getCleanUnitForm(unit_string) {
        let reg = unit_string.match('^([0-9]+(?:[\.][0-9]{0,10})?|\.[0-9]{1,10}) ?(.*)')
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