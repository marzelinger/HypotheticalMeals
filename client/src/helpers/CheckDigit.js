// Implementation of UPC-A checkdigit 

export default class CheckDigit {

    static apply(code){
        if (code.length !== 11) return 'invalid length';
        let oddSum = 0;
        for (var i=0; i < code.length; i+=2){
            oddSum += parseInt(code[i]);
        }
        let evenSum = 0;
        for (var i=1; i < code.length; i+=2){
            evenSum += parseInt(code[i]);
        }
        let mod = (evenSum + 3 * oddSum) % 10;
        if (mod === 0){
            var dig =  0;
        }
        var dig = 10 - mod;
        return code + dig;
    }

    static isValid(code) {
        if (code.length !== 12) return 'invalid length';
        return CheckDigit.apply(code.substring(0, 11)) === code;

    }

}