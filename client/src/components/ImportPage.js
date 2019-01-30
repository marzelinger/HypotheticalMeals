import React, { Component } from 'react';
import axios from 'axios';

var endpoint = "not specified";

export default class ImportPage extends React.Component {
    constructor(){
        super()
        this.state = {
            selectedFile: null,
            loaded:0,
        }
    }

    handleSelectedFile = event => {
        this.setState({
            csv: event.target.files[0]
        });
    }

    handleUpload = () => {
        let formData = new FormData();
        formData.append('file', this.state.csv);

        if(this.state.csv.name.length >= 4 && this.state.csv.name.substring(0,4) === "skus"){
            endpoint = "http://localhost:3001/api/parseSkus";
        }
        else if(this.state.csv.name.length >= 13 && this.state.csv.name.substring(0,13) === "product_lines"){
            endpoint = "http://localhost:3001/api/parseProdLines";
        }
        else if(this.state.csv.name.length >= 11 && this.state.csv.name.substring(0,11) === "ingredients"){
            endpoint = "http://localhost:3001/api/parseProdLines";
        }
        else if(this.state.csv.name.length >= 8 && this.state.csv.name.substring(0,8) === "formulas"){
            endpoint = "http://localhost:3001/api/parseFormulas";
        } else {
            // TODO: put the shit in here about it not being a valid file name
        }
        let options = {
            method: 'POST',
            body: formData
        }
        fetch(endpoint, options)
            .then(resp => resp.json())
            .then(result => {
                alert(result.message);
            });
    }

    render() {
        return (
            <div className = "Import">
                <input type="file" name="" id="" onChange={this.handleSelectedFile} />
                <button onClick={this.handleUpload}>Upload</button>
                <div> {Math.round(this.state.loaded,2)} %</div>
            </div>
        );
    }
}
