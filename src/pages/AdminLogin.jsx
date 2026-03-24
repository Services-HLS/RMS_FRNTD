import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input, Button, Card, Loader } from '../components/ui';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.login({ username, password });
            if (response.token) {
                login(response.token, response.user);

                const role = String(response.user.role).toLowerCase();
                if (role === 'chef') {
                    navigate('/admin/kitchen');
                } else if (role === 'super_admin') {
                    navigate('/super-admin/dashboard');
                } else if (role === 'cashier') {
                    navigate('/admin/pos');
                } else if (role === 'inventory') {
                    navigate('/admin/stock');
                } else {
                    navigate('/admin/dashboard');
                }
            }
        } catch (err) {
            setError('Invalid credentials. Please check your username and password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-neutral relative selection:bg-secondary/30 selection:text-primary">

            {/* Main Login Area */}
            <main 
                className="flex-1 flex items-center justify-center p-6 bg-cover bg-center bg-no-repeat relative"
                style={{ backgroundImage: "url('/background-RS.svg')" }}
            >
                {/* Overlay for better readability (optional but recommended for UX) */}
                <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]"></div>
                <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
                    <Card className="shadow-premium border border-neutral-border !p-8 bg-white" title={<span className="text-[20px] font-semibold text-primary">Login</span>}>
                        <form onSubmit={handleLogin} className="space-y-6 mt-6">
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-[12px] font-semibold text-neutral-muted uppercase tracking-wider mb-2 ml-1">
                                        Username / Email
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter your username"
                                        className="w-full px-4 py-3 bg-neutral-zebra border border-neutral-border rounded-[6px] focus:outline-none focus:ring-1 focus:ring-secondary focus:bg-white text-sm transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[12px] font-semibold text-neutral-muted uppercase tracking-wider mb-2 ml-1">
                                        Security Password
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full px-4 py-3 bg-neutral-zebra border border-neutral-border rounded-[6px] focus:outline-none focus:ring-1 focus:ring-secondary focus:bg-white text-sm transition-all pr-12 tracking-widest font-sans"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-0 inset-y-0 px-4 text-neutral-muted hover:text-primary transition-colors flex items-center"
                                        >
                                            {showPassword ? (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-error/10 text-error rounded-[6px] text-[12px] font-medium flex items-center border border-error/10">
                                    <svg className="w-4 h-4 mr-2.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full py-4 text-[14px] font-bold shadow-premium bg-primary hover:brightness-90 text-white rounded-[6px] border-none flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
                                disabled={loading}
                            >
                                {loading ? <Loader className="h-5 w-5 text-white" /> : (
                                    <>
                                        <span>Secure Login</span>
                                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                    </>
                                )}
                            </Button>

                            <div className="pt-4 text-center">
                                <span className="text-[11px] font-bold text-neutral-muted/50 uppercase tracking-widest">
                                    Admin Terminal v2.0
                                </span>
                            </div>
                        </form>
                    </Card>
                </div>
            </main>

        </div>
    );
};

export default AdminLogin;
