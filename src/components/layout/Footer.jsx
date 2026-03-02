import React from 'react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-slate-200 mt-auto">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex flex-col md:flex-row justify-between items-center text-sm">
                    {/* Brand Info */}
                    <div className="flex items-center space-x-2 mb-3 md:mb-0">
                        <span className="text-sm">🍕</span>
                        <span className="text-sm font-black text-slate-900 tracking-tighter uppercase">Restaurant OS</span>
                        <span className="hidden md:inline-block text-slate-300 mx-2">|</span>
                        <p className="text-slate-400 font-medium hidden md:block text-xs">Universal Management Suite</p>
                    </div>

                    {/* Resources */}
                    <div className="flex space-x-6">
                        <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest transition-colors">© {currentYear}</span>
                        <a href="#" className="text-slate-400 hover:text-blue-600 font-bold uppercase text-[10px] tracking-widest transition-colors">Support</a>
                        <a href="#" className="text-slate-400 hover:text-blue-600 font-bold uppercase text-[10px] tracking-widest transition-colors">Privacy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
