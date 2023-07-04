import React from 'react';

const InputField = ({ label, id, value, onChange }) => {
  return (
    <div>
      <label htmlFor={id}>{label}:</label>
      <input type="text" id={id} value={value} onChange={onChange} />
    </div>
  );
};

export default InputField;
