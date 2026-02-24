import React from 'react';

const Card = ({ children, title, className = '', actions, ...props }) => {
    return (
        <div className={`bg-white p-6 rounded-xl shadow-md border border-gray-100 ${className}`} {...props}>
            {(title || actions) && (
                <div className="flex justify-between items-center mb-4">
                    {title && <h3 className="text-lg font-semibold text-gray-800">{title}</h3>}
                    {actions && <div>{actions}</div>}
                </div>
            )}
            <div>{children}</div>
        </div>
    );
};

export default Card;
