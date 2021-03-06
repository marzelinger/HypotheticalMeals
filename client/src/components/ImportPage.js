import React, { Component } from 'react';
import axios from 'axios';
import {Progress} from 'reactstrap'
import {Alert} from 'reactstrap'
import {Button} from 'reactstrap'
import {ImportTable} from './ImportTable'
import {ImportReport} from './ImportReport'
import {Input} from 'reactstrap'
import './Center.css';
import {exportImportReport} from "../actions/exportActions";
import GeneralNavBar from './GeneralNavBar';
import * as Constants from '../resources/Constants';
import headerTable from './../resources/Headers.PNG';
import formatListNumbered from 'material-ui/svg-icons/editor/format-list-numbered';

var endpoint = "not specified";

export default class ImportPage extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            selectedFile: null,
            waiting: false,

            // Duplicates
            duplicate: false,
            collision: false,
            rowIssue: -1,

            // Incorrect number of headers
            incorrectNumHeaders: false,
            numHeaders: -1,
            requiredHeaders: -1,

            // Incorrect column headers
            incorrectHeaders: false,
            incorrectColumnName: "",
            incorrectColumnNum: -1,
            correctColumnName: "",
            
            // Nothing inside CSV
            empty: false,
   
            // Prod line does not exist
            prod_line_error: false,
            prod_line_name: "",

            // No file specified
            noFile: false,

            // Incorrect file extension
            invalidFileExtension: false,

            // Invalid file name
            invalidFileName: false,

            // Update table 
            showUpdateTable: false,
            update_list_items_old: [],
            //update_list_type: "",
            update_list_items_new: [],
            update_list_no_collisions: [],
            update_list_ignores: [],

            aborted: false,

            badData: false,
            incompleteEntry: false,

            formula_comment: false,
            ingredient_duplicate: false,
            ingredient_duplicate_num: -1,

            sku_formula_num: -1,
            sku_formula_error: false,

            manu_line_error: false,
            manu_line_name: "",

            missingRequiredField: false,
            skuNameIssue: false,
            skuNumIssue: false,
            caseUPCIssue: false,
            unitUPCIssue: false,
            cpcIssue: false,
            mfgRunIssue: false,
            mfgSetupIssue: false,
            ingrNumIssue: false,
            ingrCostIssue: false,
            ingrUnitIssue: false,
            formulaNumIssue: false,
            formulaNameIssue: false,
            formulaIngrIssue: false,
            formulaUnitIssue: false,
            formulaFactorIssue: false,
            mfgRateIssue: false,

            unknownError: false,
        }
    }

    handleSelectedFile = event => {
        this.resetState();
        this.setState({
            selectedFile: event.target.files[0],
            showUpdateTable: false,
            showImportReport: false,
            update_list_items_old: [],
            update_list_type: "",
            update_list_items_new: [],
            update_list_no_collisions: [],
        })
    }

    handleUpload = () => {
        this.setState({
            waiting: true
        })
        
        if(this.state.selectedFile == null) {
            this.setState({
                waiting: false,
                noFile: true
            })
        } else if(this.state.selectedFile.name.substring(this.state.selectedFile.name.length - 4) != ".csv") {
            this.setState({
                waiting: false,
                invalidFileExtension: true
            })
        } else {
            var fd = new FormData();
            fd.append('file', this.state.selectedFile, this.state.selectedFile.name);

            if(this.state.selectedFile.name.length >= 4 && this.state.selectedFile.name.substring(0,4) === "skus"){
                endpoint = "/api/parseSkus";
            }
            else if(this.state.selectedFile.name.length >= 13 && this.state.selectedFile.name.substring(0,13) === "product_lines"){
                endpoint = "/api/parseProdLines";
            }
            else if(this.state.selectedFile.name.length >= 11 && this.state.selectedFile.name.substring(0,11) === "ingredients"){
                endpoint = "/api/parseIngredients";
            }
            else if(this.state.selectedFile.name.length >= 8 && this.state.selectedFile.name.substring(0,8) === "formulas"){
                endpoint = "/api/parseFormulas";
            } else {
                this.setState({
                    waiting: false,
                    invalidFileName: true
                })
                return;
            }
            axios.post(endpoint, fd)
                //.then(data => data.json())
                .then((res) => {
                    console.log(res);
                    if(typeof res.data.manu_line_name != 'undefined'){
                        this.setState({
                            manu_line_error: true,
                            rowIssue: res.data.row,
                            manu_line_name: res.data.manu_line_name,
                        })
                    }
                    if(typeof res.data.sku_formula_num != 'undefined'){
                        this.setState({
                            sku_formula_num: res.data.sku_formula_num,
                            sku_formula_error: true,
                        })
                    }
                    // Setting state for a duplicate
                    else if(typeof res.data.formula_comment != 'undefined'){
                        this.setState({
                            formula_comment: true,
                            rowIssue: res.data.formula_comment
                        });
                    } 
                    else if(typeof res.data.skuNameIssue != 'undefined'){
                        this.setState({
                            skuNameIssue: true,
                            rowIssue: res.data.skuNameIssue
                        })
                    }
                    else if(typeof res.data.skuNumIssue != 'undefined'){
                        this.setState({
                            skuNumIssue: true,
                            rowIssue: res.data.skuNumIssue,
                        })
                    }
                    else if(typeof res.data.caseUPCIssue != 'undefined'){
                        this.setState({
                            caseUPCIssue: true,
                            rowIssue: res.data.caseUPCIssue
                        })
                    }
                    else if(typeof res.data.unitUPCIssue != 'undefined'){
                        this.setState({
                            unitUPCIssue: true,
                            rowIssue: res.data.unitUPCIssue
                        })
                    }
                    else if(typeof res.data.cpcIssue != 'undefined'){
                        this.setState({
                            cpcIssue: true,
                            rowIssue: res.data.cpcIssue
                        })
                    }
                    else if(typeof res.data.mfgRunIssue != 'undefined'){
                        this.setState({
                            mfgRunIssue: true,
                            rowIssue: res.data.mfgRunIssue
                        })
                    }
                    else if(typeof res.data.mfgSetupIssue != 'undefined'){
                        this.setState({
                            mfgSetupIssue: true,
                            rowIssue: res.data.mfgSetupIssue
                        })
                    }
                    else if(typeof res.data.ingrNumIssue != 'undefined'){
                        this.setState({
                            ingrNumIssue: true,
                            rowIssue: res.data.ingrNumIssue
                        })
                    }
                    else if(typeof res.data.ingrCostIssue != 'undefined'){
                        this.setState({
                            ingrCostIssue: true,
                            rowIssue: res.data.ingrCostIssue
                        })
                    }
                    else if(typeof res.data.formulaNumIssue != 'undefined'){
                        this.setState({
                            formulaNumIssue: true,
                            rowIssue: res.data.formulaNumIssue
                        })
                    }
                    else if(typeof res.data.formulaNameIssue != 'undefined'){
                        this.setState({
                            formulaNameIssue: true,
                            rowIssue: res.data.formulaNameIssue
                        })
                    }
                    else if(typeof res.data.formulaIngrIssue != 'undefined'){
                        this.setState({
                            formulaIngrIssue: true,
                            rowIssue: res.data.formulaIngrIssue
                        })
                    }
                    else if(typeof res.data.formulaUnitIssue != 'undefined'){
                        this.setState({
                            formulaUnitIssue: true,
                            rowIssue: res.data.formulaUnitIssue
                        })
                    }
                    else if(typeof res.data.formulaFactorIssue != 'undefined'){
                        this.setState({
                            formulaFactorIssue: true,
                            rowIssue: res.data.formulaFactorIssue,
                        })
                    }
                    else if(typeof res.data.mfgRateIssue != 'undefined'){
                        this.setState({
                            mfgRateIssue: true,
                            rowIssue: res.data.mfgRateIssue
                        })
                    }
                    else if(typeof res.data.ingrUnitIssue != 'undefined'){
                        this.setState({
                            ingrUnitIssue: true,
                            rowIssue: res.data.ingrUnitIssue
                        })
                    }
                    else if(typeof res.data.ingredient_duplicate != 'undefined'){
                        this.setState({
                            ingredient_duplicate: true,
                            rowIssue: res.data.ingredient_duplicate,
                            ingredient_duplicate_num: res.data.ingredient_num,
                        })
                    }
                    else if(typeof res.data.duplicate != 'undefined'){
                        this.setState({
                            duplicate: true,
                            rowIssue: res.data.duplicate
                        });
                    }
                    // Setting state for an ambiguous collision
                    else if(typeof res.data.collision!= 'undefined'){
                        this.setState({
                            collision: true,
                            rowIssue: res.data.collision
                        })
                    }
                    // Setting state for the number of fields being off
                    else if(typeof res.data.incorrectNumHeaders != 'undefined'){
                        this.setState({
                            incorrectNumHeaders: true,
                            requiredHeaders: res.data.requiredFields
                        })
                    }
                    else if(typeof res.data.error != 'undefined' && res.data.error == "Catch all error"){
                        this.setState({
                            unknownError: true,
                        })
                    }
                    // Setting state for the headers being mislabeled
                    else if(typeof res.data.header != 'undefined'){
                        this.setState({
                            incorrectHeaders: true,
                            incorrectColumnNum: res.data.header,
                            incorrectColumnName: res.data.actual,
                            correctColumnName: res.data.expected
                        })
                    }
                    // Setting state for an empty file
                    else if(typeof res.data.empty != 'undefined'){
                        this.setState({
                            empty: true
                        })
                    }
                    // Setting state for a SKU entry with an invalid product line
                    else if(typeof res.data.prod_line_name != 'undefined'){
                        this.setState({
                            prod_line_error: true,
                            rowIssue: res.data.row,
                            prod_line_name: res.data.prod_line_name
                        })
                    // Setting state for a formula entry with an invalid SKU #
                    } else if (typeof res.data.missingRequiredField != 'undefined'){
                        this.setState({
                            missingRequiredField: true,
                            rowIssue: res.data.missingRequiredField,
                        })
                    } else if(typeof res.data.badData != 'undefined'){
                        this.setState({
                            badData: true,
                            rowIssue: res.data.badData,
                        })
                    } else if(typeof res.data.incompleteEntry != 'undefined'){
                        this.setState({
                            incompleteEntry: true,
                            rowIssue: res.data.incompleteEntry,
                        })
                    }else if(typeof res.data.old_data != 'undefined' && endpoint == "/api/parseSkus"){
                        this.setState({
                            showUpdateTable: true,
                            update_list_type: "SKUs",
                            update_list_items_old: res.data.old_data,
                            update_list_items_new:  res.data.new_data,
                            update_list_no_collisions: res.data.data,
                            update_list_ignores: res.data.ignored_data,
                        })
                    // Setting state for the update table from a ingredient import
                    } else if(typeof res.data.old_data != 'undefined' && endpoint == "/api/parseIngredients"){
                        this.setState({
                            showUpdateTable: true,
                            update_list_type: "Ingredients",
                            update_list_items_old: res.data.old_data,
                            update_list_items_new: res.data.new_data,
                            update_list_no_collisions: res.data.data,
                            update_list_ignores: res.data.ignored_data,
                        })
                    // Setting state for the import report after a SKU import
                    } else if(typeof res.data.showImport != 'undefined' && endpoint == "/api/parseSkus"){
                        this.setState({
                            showImportReport: true,
                            update_list_items_new: res.data.new_data,
                            update_list_no_collisions: res.data.data,
                            update_list_ignores: res.data.ignored_data,
                            import_report_type: "SKUs"
                        })
                    // Setting state for the import report after an ingredient import
                    } else if(typeof res.data.showImport != 'undefined' && endpoint == "/api/parseIngredients"){
                        this.setState({
                            showImportReport: true,
                            update_list_items_new: res.data.new_data,
                            update_list_no_collisions:res.data.data,
                            update_list_ignores: res.data.ignored_data,
                            import_report_type: "Ingredients",
                        })
                    } else if(typeof res.data.showImport != 'undefined' && endpoint == "/api/parseProdLines"){
                        this.setState({
                            showImportReport: true,
                            update_list_items_new: [],
                            update_list_no_collisions: res.data.data,
                            update_list_ignores: res.data.ignored_data,
                            import_report_type: "Product Line",
                        })
                        console.log("data is : " + res.data.data);
                    } else if(typeof res.data.showImport != 'undefined' && endpoint == '/api/parseFormulas'){
                        this.setState({
                            showImportReport: true,
                            update_list_items_new: res.data.updates,
                            update_list_no_collisions: res.data.adds,
                            update_list_ignores: res.data.ignores,
                            import_report_type: "Formulas",
                        })
                    }
                    // Setting state for the import report after a product line import
                    //TODO
                    // Setting state for the import report after a formulas import
                    //TODO
                    this.setState({
                        waiting: false,
                        selectedFile: null
                    });
                });
        }
    }

    onDismissDuplicate = () => {
        this.setState({
            duplicate: false,
            rowIssue: -1
        })
    }

    onDismissCollision = () => {
        this.setState({
            collision: false,
            rowIssue: -1
        })
    }

    onDismissHeaderCount = () => {
        this.setState({
            incorrectNumHeaders: false,
            requiredHeaders: -1,
        })
    }

    onDismissHeaderName = () => {
        this.setState({
            incorrectHeaders: false,
            incorrectColumnName: "",
            incorrectColumnNum: -1,
            correctColumnName: ""
        })
    }

    onDismissEmpty = () => {
        this.setState({
            empty: false
        })
    }

    onDismissProdLine = () => {
        this.setState({
            prod_line_error: false,
            prod_line_name: ""
        })
    }

    onDismissManuLine = () => {
        this.setState({
            manu_line_error: false,
            manu_line_name: ""
        })
    }

    onDismissNoFile = () => {
        this.setState({
            noFile: false
        })
    }

    onDismissFileExtension = () => {
        this.setState({
            invalidFileExtension: false
        })
    }

    onDismissFileName = () => {
        this.setState({
            invalidFileName: false
        })
    }

    onDismissDependency = () =>{
        this.setState({
            sku_dependency: false,
            ingr_dependency: false,
            dependency_row: -1,
        })
    }

    onDismissBadData = () =>{
        this.setState({
            rowIssue: -1,
            badData: false,
            incompleteEntry: false,
        })
    }

    onDismissSkuFormula = () =>{
        this.setState({
            sku_formula_error: false,
            sku_formula_num: -1,
        })
    }

    handleAccept = () => {
        var endPointUpdate = "";
        if(this.state.update_list_type == "SKUs") endPointUpdate = "/api/parseUpdateSkus";
        else if(this.state.update_list_type == "Ingredients") endPointUpdate = "/api/parseUpdateIngredients";
        this.setState({
            waiting: true,
            /*added_items: this.state.update_list_no_collisions,
            update_items: this.state.update_list_items_new,
            ignored_items: this.state.update_list_items_ignored,*/
        })
        var toUpdate = JSON.stringify(this.state.update_list_items_new);
        var toAdd = JSON.stringify(this.state.update_list_no_collisions);
        var toIgnore = JSON.stringify(this.state.update_list_ignores);
        fetch(endPointUpdate, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ updates: toUpdate,
                     adds: toAdd, ignores: toIgnore}),
        }).then(data => data.json()).
        then((res) => {
            if(endPointUpdate == "/api/parseUpdateSkus") {
                this.setState({
                    import_report_type: "SKUs"
                })
            } else {
                this.setState({
                    import_report_type: "Ingredients"
                })
            }
            this.setState({
                showImportReport: true,
                update_list_items_new: res.updates,
                update_list_no_collisions: res.adds,
                update_list_ignores: res.ignores,
            });
            this.resetState();
        });
    }

    handleReject = () => {
        this.resetState();
        this.setState({
            aborted: true,
        })
    }

    handleExport = () => {
        console.log("this is the handleExport");
        console.log("update_list-no-collisions: "+this.state.update_list_no_collisions);
        console.log("update_list-items new: "+this.state.update_list_items_new);
        console.log("update_list-ignored: "+this.state.update_list_ignores);
        console.log("filetype: "+this.state.import_report_type);

        exportImportReport(this.state.update_list_no_collisions, this.state.update_list_items_new, this.state.update_list_ignores, this.state.import_report_type);
    }

    resetState = () => {
        this.setState({
            //selectedFile: null,
            waiting: false,

            // Duplicates
            duplicate: false,
            rowIssue: -1,
            collision: false,

            // Incorrect number of headers
            incorrectNumHeaders: false,
            requiredHeaders: -1,

            // Incorrect column headers
            incorrectHeaders: false,
            incorrectColumnName: "",
            incorrectColumnNum: -1,
            correctColumnName: "",
            
            // Nothing inside CSV
            empty: false,
   
            // Prod line does not exist
            prod_line_error: false,
            prod_line_name: "",

            // No file specified
            noFile: false,

            // Incorrect file extension
            invalidFileExtension: false,

            // Invalid file name
            invalidFileName: false,

            // Update table 
            showUpdateTable: false,
           // update_list_items_old: [],
            //update_list_type: "",
            //update_list_items_new: [],
            //update_list_no_collisions: [],

            aborted: false,
            dependency_row: -1,
            badData: false,
            incompleteEntry: false,

            formula_comment: false,
            ingredient_duplicate: false,
            ingredient_duplicate_num: -1,

            manu_line_error: false,
            manu_line_name: "",

            sku_formula_num: -1,
            sku_formula_error: false,

            manu_line_error: false,
            manu_line_name: "",

            missingRequiredField: false,
            skuNameIssue: false,
            skuNumIssue: false,
            caseUPCIssue: false,
            unitUPCIssue: false,
            cpcIssue: false,
            mfgRunIssue: false,
            mfgSetupIssue: false,
            ingrNumIssue: false,
            ingrUnitIssue: false,
            ingrCostIssue: false,
            formulaNumIssue: false,
            formulaNameIssue: false,
            formulaIngrIssue: false,
            formulaUnitIssue: false,
            formulaFactorIssue: false,
            mfgRateIssue: false,

            unknownError: false,
        })
    }



    render() {
        return (
            <div className = "Import">
                <GeneralNavBar title={Constants.ImportTitle}></GeneralNavBar>


                <div className = "centerTitle">
                    <h1> Please enter a CSV below to bulk import.</h1>
                </div>
                <div className = "centerTitle">
                    <h3> Please upload one file at a time. The file formats that are accepted are specified below and are case-insensitive: </h3>
                </div>
                <div className="centerTitle">
                    <ul>
                        <li> A CSV file starting with "formulas" (i.e. formulas123213.csv)</li>
                        <li> A CSV file starting with "product_lines" (i.e. product_linesPUT_ANYTHING_HERE.csv)</li>
                        <li> A CSV file starting with "skus" (i.e. skusTHISWORKS.csv)</li>
                        <li> A CSV file starting with "ingredients" (i.e. ingredientsblahblah.csv)</li>
                    </ul>
                </div>
                <div className = "centerContainer">
                    <img className="centerButton" src={headerTable}></img>
                </div>
                <div className="centerContainer">
                    <Input className="centerFile" type="file" onChange={this.handleSelectedFile} />
                </div>
                <div className="centerContainer">
                    <Button className="centerButton" onClick={this.handleUpload}>Upload</Button>
                </div>
                { this.state.waiting ? <Progress animated value={100}/> : null}

                <Alert color="danger" isOpen={this.state.duplicate} toggle={this.onDismissDuplicate}>
                    A duplicate occured on row {this.state.rowIssue}.
                </Alert>

                <Alert color="danger" isOpen={this.state.collision} toggle={this.onDismissCollision}>
                    An ambiguous collision occured on row {this.state.rowIssue}.
                </Alert>

                <Alert color="danger" isOpen={this.state.incorrectNumHeaders} toggle={this.onDismissHeaderCount}>
                    Please check the number of columns provided. {this.state.requiredHeaders} columns were expected.
                </Alert>

                <Alert color="danger" isOpen={this.state.incorrectHeaders} toggle={this.onDismissHeaderName}>
                    Column {this.state.incorrectColumnNum} had name "{this.state.incorrectColumnName}" when "{this.state.correctColumnName}" was expected.
                </Alert>

                <Alert color="danger" isOpen={this.state.unknownError} toggle={this.resetState}>
                    An unknown error occured. Please reload the page and try again.
                </Alert>

                <Alert color="danger" isOpen={this.state.empty} toggle={this.onDismissEmpty} >
                    The provided CSV file had no entries.
                </Alert>

                <Alert color="danger" isOpen={this.state.sku_formula_error} toggle={this.onDismissSkuFormula}>
                    Formula # {this.state.sku_formula_num} does not exist.
                </Alert>

                <Alert color="danger" isOpen={this.state.prod_line_error} toggle={this.onDismissProdLine} >
                    The product line "{this.state.prod_line_name}" from row {this.state.rowIssue} does not exist.
                </Alert>

                <Alert color="danger" isOpen={this.state.manu_line_error} toggle={this.onDismissManuLine}>
                    The manufacturing line shortname "{this.state.manu_line_name}" from row {this.state.rowIssue} does not exist.
                </Alert>

                <Alert color="danger" isOpen={this.state.noFile} toggle={this.onDismissNoFile}>
                    No file was entered.
                </Alert>

                <Alert color="danger" isOpen={this.state.invalidFileExtension} toggle={this.onDismissFileExtension}>
                    The file provided has an invalid extension. Please enter a .csv file.
                </Alert>

                <Alert color="danger" isOpen={this.state.invalidFileName} toggle={this.onDismissFileName}>
                    The file provided was named incorrectly.
                </Alert>

                <Alert color="danger" isOpen={this.state.aborted} toggle={this.resetState}>
                    The import was aborted.
                </Alert>

                <Alert color="danger" isOpen={this.state.incompleteEntry} toggle={this.onDismissBadData}>
                    The entry specified in row {this.state.rowIssue} does not exist.
                </Alert>

                <Alert color="danger" isOpen={this.state.badData} toggle={this.onDismissBadData}>
                    The entry specified in row {this.state.rowIssue} has bad data.
                </Alert>

                <Alert color="danger" isOpen={this.state.formula_comment} toggle={this.resetState}>
                    The formula specified in row {this.state.rowIssue} is not the first occurence in the CSV and should not have a comment.
                </Alert>

                <Alert color="danger" isOpen={this.state.missingRequiredField} toggle={this.resetState}>
                    The entry in row {this.state.rowIssue} is missing a required field.
                </Alert>

                <Alert color="danger" isOpen={this.state.ingredient_duplicate} toggle={this.resetState}>
                    The Ingredient # {this.ingredient_duplicate_num} in row {this.state.rowIssue} specifies a duplicate ingredient.
                </Alert>

                <Alert color="danger" isOpen={this.state.skuNameIssue} toggle={this.resetState}>
                    The SKU in row {this.state.rowIssue} has an invalid name. Please keep the length between 1-31 characters.
                </Alert>

                <Alert color="danger" isOpen={this.state.skuNumIssue} toggle={this.resetState}>
                    The SKU in row {this.state.rowIssue} has an invalid SKU #. Please only use numbers in the SKU #.
                </Alert>

                <Alert color="danger" isOpen={this.state.caseUPCIssue} toggle={this.resetState}>
                    The SKU in row {this.state.rowIssue} has an invalid case UPC.
                </Alert>

                <Alert color="danger" isOpen={this.state.unitUPCIssue} toggle={this.resetState}>
                    The SKU in row {this.state.rowIssue} has an invalid unit UPC.
                </Alert>

                <Alert color="danger" isOpen={this.state.cpcIssue} toggle={this.resetState}>
                    The SKU in row {this.state.rowIssue} has an invalid cost per case.
                </Alert>

                <Alert color="danger" isOpen={this.state.mfgRunIssue} toggle={this.resetState}>
                    The SKU in row {this.state.rowIssue} has an invalid manufacturing run cost.
                </Alert>

                <Alert color="danger" isOpen={this.state.mfgSetupIssue} toggle={this.resetState}>
                    The SKU in row {this.state.rowIssue} has an invalid manufacturing setup cost.
                </Alert>

                <Alert color="danger" isOpen={this.state.ingrNumIssue} toggle={this.resetState}>
                    The Ingredient # in row {this.state.rowIssue} does not exist.
                </Alert>

                <Alert color="danger" isOpen={this.state.ingrCostIssue} toggle={this.resetState}>
                    The Ingredient quantity in row {this.state.rowIssue} has an invalid cost. Please enter a number.
                </Alert>

                <Alert color="danger" isOpen={this.state.formulaNumIssue} toggle={this.resetState}>
                    The Formula in row {this.state.rowIssue} has an invalid Formula #.
                </Alert>

                <Alert color="danger" isOpen={this.state.formulaNameIssue} toggle={this.resetState}>
                    The Formula in row {this.state.rowIssue} has an invalid name. Please keep the length between 1-31 characters.
                </Alert>

                <Alert color="danger" isOpen={this.state.formulaIngrIssue} toggle={this.resetState}>
                    The Ingredient in row {this.state.rowIssue} does not exist.
                </Alert>

                <Alert color="danger" isOpen={this.state.formulaUnitIssue} toggle={this.resetState}>
                    The Ingredient quantity in row {this.state.rowIssue} has invalid units. Please try oz, ounce, pound, lb, ton, g, gram, gram, kg, kilogram, fluidounce, floz, pt, pint, qt, quart, gallon, gal, ml, milliliter, liter, l, ct, count. Or the issue may be from inputting a quantity of different unit type than the ingredient has in the database(i.e. cannot convert from a mass unit to a volume unit)
                </Alert>

                <Alert color="danger" isOpen={this.state.formulaFactorIssue} toggle={this.resetState}>
                    The Formula factor in row {this.state.rowIssue} is invalid. Please enter a valid number.
                </Alert>

                <Alert color="danger" isOpen={this.state.mfgRateIssue} toggle={this.resetState}>
                    The manufacturing rate in row {this.state.rowIssue} is invalid. Please enter a valid number.
                </Alert>

                <Alert color="danger" isOpen={this.state.ingrUnitIssue} toggle={this.resetState}>
                    The Ingredient in row {this.state.rowIssue} has invalid invalid units. Please try oz, ounce, pound, lb, ton, g, gram, gram, kg, kilogram, fluidounce, floz, pt, pint, qt, quart, gallon, gal, ml, milliliter, liter, l, ct, count.
                </Alert>

                

                {this.state.showUpdateTable && <ImportTable
                    items={this.state.update_list_items_old}
                    new_items={this.state.update_list_items_new}
                    label={this.state.update_list_type} />}

                <div className="centerContainer">
                {this.state.showUpdateTable && <Button className="centerButton" onClick={this.handleAccept}> Accept Updates</Button> }
                {this.state.showUpdateTable && <Button className="centerButton" onClick={this.handleReject}> Reject Updates</Button> }    
                </div>

                {this.state.showImportReport && <ImportReport
                    added_items={this.state.update_list_no_collisions}
                    updated_items={this.state.update_list_items_new}
                    ignored_items={this.state.update_list_ignores}
                    label={this.state.import_report_type} />}

                <div className="centerContainer">
                {this.state.showImportReport && <Button className="centerButton" onClick={this.handleExport}> Export</Button> }    
                </div>
                
            </div>
        );
    }
}
