import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Header = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo & Title */}
                    <Link to="/" className="flex items-center space-x-3 group">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-slate-200">
                            <span className="text-xl">🍕</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black tracking-tight text-slate-900 leading-none">
                                Restaurant OS
                            </span>
                        </div>
                    </Link>

                    {/* Navigation Actions */}
                    <div className="flex items-center space-x-4 sm:space-x-8">
                        {token && user ? (
                            <div className="flex items-center space-x-4">
                                <div className="hidden sm:flex flex-col items-end mr-2">
                                    <span className="text-xs font-black text-slate-900 capitalize leading-none mb-1">
                                        {user.username}
                                    </span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1.5 py-0.5 bg-slate-50 rounded">
                                        {user.role?.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="h-8 w-px bg-slate-100 hidden sm:block"></div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-2 px-4 py-2 rounded-xl text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all duration-300 font-bold text-sm border border-transparent hover:border-red-100 active:scale-95"
                                >
                                    <span>Logout</span>
                                    <span className="text-xs">🔒</span>
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-200 transition-all duration-300 active:scale-95 flex items-center space-x-2"
                            >
                                <span>Portal Access</span>
                                <span className="text-lg">→</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
