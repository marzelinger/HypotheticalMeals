import React, { Component } from 'react';
import axios from 'axios';

var endpoint = "not specified";
const csv = require('csvtojson');

export default class ImportPage extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            selectedFile: null
        }
    }

    handleSelectedFile = event => {
        this.setState({
            selectedFile: event.target.files[0]
        })
    }

    handleUpload = () => {
        var fd = new FormData();
        fd.append('file', this.state.selectedFile, this.state.selectedFile.name);

        if(this.state.selectedFile.name.length >= 4 && this.state.selectedFile.name.substring(0,4) === "skus"){
            endpoint = "/api/parseSkus";
        }
        else if(this.state.selectedFile.name.length >= 13 && this.state.selectedFile.name.substring(0,13) === "product_lines"){
            endpoint = "/api/parseProdLines";
        }
        else if(this.state.selectedFile.name.length >= 11 && this.state.selectedFile.name.substring(0,11) === "ingredients"){
            endpoint = "/api/parseProdLines";
        }
        else if(this.state.selectedFile.name.length >= 8 && this.state.selectedFile.name.substring(0,8) === "formulas"){
            endpoint = "/api/parseFormulas";
        } else {
            // TODO: put the shit in here about it not being a valid file name
        }
        console.log(endpoint);
        console.log(fd);
        axios.post(endpoint, fd)
            .then(res => {
                console.log(JSON.stringify(res));
            });
        
    }

    render() {
        return (
            <div className = "Import">
                <input type="file" onChange={this.handleSelectedFile} />
                <button onClick={this.handleUpload}>Upload</button>
                <div> {Math.round(this.state.loaded,2)} %</div>
            </div>
        );
    }
}
