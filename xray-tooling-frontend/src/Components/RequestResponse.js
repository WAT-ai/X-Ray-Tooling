import React, {useState} from 'react';
import Request from './Request';
import Response from './Response';

function RequestResponse({ queryObject, queryResponse, flowResponse, removeRequest, index }) {

    const { request, response, status } = queryObject;
    const { flow, requestType } = request;
    const responseData = requestType === 'flow' ? flowResponse[flow]?.data : response.data;
    const responseDocs = requestType === 'flow' ? flowResponse[flow]?.docs : response.docs;




    return (
        <div>
            <Request requestObj={queryObject.request} removeRequest={removeRequest} index={index}/>
            <Response responseData={responseData} responseDocs={responseDocs} status={status}/>
        </div>
    );
}

export default RequestResponse;
