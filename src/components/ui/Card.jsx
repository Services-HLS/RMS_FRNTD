import React from 'react';

const Card = ({ children, title, className = '', actions, ...props }) => {
    return (
        <div className={`card ${className}`} {...props}>
            {(title || actions) && (
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-neutral-border/50">
                    {title && <h3 className="text-[15px] font-medium text-primary">{title}</h3>}
                    {actions && <div className="flex items-center space-x-2">{actions}</div>}
                </div>
            )}
            <div className="text-[13px] text-neutral-text font-normal">{children}</div>
        </div>
    );
};

export default Card;
