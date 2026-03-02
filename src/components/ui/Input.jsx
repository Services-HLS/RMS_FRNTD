import React from 'react';

const Input = ({ label, type = 'text', value, onChange, placeholder = '', error = '', className = '', rightElement }) => {
    const labelStyle = "mb-1.5 text-[12px] font-medium text-neutral-muted uppercase tracking-wider ml-0.5";
    const inputStyle = `input ${error ? 'border-error' : 'border-neutral-border'} ${rightElement ? 'pr-10' : ''}`;

    return (
        <div className={`flex flex-col ${className}`}>
            {label && <label className={labelStyle}>{label}</label>}
            <div className="relative">
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`${inputStyle} focus:ring-secondary/30`}
                />
                {rightElement && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        {rightElement}
                    </div>
                )}
            </div>
            {error && <span className="mt-1 text-[11px] font-medium text-error ml-1 tracking-tight">{error}</span>}
        </div>
    );
};

export default Input;
