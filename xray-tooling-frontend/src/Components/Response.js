import React from 'react';

function Response({responseObj}) {
  return (
    <div class="flex justify-between text-left mt-5 mb-14 p-8 bg-response-grey w-full h-auto rounded-3xl">
      <h1>{responseObj}</h1>
    </div>
  );
}

export default Response;
