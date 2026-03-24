import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

let alertContainer = null;
let alertRoot = null;

const AlertComponent = ({ message, type, title, onResolve, onClose }) => {
    const isConfirm = type === 'confirm';
    
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose(false);
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, []);

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => onClose(false)}></div>
            <div className="relative bg-white rounded-[24px] p-6 shadow-2xl shadow-slate-900/20 max-w-[320px] w-full animate-in zoom-in-95 duration-200 border border-slate-100 flex flex-col items-center text-center">
                
                {/* Icon */}
                {type === 'success' && (
                    <div className="w-14 h-14 bg-emerald-100/50 text-emerald-500 rounded-full flex items-center justify-center mb-4 ring-4 ring-emerald-50">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                )}
                {type === 'error' && (
                    <div className="w-14 h-14 bg-red-100/50 text-red-500 rounded-full flex items-center justify-center mb-4 ring-4 ring-red-50">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                    </div>
                )}
                {isConfirm && (
                    <div className="w-14 h-14 bg-amber-100/50 text-amber-500 rounded-full flex items-center justify-center mb-4 ring-4 ring-amber-50">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                )}

                {/* Title */}
                {title && <h3 className="text-lg font-black text-slate-800 mb-1 leading-tight tracking-tight">{title}</h3>}
                
                {/* Message */}
                <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed bg-slate-50 p-3 rounded-xl w-full">{message}</p>
                
                {/* Actions */}
                <div className="flex w-full space-x-3">
                    {isConfirm ? (
                        <>
                            <button 
                                onClick={() => onClose(false)}
                                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all hover:scale-[1.02] active:scale-95"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => onResolve(true)}
                                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all hover:scale-[1.02] active:scale-95"
                            >
                                Confirm
                            </button>
                        </>
                    ) : (
                        <button 
                            onClick={() => onClose(true)}
                            className="w-full py-3 bg-slate-900 border border-slate-800 text-white rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-slate-800 shadow-xl shadow-slate-900/10 transition-all hover:scale-[1.02] active:scale-95"
                        >
                            Okay
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const showModal = (options) => {
    return new Promise((resolve) => {
        if (!alertContainer) {
            alertContainer = document.createElement('div');
            document.body.appendChild(alertContainer);
            alertRoot = createRoot(alertContainer);
        }

        const closeAndResolve = (result) => {
            alertRoot.render(null);
            resolve(result);
        };

        alertRoot.render(
            <AlertComponent 
                {...options} 
                onResolve={closeAndResolve} 
                onClose={closeAndResolve} 
            />
        );
    });
};

export const customAlert = (message, title = 'Notification', type = 'success') => {
    return showModal({ message, title, type });
};

export const customError = (message, title = 'Error') => {
    return showModal({ message, title, type: 'error' });
};

export const customConfirm = (message, title = 'Are you sure?') => {
    return showModal({ message, title, type: 'confirm' });
};

// Global override setup
export const setupGlobalAlerts = () => {
    window.alert = (message) => customAlert(message);
    window.confirm = () => {
        console.warn("Synchronous window.confirm is deprecated. Use async customConfirm instead.");
        return false; // Sync confirm cannot be overridden beautifully with portals. We will refactor usages.
    };
};
