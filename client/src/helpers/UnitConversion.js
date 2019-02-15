// Unit conversion for Ingredients units

export default class UnitConversion {
    static toOunce(val){
        let num = parseFloat(val.split(' ')[0]);
        let unit = val.split(' ')[1];
        switch (unit){
            case 'oz.':
                return val;
            case 'lb.':
                return '' + num*16 + ' ' + 'oz.'
            case 'ton':
                return '' + num*32000 + ' ' + 'oz.'
            case 'g':
                return '' + num*0.035274 + ' ' + 'oz.'
            case 'kg':
                return '' + num*35.274 + ' ' + 'oz.'
            default:
                return 'invalid unit'
        }
    }
    static toPound(val){
        let num = parseFloat(val.split(' ')[0]);
        let unit = val.split(' ')[1];
        switch (unit){
            case 'oz.':
                return '' + num/16 + ' ' + 'lb.'
            case 'lb.':
                return val
            case 'ton':
                return '' + num*2000 + ' ' + 'lb.'
            case 'g':
                return '' + num*0.00220462 + ' ' + 'lb.'
            case 'kg':
                return '' + num*2.20462 + ' ' + 'lb.'
            default:
                return 'invalid unit'
        }
    }

    static toTon(val){
        let num = parseFloat(val.split(' ')[0]);
        let unit = val.split(' ')[1];
        switch (unit){
            case 'oz.':
                return '' + num/16 + ' ' + 'ton'
            case 'lb.':
                return '' + num/32000 + ' ' + 'ton'
            case 'ton':
                return val
            case 'g':
                return '' + num/907185 + ' ' + 'ton'
            case 'kg':
                return '' + num/907.185 + ' ' + 'ton'
            default:
                return 'invalid unit'
        }
    }

    static toGram(val){
        let num = parseFloat(val.split(' ')[0]);
        let unit = val.split(' ')[1];
        switch (unit){
            case 'oz.':
                return '' + num*28.3495 + ' ' + 'g'
            case 'lb.':
                return '' + num*453.592 + ' ' + 'g'
            case 'ton':
                return '' + num*907185 + ' ' + 'g'
            case 'g':
                return val
            case 'kg':
                return '' + num*1000 + ' ' + 'g'
            default:
                return 'invalid unit'
        }
    }

    static toKilogram(val){
        let num = parseFloat(val.split(' ')[0]);
        let unit = val.split(' ')[1];
        switch (unit){
            case 'oz.':
                return '' + num/35.274 + ' ' + 'kg'
            case 'lb.':
                return '' + num/2.20462 + ' ' + 'kg'
            case 'ton':
                return '' + num*907.185 + ' ' + 'kg'
            case 'g':
                return '' + num/1000 + ' ' + 'kg'
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
            case 'fl.oz.':
                return val
            case 'pt.':
                return '' + num/0.0625 + ' ' + 'fl.oz.'
            case 'qt.':
                return '' + num/0.03125 + ' ' + 'fl.oz.'
            case 'gal.':
                return '' + num/0.0078125 + ' ' + 'fl.oz.'
            case 'mL':
                return '' + num/29.5735 + ' ' + 'fl.oz.'
            case 'L':
                return '' + num/0.0295735 + ' ' + 'fl.oz.'
            default:
                return 'invalid unit'
        }
    }

    static toPint(val){
        let num = parseFloat(val.split(' ')[0]);
        let unit = val.split(' ')[1];
        switch (unit){
            case 'fl.oz.':
                return '' + num/16 + ' ' + 'pt.'
            case 'pt.':
                return val
            case 'qt.':
                return '' + num/0.5 + ' ' + 'pt.'
            case 'gal.':
                return '' + num/0.125 + ' ' + 'pt.'
            case 'mL':
                return '' + num/473.176 + ' ' + 'pt.'
            case 'L':
                return '' + num/0.473176 + ' ' + 'pt.'
            default:
                return 'invalid unit'
        }
    }

    static toQuart(val){
        let num = parseFloat(val.split(' ')[0]);
        let unit = val.split(' ')[1];
        switch (unit){
            case 'fl.oz.':
                return '' + num*0.03125 + ' ' + 'qt.'
            case 'pt.':
                return '' + num*0.5 + ' ' + 'qt.'
            case 'qt.':
                return val
            case 'gal.':
                return '' + num*4 + ' ' + 'qt.'
            case 'mL':
                return '' + num*0.00105669 + ' ' + 'qt.'
            case 'L':
                return '' + num*1.05669 + ' ' + 'qt.'
            default:
                return 'invalid unit'
        }
    }

    static toGallon(val){
        let num = parseFloat(val.split(' ')[0]);
        let unit = val.split(' ')[1];
        switch (unit){
            case 'fl.oz.':
                return '' + num*0.0078125 + ' ' + 'gal.'
            case 'pt.':
                return '' + num*0.125 + ' ' + 'gal.'
            case 'qt.':
                return '' + num*0.25 + ' ' + 'gal.'
            case 'gal.':
                return val
            case 'mL':
                return '' + num*0.000264172 + ' ' + 'gal.'
            case 'L':
                return '' + num*0.264172 + ' ' + 'gal.'
            default:
                return 'invalid unit'
        }
    }

    static toMilliliter(val){
        let num = parseFloat(val.split(' ')[0]);
        let unit = val.split(' ')[1];
        switch (unit){
            case 'fl.oz.':
                return '' + num*29.5735 + ' ' + 'mL'
            case 'pt.':
                return '' + num*473.176 + ' ' + 'mL'
            case 'qt.':
                return '' + num*946.353 + ' ' + 'mL'
            case 'gal.':
                return '' + num*3785.41 + ' ' + 'mL'
            case 'mL':
                return val
            case 'L':
                return '' + num*1000 + ' ' + 'mL'
            default:
                return 'invalid unit'
        }
    }

    static toLiter(val){
        let num = parseFloat(val.split(' ')[0]);
        let unit = val.split(' ')[1];
        switch (unit){
            case 'fl.oz.':
                return '' + num*0.0295735 + ' ' + 'L'
            case 'pt.':
                return '' + num*0.473176 + ' ' + 'L'
            case 'qt.':
                return '' + num*0.946353 + ' ' + 'L'
            case 'gal.':
                return '' + num*3.78541 + ' ' + 'L'
            case 'mL':
                return '' + num*0.001 + ' ' + 'L'
            case 'L':
                return val
            default:
                return 'invalid unit'
        }
    }
}