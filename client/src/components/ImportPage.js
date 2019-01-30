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
            selectedFile: event.target.files[0],
            loaded: 0
        });
    }

    handleUpload = () => {
        const data = new FormData();
        data.append('file', this.state.selectedFile, this.state.selectedFile.name);
        if(this.state.selectedFile.name.length >= 4 && this.state.selectedFile.name.substring(0,4) === "skus"){
            endpoint = "http://localhost:3001/api/parseSkus";
        }
        else if(this.state.selectedFile.name.length >= 13 && this.state.selectedFile.name.substring(0,13) === "product_lines"){
            endpoint = "http://localhost:3001/api/parseProdLines";
        }
        else if(this.state.selectedFile.name.length >= 11 && this.state.selectedFile.name.substring(0,11) === "ingredients"){
            endpoint = "http://localhost:3001/api/parseProdLines";
        }
        else if(this.state.selectedFile.name.length >= 8 && this.state.selectedFile.name.substring(0,8) === "formulas"){
            endpoint = "http://localhost:3001/api/parseFormulas";
        } else {
            // TODO: put the shit in here about it not being a valid file name
        }
        axios.post(endpoint, data, {
            onUploadProgress: ProgressEvent => {
                this.setState({
                    loaded: (ProgressEvent.loaded / ProgressEvent.total)*100,
                })
            },
        })
        .then(res => {
            console.log(res.statusText);
        })
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
