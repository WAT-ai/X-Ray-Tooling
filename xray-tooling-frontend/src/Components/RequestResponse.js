import React, {useState} from 'react';
import Request from './Request';
import Response from './Response';

function RequestResponse({ queryObject, removeRequest, index }) {



    return (
        <div>
            <Request requestObj={queryObject.request} removeRequest={removeRequest} index={index}/>
            <Response responseObj={queryObject.response} />
        </div>
    );
}

export default RequestResponse;
