import React from 'react';

const storedData = JSON.parse(localStorage.getItem('userData'));
console.log(storedData.url);

const Steptwo = () => {
  return (
    <div style={{ textAlign: 'center' }}>
      <img
        src="logo.svg" // Replace with your image URL or path
        alt="Example"
        style={{ width: '100%', maxWidth: '500px', display: 'block', margin: '0 auto' }}
      />
      <p style={{ marginTop: '20px', fontSize: '20px' }}>Your text goes here</p>
    </div>
  );
};

export default Steptwo;
