import React from 'react';
import Card from './Card';

const SmartSuggestions = ({ messages }) => {
    if (!messages || messages.length === 0) return null;

    return (
        <div className="w-full space-y-4">
            {messages.map(msg => (
                <div key={msg.id} className="relative group">
                    {msg.type === 'STORY' && (
                        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-4 rounded-xl shadow-sm border border-orange-200 transform hover:scale-105 transition-transform duration-200">
                            <span className="text-xs font-bold text-orange-600 uppercase tracking-wide">Did you know?</span>
                            <p className="mt-2 text-gray-800 font-medium italic">"{msg.content}"</p>
                        </div>
                    )}
                    {msg.type === 'SUGGESTION' && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl shadow-sm border border-blue-200">
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">Chef Recommends</span>
                            <p className="mt-2 text-gray-800">{msg.content}</p>
                        </div>
                    )}
                    {msg.type === 'WELCOME' && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl shadow-sm border border-green-200">
                            <p className="text-green-800 font-bold text-lg">👋 {msg.content}</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default SmartSuggestions;
