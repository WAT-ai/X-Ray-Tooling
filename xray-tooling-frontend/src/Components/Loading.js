import React from 'react';
import ReactLoading from "react-loading";


const Loading = () => {
  return (
    <div className="loading">
      <ReactLoading type="balls" color="#0000FF"
                height={100} width={50} />
    </div>
  );
};

export default Loading;
