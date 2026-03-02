import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Button, Loader } from '../components/ui';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const SuperAdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (username && password) {
                await new Promise(r => setTimeout(r, 600)); // Simulate API delay

                const dummyResponse = {
                    token: 'dummy-superadmin-token-999',
                    user: {
                        id: 999,
                        username: username,
                        role: 'super_admin',
                    }
                };

                login(dummyResponse.token, dummyResponse.user);
                navigate('/super-admin/dashboard');
            } else {
                setError('Please enter both username and password.');
            }
        } catch (err) {
            setError(err.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 relative selection:bg-blue-500 selection:text-white">
            {/* Minimal Unified Header */}
            <header className="w-full bg-white border-b border-slate-200">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-3 group">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center transform group-hover:-rotate-6 transition-transform duration-300 shadow-xl shadow-slate-200">
                            <span className="text-xl leading-none block">🍕</span>
                        </div>
                        <span className="text-xl font-black tracking-tight text-slate-900 leading-none">
                            Restaurant OS
                        </span>
                    </div>
                    <div className="text-xs font-black text-slate-400 tracking-widest uppercase">
                        Super Admin Authorization
                    </div>
                </div>
            </header>

            {/* Main Authenticatiom Visual Canvas */}
            <main className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="w-full !p-8 shadow-2xl shadow-indigo-100/50 border-0 ring-1 ring-slate-100 rounded-2xl bg-white" title={
                        <div className="text-left w-full">
                            <span className="text-2xl font-black tracking-tight text-slate-900 block mb-1">Super Admin Login</span>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Platform Management</span>
                        </div>
                    }>
                        <form onSubmit={handleLogin} className="space-y-6 mt-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="superadmin"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-colors pr-12 text-lg tracking-widest"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-0 inset-y-0 px-4 text-slate-400 hover:text-blue-600 focus:outline-none transition-colors flex items-center justify-center my-auto"
                                        >
                                            {showPassword ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-semibold flex items-start">
                                    <svg className="w-5 h-5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    {error}
                                </div>
                            )}

                            <Button type="submit" className="w-full py-4 text-[15px] font-bold shadow-lg shadow-blue-500/30 rounded-xl transition-all active:scale-[0.98] border-0 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 ease-out" disabled={loading}>
                                {loading ? <Loader className="h-6 w-6 text-white" /> : 'Secure Root Login →'}
                            </Button>

                            <div className="pt-2 text-center text-xs text-slate-400 font-medium">
                                Root Level Authorization • Global Scope Control
                            </div>
                        </form>
                    </Card>
                </div>
            </main>

            {/* Minimal Unified Footer */}
            <footer className="w-full bg-slate-50 border-t border-slate-200 py-6">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs font-bold text-slate-400 tracking-wider">
                    <span>© {new Date().getFullYear()} RESTAURANT OS</span>
                    <div className="flex space-x-6 mt-4 sm:mt-0">
                        <a href="#" className="hover:text-blue-600 transition-colors uppercase">Enterprise Support</a>
                        <a href="#" className="hover:text-blue-600 transition-colors uppercase">System Status</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default SuperAdminLogin;
