import React from 'react';
import SimpleValue from 'react-select-simple-value';
import ReactSelect from 'react-select';
import SubmitRequest from '../../helpers/SubmitRequest';

const ResetPage = (props) => {
    SubmitRequest.submitReset();

    return (
    <div>
        Resetting...
        
    </div>)
};

export default ResetPage;
