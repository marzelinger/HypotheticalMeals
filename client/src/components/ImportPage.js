import React, { Component } from 'react';
import axios from 'axios';
import {Progress} from 'reactstrap'
import {Alert} from 'reactstrap'
import {Button} from 'reactstrap'
import {ImportTable} from './ImportTable'
import {Input} from 'reactstrap'
import './Center.css';

var endpoint = "not specified";

export default class ImportPage extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            selectedFile: null,
            waiting: false,

            // Duplicates
            duplicate: false,
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
            update_list_type: "",
            update_list_items_new: [],
            update_list_no_collisions: [],
        }
    }

    handleSelectedFile = event => {
        this.resetState();
        this.setState({
            selectedFile: event.target.files[0],
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
                .then((res) => {
                    if(typeof res.data.duplicate != 'undefined'){
                        this.setState({
                            duplicate: true,
                            rowIssue: res.data.duplicate
                        });
                    }
                    else if(typeof res.data.numFields != 'undefined'){
                        this.setState({
                            incorrectNumHeaders: true,
                            numHeaders: res.data.numFields,
                            requiredHeaders: res.data.requiredFields
                        })
                    }
                    else if(typeof res.data.header != 'undefined'){
                        this.setState({
                            incorrectHeaders: true,
                            incorrectColumnNum: res.data.header,
                            incorrectColumnName: res.data.actual,
                            correctColumnName: res.data.expected
                        })
                    }
                    else if(typeof res.data.empty != 'undefined'){
                        this.setState({
                            empty: true
                        })
                    }
                    else if(typeof res.data.prod_line_name != 'undefined'){
                        this.setState({
                            prod_line_error: true,
                            rowIssue: res.data.row,
                            prod_line_name: res.data.prod_line_name
                        })
                    } else if(typeof res.data.old_data != 'undefined' && endpoint == "/api/parseSkus"){
                        
                        this.setState({
                            showUpdateTable: true,
                            update_list_type: "SKUs",
                            update_list_items_old: res.data.old_data,
                            update_list_items_new:  res.data.new_data,
                            update_list_no_collisions: res.data.data,
                        })
                        console.log(res.data.new_data);
                        console.log(res.data.old_data);
                    } else if(typeof res.data.old_data != 'undefined' && endpoint == "/api/parseIngredients"){

                        this.setState({
                            showUpdateTable: true,
                            update_list_type: "Ingredients",
                            update_list_items_old: res.data.old_data,
                            update_list_items_new: res.data.new_data,
                            update_list_no_collisions: res.data.data,
                        })
                    }

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

    onDismissHeaderCount = () => {
        this.setState({
            incorrectNumHeaders: false,
            numHeaders: -1,
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

    handleAccept = () => {
        var endPointUpdate = "";
        if(this.state.update_list_type == "SKUs") endPointUpdate = "/api/parseUpdateSkus";
        else if(this.state.update_list_type == "Ingredients") endPointUpdate = "/api/parseUpdateIngredients";
        console.log(this.state.update_list_items_new);
        console.log(this.state.update_list_no_collisions);
        var toUpdate = JSON.stringify(this.state.update_list_items_new);
        var toAdd = JSON.stringify(this.state.update_list_no_collisions);
        fetch(endPointUpdate, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ updates: toUpdate,
                     adds: toAdd}),
        }).then((res) => {
            this.resetState();
        })
    }

    handleReject = () => {
        this.resetState();
    }

    resetState = () => {
        this.setState({
            selectedFile: null,
            waiting: false,

            // Duplicates
            duplicate: false,
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
            update_list_type: "",
            update_list_items_new: [],
            update_list_no_collisions: [],
        })
    }



    render() {
        return (
            <div className = "Import">

                <div className="centerContainer">
                    <Input className="centerFile" type="file" onChange={this.handleSelectedFile} />
                </div>
                <div className="centerContainer">
                    <Button className="centerButton" onClick={this.handleUpload}>Upload</Button>
                </div>
                { this.state.waiting ? <Progress animated value={100}/> : null}

                <Alert color="danger" isOpen={this.state.duplicate} toggle={this.onDismissDuplicate}>
                    A duplicate occured on row {this.state.rowIssue+1}
                </Alert>

                <Alert color="danger" isOpen={this.state.incorrectNumHeaders} toggle={this.onDismissHeaderCount}>
                    {this.state.numHeaders} columns were specified when {this.state.requiredHeaders} were expected;
                </Alert>

                <Alert color="danger" isOpen={this.state.incorrectHeaders} toggle={this.onDismissHeaderName}>
                    Column {this.state.incorrectColumnNum} had name {this.state.incorrectColumnName} when {this.state.correctColumnName} was expected;
                </Alert>

                <Alert color="danger" isOpen={this.state.empty} toggle={this.onDismissEmpty} >
                    The provided CSV file had no entries
                </Alert>

                <Alert color="danger" isOpen={this.state.prod_line_error} toggle={this.onDismissProdLine} >
                    The product line {this.state.prod_line_name} from entry {this.state.rowIssue} does not exist
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
                

                {this.state.showUpdateTable && <ImportTable
                    items={this.state.update_list_items_old}
                    new_items={this.state.update_list_items_new}
                    label={this.state.update_list_type} />}

                <div className="centerContainer">
                {this.state.showUpdateTable && <Button className="centerButton" onClick={this.handleAccept}> Accept Updates</Button> }
                {this.state.showUpdateTable && <Button className="centerButton" onClick={this.handleReject}> Reject Updates</Button> }    
                </div>
            </div>
        );
    }
}
