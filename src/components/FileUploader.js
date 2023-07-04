import React from 'react';

const FileUploader = ({ label, id, onChange }) => {
  return (
    <div>
      <label htmlFor={id}>{label}:</label>
      <input type="file" id={id} onChange={onChange} multiple />
    </div>
  );
};

export default FileUploader;
