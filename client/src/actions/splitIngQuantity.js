import { zIndex } from "material-ui/styles";

export const splitIngQuantity = async (ing_quant) => {
    var ingQuant;
    var ingMeas;
    var nums = "0123456789.";
    var endIndex = 0;
    if(ing_quant!=undefined){
        if(ing_quant.length>0){
            for(let i = 0; i<ing_quant.length; i++){
                if(nums.includes(ing_quant.charAt(i))){
                    ingQuant+=ing_quant
                    endIndex = i;
                    break;
                }
            }
        }
    }
    return { quant: parseFloat(ingQuant), meas: ing_quant.substring(endIndex+1)}
}
