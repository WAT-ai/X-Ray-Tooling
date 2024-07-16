import React, {useState} from 'react';
import Request from './Request';
import Response from './Response';

function RequestResponse({ queryObject, queryResponse, flowResponse, removeRequest, index }) {

    const { request, status, response } = queryObject;
    const { flow, requestType } = request;
    const responseData = requestType === 'flow' ? flowResponse[flow]?.data : response;




    return (
        <div>
            <Request requestObj={queryObject.request} removeRequest={removeRequest} index={index}/>
            <Response responseObj={responseData} />
        </div>
    );
}

export default RequestResponse;
