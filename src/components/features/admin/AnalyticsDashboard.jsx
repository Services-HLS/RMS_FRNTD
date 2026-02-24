import React, { useState, useEffect } from 'react';
import { Card, Loader } from '../../ui';
import api from '../../../services/api';

const AnalyticsDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const data = await api.getAnalytics();
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch analytics", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-blue-50 border-blue-200">
                    <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
                    <p className="text-3xl font-bold text-blue-700">₹{stats?.revenue || 0}</p>
                </Card>
                <Card className="bg-green-50 border-green-200">
                    <p className="text-gray-500 text-sm font-medium">Total Orders</p>
                    <p className="text-3xl font-bold text-green-700">{stats?.total_orders || 0}</p>
                </Card>
                <Card className="bg-purple-50 border-purple-200">
                    <p className="text-gray-500 text-sm font-medium">Active Tables</p>
                    <p className="text-3xl font-bold text-purple-700">{stats?.active_tables || 0}</p>
                </Card>
            </div>

            {/* Popular Items */}
            <Card title="Popular Items">
                <ul className="divide-y divide-gray-200">
                    {stats?.popular_items?.map((item, idx) => (
                        <li key={idx} className="py-3 flex justify-between items-center">
                            <span className="font-medium text-gray-800">{item.name}</span>
                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                                {item.count} orders
                            </span>
                        </li>
                    ))}
                </ul>
            </Card>
        </div>
    );
};

export default AnalyticsDashboard;
