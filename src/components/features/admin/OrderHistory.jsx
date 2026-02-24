import React, { useState, useEffect } from 'react';
import { Card, Loader } from '../../ui';
import api from '../../../services/api';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchHistory();
    }, [filterDate]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const allOrders = await api.getAllOrders();
            // Filter for orders for the selected date
            const filtered = allOrders.filter(o => {
                const matchDate = !filterDate || (o.created_at && o.created_at.startsWith(filterDate));
                return matchDate;
            });
            setOrders(filtered);
        } catch (error) {
            console.error("Failed to fetch order history", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Closed Orders</h2>
                <input
                    type="date"
                    className="px-3 py-2 border rounded-lg"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                />
            </div>
            {orders.length === 0 && <p className="text-gray-500 text-center py-8">No closed orders found for this date.</p>}
            <div className="grid gap-4">
                {orders.map(order => (
                    <Card key={order.id} className="bg-gray-50">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center space-x-2">
                                    <span className="font-bold">Order #{order.id}</span>
                                    <span className="text-sm text-gray-500">• {new Date(order.created_at).toLocaleTimeString()}</span>
                                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-gray-200 text-gray-700">{order.status}</span>
                                </div>
                                <div className="text-sm text-gray-600 mt-1">Table {order.table_id} • {order.payment_method}</div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-lg">₹{order.total_amount}</div>
                                <div className="text-green-600 text-xs font-bold">{order.payment_status}</div>
                            </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                            {order.items?.map(i => `${i.qty}x ${i.name}`).join(', ') || 'No items listed'}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default OrderHistory;
