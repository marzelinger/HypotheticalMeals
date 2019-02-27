// Module for editing Manu_Lines in SkuDetails

import React from 'react'
import PropTypes from 'prop-types';
import { 
    Label,
    FormGroup} from 'reactstrap';
import * as Constants from '../../resources/Constants';
import SubmitRequest from './../../helpers/SubmitRequest'
import Filter from './Filter'
import { EditorMultilineChart } from 'material-ui/svg-icons';
const currentUserIsAdmin = require("../auth/currentUserIsAdmin");


export default class ModifyManuLines extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            width: 100,
            currLines : ['loading'],
            lines: [],
            num_lines: 0
        };
    }

    componentDidMount = async () => {
        await this.injectManuLines();
    }

    async componentDidUpdate(prevProps, prevState) {
        if (this.state.num_lines !== this.props.item['manu_lines'].length){
            await this.injectManuLines();
        }
    }

    async onFilterValueSelection (opts, e) {
        if(currentUserIsAdmin().isValid){
        let newLines = [];
        opts.map(opt => {
            if (!newLines.includes(opt.value._id)){
                newLines.push(opt.value._id)
            }
        })
        this.props.handleModifyManuLines(newLines)
    }
    }

    async injectManuLines() { 
        console.log(this.props.item)
        if(this.props.item['manu_lines']){
            let to_return = await this.props.item['manu_lines'].map(async (id) => {
                let mLine = await SubmitRequest.submitGetManufacturingLineByID(id)
                console.log(mLine);
                if(mLine.success){
                    return await {
                        label: mLine.data[0].short_name,
                        value: {_id : mLine.data[0]._id}
                    }
                }
            })
            let mLines = await Promise.all(to_return);
            this.setState({
                currLines: mLines,
                num_lines: mLines.length
            })
        }
    }

    render() {
        return (
        <div className='filter-item detailsfilter' style={{width: this.state.width + '%'}}>
            <FormGroup>
            <Label>{this.props.label}</Label>
                <Filter
                    handleFilterValueSelection = {(opts, e) => this.onFilterValueSelection(opts)}
                    type = {Constants.manu_line_page_name}
                    multi = {true}
                    currItems = {this.state.currLines}
                    disabled = {this.props.disabled}
                />
            </FormGroup>
        </div>
        );
    }

}

ModifyManuLines.propTypes = {
    item: PropTypes.object,
    label: PropTypes.string,
    handleModifyManuLines: PropTypes.func,
    disabled: PropTypes.bool
}