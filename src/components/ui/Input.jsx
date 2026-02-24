import React from 'react';

const Input = ({ label, type = 'text', value, onChange, placeholder = '', error = '', className = '' }) => {
    return (
        <div className={`flex flex-col ${className}`}>
            {label && <label className="mb-1 text-sm font-medium text-gray-700">{label}</label>}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300'
                    }`}
            />
            {error && <span className="mt-1 text-sm text-red-500">{error}</span>}
        </div>
    );
};

export default Input;
