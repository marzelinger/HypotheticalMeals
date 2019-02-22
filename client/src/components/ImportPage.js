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
            sku_dependency: false,
            ingr_dependency: false,
            dependency_row: -1,

            badData: false,
            incompleteEntry: false,
            badDataRow: -1,
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
                    // Setting state for a duplicate
                    if(typeof res.data.duplicate != 'undefined'){
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
                    } else if(typeof res.data.sku_dependency != 'undefined'){
                        this.setState({
                            sku_dependency: true,
                            dependency_row: res.data.sku_dependency,
                        })
                    // Setting state for a formula entry with an invalid Ingr #
                    } else if(typeof res.data.ingr_dependency != 'undefined'){
                        this.setState({
                            ingr_dependency: true,
                            dependency_row: res.data.ingr_dependency,
                        })
                    // Setting state for the update table from a SKU import
                    } else if(typeof res.data.badData != 'undefined'){
                        this.setState({
                            badData: true,
                            badDataRow: res.data.badData,
                        })
                    } else if(typeof res.data.incompleteEntry != 'undefined'){
                        this.setState({
                            incompleteEntry: true,
                            badDataRow: res.data.incompleteEntry,
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
                            update_list_items_new: res.data.sku_data,
                            update_list_no_collisions: [],
                            update_list_ignores: [],
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
            badDataRow: -1,
            badData: false,
            incompleteEntry: false,
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
            sku_dependency: false,
            ingr_dependency: false,
            dependency_row: -1,
            badData: false,
            incompleteEntry: false,
            badDataRow: -1,
        })
    }



    render() {
        return (
            <div className = "Import">
                <div className = "centerContainer">
                    <h1> Please enter a CSV below to bulk import.</h1>
                </div>
                <div className = "centerContainer">
                    <h3> Please upload one file at a time with the appropriate extension. </h3>
                </div>
                <div className="centerContainer">
                    <Input className="centerFile" type="file" onChange={this.handleSelectedFile} />
                </div>
                <div className="centerContainer">
                    <Button className="centerButton" onClick={this.handleUpload}>Upload</Button>
                </div>
                { this.state.waiting ? <Progress animated value={100}/> : null}

                <Alert color="danger" isOpen={this.state.duplicate} toggle={this.onDismissDuplicate}>
                    A duplicate occured on row {this.state.rowIssue}
                </Alert>

                <Alert color="danger" isOpen={this.state.collision} toggle={this.onDismissCollision}>
                    An ambiguous collision occured on row {this.state.rowIssue}
                </Alert>

                <Alert color="danger" isOpen={this.state.incorrectNumHeaders} toggle={this.onDismissHeaderCount}>
                    Please check the number of columns provided. {this.state.requiredHeaders} columns were expected
                </Alert>

                <Alert color="danger" isOpen={this.state.incorrectHeaders} toggle={this.onDismissHeaderName}>
                    Column {this.state.incorrectColumnNum} had name "{this.state.incorrectColumnName}" when "{this.state.correctColumnName}" was expected
                </Alert>

                <Alert color="danger" isOpen={this.state.empty} toggle={this.onDismissEmpty} >
                    The provided CSV file had no entries
                </Alert>

                <Alert color="danger" isOpen={this.state.prod_line_error} toggle={this.onDismissProdLine} >
                    The product line "{this.state.prod_line_name}" from row {this.state.rowIssue} does not exist
                </Alert>

                <Alert color="danger" isOpen={this.state.noFile} toggle={this.onDismissNoFile}>
                    No file was entered
                </Alert>

                <Alert color="danger" isOpen={this.state.invalidFileExtension} toggle={this.onDismissFileExtension}>
                    The file provided has an invalid extension. Please enter a .csv file
                </Alert>

                <Alert color="danger" isOpen={this.state.invalidFileName} toggle={this.onDismissFileName}>
                    The file provided was named incorrectly
                </Alert>

                <Alert color="danger" isOpen={this.state.aborted} toggle={this.resetState}>
                    The import was aborted
                </Alert>

                <Alert color="danger" isOpen={this.state.sku_dependency} toggle={this.onDismissDependency}>
                    The SKU specified in row {this.state.dependency_row+1} does not exist
                </Alert>

                <Alert color="danger" isOpen={this.state.ingr_dependency} toggle={this.onDismissDependency}>
                    The entry specified in row {this.state.dependency_row+1} does not exist
                </Alert>

                <Alert color="danger" isOpen={this.state.incompleteEntry} toggle={this.onDismissBadData}>
                    The entry specified in row {this.state.badDataRow} does not exist
                </Alert>

                <Alert color="danger" isOpen={this.state.badData} toggle={this.onDismissBadData}>
                    The entry specified in row {this.state.badDataRow} has bad data
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
