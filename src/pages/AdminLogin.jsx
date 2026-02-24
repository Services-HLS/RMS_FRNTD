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

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.login({ username, password });
            if (response.token) {
                login(response.token, response.user);
                navigate('/admin/dashboard');
            }
        } catch (err) {
            setError('Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md" title="Admin Login">
                <form onSubmit={handleLogin} className="space-y-6">
                    <Input
                        label="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter username"
                    />
                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader className="h-5 w-5" /> : 'Login'}
                    </Button>
                    <p className="text-center text-sm text-gray-400 mt-2">
                        Are you a Super Admin?{' '}
                        <Link to="/super-admin/login" className="text-blue-600 hover:underline font-medium">
                            Login here
                        </Link>
                    </p>
                </form>
            </Card>
        </div>
    );
};

export default AdminLogin;
