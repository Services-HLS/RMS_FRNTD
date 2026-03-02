import React from 'react';

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, type = 'button' }) => {
    const baseStyles = 'btn';

    const variants = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        success: 'btn-success',
        danger: 'bg-error text-white hover:opacity-90',
        outline: 'border border-primary text-primary hover:bg-neutral-zebra',
    };

    return (
        <button
            type={type}
            className={`${baseStyles} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default Button;
