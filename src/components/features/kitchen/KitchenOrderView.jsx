import React, { useState, useEffect } from 'react';
import { Card, Button, Loader } from '../../ui';
import api from '../../../services/api';

const KitchenOrderView = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        fetchOrders();
        const pollInterval = setInterval(fetchOrders, 10000); // Poll every 10s
        const timerInterval = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => {
            clearInterval(pollInterval);
            clearInterval(timerInterval);
        };
    }, []);

    const fetchOrders = async () => {
        try {
            const allOrders = await api.getOrders();
            const activeOrders = allOrders.filter(o =>
                ['ORDERED', 'PREPARING'].includes(o.status)
            ).sort((a, b) => new Date(a.created_at) - new Date(b.created_at)); // Oldest first
            setOrders(activeOrders);
        } catch (error) {
            console.error("Failed to fetch kitchen orders", error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            await api.updateOrderStatus(orderId, newStatus);
            fetchOrders();
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const handlePrintKOT = async (orderId) => {
        try {
            await api.createKOTJob(orderId);
            alert(`KOT Printed for Order #${orderId}`);
        } catch (error) {
            console.error("Failed to print KOT", error);
        }
    };

    const getOrderTime = (createdAt) => {
        const diff = Math.floor((currentTime - new Date(createdAt)) / 1000);
        const mins = Math.floor(diff / 60);
        const secs = diff % 60;
        return `${mins}m ${secs}s`;
    };

    if (loading) return <Loader />;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {orders.length === 0 && (
                <div className="col-span-full py-20 text-center bg-white rounded-xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 text-lg">All orders completed. Good job!</p>
                </div>
            )}
            {orders.map(order => (
                <Card
                    key={order.id}
                    className={`border-t-4 ${order.status === 'ORDERED' ? 'border-t-orange-500 shadow-orange-100' : 'border-t-blue-500 shadow-blue-100'}`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h4 className="font-bold text-xl">Order #{order.id}</h4>
                            <p className="text-sm font-medium text-gray-400">Table {order.table_id}</p>
                        </div>
                        <div className="text-right">
                            <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase ${order.status === 'ORDERED' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                {order.status}
                            </span>
                        </div>
                    </div>

                    <div className="mb-4 flex items-center space-x-2 text-gray-500 font-mono text-sm">
                        <span>🕒</span>
                        <span className={`${Math.floor((currentTime - new Date(order.created_at)) / 1000 / 60) > 10 ? 'text-red-500 font-bold' : ''
                            }`}>
                            {getOrderTime(order.created_at)}
                        </span>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <ul className="divide-y divide-gray-200">
                            {order.items.map((item, idx) => (
                                <li key={idx} className="py-2 flex justify-between items-center">
                                    <span className="font-medium text-gray-700">{item.name}</span>
                                    <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs font-bold">x{item.qty}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-2">
                        {order.status === 'ORDERED' ? (
                            <Button size="sm" onClick={() => updateStatus(order.id, 'PREPARING')} className="w-full h-12 text-lg">
                                Start Cooking 👨‍🍳
                            </Button>
                        ) : (
                            <Button size="sm" onClick={() => updateStatus(order.id, 'READY')} className="w-full h-12 text-lg bg-green-600 hover:bg-green-700">
                                Mark Ready ✅
                            </Button>
                        )}
                        <Button size="sm" variant="secondary" onClick={() => handlePrintKOT(order.id)} className="w-full border-dashed">
                            Print KOT 🗒️
                        </Button>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default KitchenOrderView;
