import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PromotionCarousel = ({ messages = [] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        if (messages.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % messages.length);
        }, 5000); // 5s auto-scroll
        return () => clearInterval(interval);
    }, [messages.length]);

    if (!messages || messages.length === 0) return null;

    const currentMsg = messages[currentIndex];

    const getBgColor = (type) => {
        switch(type) {
            case 'WELCOME': return 'bg-emerald-500 hover:bg-emerald-600';
            case 'STORY': return 'bg-amber-500 hover:bg-amber-600';
            case 'SUGGESTION': return 'bg-indigo-500 hover:bg-indigo-600';
            default: return 'bg-slate-800 hover:bg-slate-900';
        }
    };

    return (
        <div className="w-full mb-8 relative overflow-hidden rounded-3xl group shadow-xl">
            {/* Main Slide */}
            <div 
                key={currentMsg.id}
                onClick={() => navigate(`/promotion/${currentMsg.id}`)}
                className={`cursor-pointer transition-all duration-700 min-h-[140px] flex items-center p-6 md:px-10 md:py-8 text-white ${getBgColor(currentMsg.type)} animate-in fade-in slide-in-from-right-8`}
            >
                <div className="flex-1 space-y-2 z-10">
                    <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest border border-white/20">
                            {currentMsg.type}
                        </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tighter leading-[0.9]">
                        {currentMsg.title || 'Special Promotion'}
                    </h2>
                    <p className="text-xs md:text-sm text-white/80 font-medium line-clamp-1 max-w-xl">
                        {currentMsg.content}
                    </p>
                    <div className="pt-4 flex items-center text-xs font-black uppercase tracking-widest bg-white/10 w-fit px-4 py-2 rounded-xl group-hover:bg-white/20 transition-all">
                        <span>Read More Details</span>
                        <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                </div>

                {/* Optional Decorative Icon/Emoji based on type */}
                <div className="hidden md:block opacity-20 absolute right-12 top-1/2 -translate-y-1/2 text-[120px] pointer-events-none transform -rotate-12 group-hover:rotate-0 transition-transform duration-500">
                    {currentMsg.type === 'WELCOME' ? '🎁' : currentMsg.type === 'STORY' ? '✨' : '🔥'}
                </div>
            </div>

            {/* Carousel Indicators */}
            {messages.length > 1 && (
                <div className="absolute bottom-6 right-8 flex space-x-2">
                    {messages.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default PromotionCarousel;
