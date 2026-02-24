import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnalyticsDashboard } from '../components/features/admin';

const AdminDashboard = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/admin/login');
        }
    }, [navigate]);

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
            <AnalyticsDashboard />
        </div>
    );
};

export default AdminDashboard;
