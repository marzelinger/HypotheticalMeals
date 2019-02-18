// Module for editing Manu_Lines in SkuDetails

import React from 'react'
import PropTypes from 'prop-types';
import { 
    Label,
    FormGroup} from 'reactstrap';
import * as Constants from '../../resources/Constants';
import SubmitRequest from './../../helpers/SubmitRequest'
import Filter from './Filter'

export default class ModifyManuLines extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currLines : [],
            lines: []
        };
    }

    componentDidMount () {
        this.injectManuLines();
    }

    async onFilterValueSelection (opts, e) {
        let newLines = opts.map(opt => {
            return opt.value._id
        })
        this.props.handleModifyManuLines(newLines)
    }

    async injectManuLines() { 
        let to_return = await this.props.item['manu_lines'].map(async (id) => {
            let mLine = await SubmitRequest.submitGetManufacturingLineByID(id)
            return await {
                label: mLine.data[0].name,
                value: mLine.data[0]._id
            }
        })
        let mLines = await Promise.all(to_return);
        await console.log(mLines)
        await this.setState({
            currLines: mLines,
        })
    }

    render() {
        // const customStyles = {
        //     control: (base, state) => ({
        //         ...base,
        //         borderColor: this.props.invalid_inputs.includes('manu_lines') ? 'red' : '#ddd'
        //     })
        // }
        return (
        <div className='filter-item detailsfilter' style={{width: this.state.width + '%'}}>
            <FormGroup>
            <Label>{Constants.modify_manu_lines_label}</Label>
                <Filter
                    handleFilterValueSelection = {(opts, e) => this.onFilterValueSelection(opts)}
                    type = {'manu_lines'}
                    multi = {true}
                    data = {this.state.currLines.length ? this.state.currLines : undefined}
                />
            </FormGroup>
        </div>
        );
    }

}

ModifyManuLines.propTypes = {
    item: PropTypes.object,
    handleModifyManuLines: PropTypes.func
}