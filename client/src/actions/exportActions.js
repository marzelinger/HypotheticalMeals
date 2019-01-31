var fileDownload = require('js-file-download');

export const exportSimpleData = (dataIN, fileTitle) => dispatch => {

    console.log("fileTitle: "+fileTitle);
    console.log("fileTitle.length: "+fileTitle.length);

    if(fileTitle == "skus"){
        exportSKUS(dataIN, fileTitle);
    }

    // switch (fileTitle){
    //     case("skus"):
    //     exportSKUS(dataIN, fileTitle);

    //     case('ingredients'):
    //     //exportIngredients(dataIN, fileTitle);
    // }
    console.log("dataIn before formating: "+dataIN);
    var data = ["dog", "cat", "mouse"];
    var count = dataIN.length;
    console.log("dataIn length: "+count);
    console.log("dataIn 0: "+dataIN[0].data);
    var first = dataIN[0].ingredients;
    console.log('ingredient: '+first);
    console.log("dataIn stringify: "+JSON.stringify(dataIN[0]));
    console.log("dataIn stringify. ingredients: "+JSON.stringify(dataIN[0]).ingredients);


    //var myObject = JSON.parse(dataIN[0]);
    //console.log('this is my object'+myObject);

   // fileDownload(dataIN[0].ingredients, fileTitle+'.csv');


};



export const exportSKUS = (dataIN, fileTitle) => dispatch => {
    var count = dataIN.length;
    var finalData = [];
    for(let i = 0; i<count ; i++){
        console.log("here in the for loop");
        var curData = dataIN[i];
        var dataLine = [];
        dataLine.push(curData.num);
        dataLine.push(curData.name);
        dataLine.push(curData.case_cpc);
        dataLine.push(curData.unit_upc);
        dataLine.push(curData.unit_size);
        dataLine.push(curData.cpc);
        dataLine.push(curData.prod_line);
        dataLine.push(curData.comment);
        finalData.push(dataLine);
        //fileDownload(dataLine, fileTitle+i+'.csv');

    }    
    fileDownload(finalData, fileTitle+'.csv');



}