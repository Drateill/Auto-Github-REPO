import React from 'react';

const Checkbox = ({ label, id, checked, onChange }) => {
  return (
    <div>
      <label htmlFor={id}>{label}:</label>
      <input type="checkbox" id={id} checked={checked} onChange={onChange} />
    </div>
  );
};

export default Checkbox;
