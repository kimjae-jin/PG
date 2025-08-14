import React from 'react';

const Input = ({ id, name, type = 'text', value, onChange, placeholder, required = false }) => {
  return (
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full px-3 py-2 bg-gray-900 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
    />
  );
};

export default Input;
