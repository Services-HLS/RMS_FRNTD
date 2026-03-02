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
                ['ORDERED', 'PREPARING'].includes(o.status) && o.payment_status === 'COMPLETED'
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

    if (loading) return <div className="p-12 flex justify-center"><Loader /></div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {orders.length === 0 && (
                <div className="col-span-full py-20 text-center bg-white rounded-3xl shadow-sm border border-slate-200">
                    <div className="w-24 h-24 bg-slate-50 flex items-center justify-center rounded-full mx-auto mb-6">
                        <span className="text-4xl grayscale opacity-50">🍽️</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">No active orders</h3>
                    <p className="text-slate-500 font-medium tracking-wide mt-2">The kitchen queue is currently clear.</p>
                </div>
            )}
            {orders.map(order => {
                const isLate = Math.floor((currentTime - new Date(order.created_at)) / 1000 / 60) > 15;
                const isOrdered = order.status === 'ORDERED';

                return (
                    <Card
                        key={order.id}
                        className={`relative overflow-hidden group shadow-lg transition-all ${isOrdered ? 'border-amber-200 shadow-amber-100/50 bg-white' : 'border-blue-200 shadow-blue-100/50 bg-blue-50/10'}`}
                    >
                        {/* Top Status Bar indicator */}
                        <div className={`absolute top-0 left-0 w-full h-1.5 ${isOrdered ? 'bg-amber-400' : 'bg-blue-500'}`}></div>

                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-black text-2xl text-slate-900 tracking-tight leading-none">#{order.id}</h4>
                                    <div className="mt-1 flex items-center space-x-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${order.type === 'DINE_IN' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {order.type === 'DINE_IN' ? 'Dine In' : 'Takeaway'}
                                        </span>
                                        {order.table_id && (
                                            <span className="text-sm font-bold text-slate-500">Table {order.table_id}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm ${isOrdered ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>

                            <div className={`mb-5 flex items-center space-x-2 font-mono text-sm py-2 px-3 rounded-lg border ${isLate ? 'border-red-200 bg-red-50 text-red-600 font-bold' : 'border-slate-100 bg-slate-50 text-slate-600 font-medium'}`}>
                                <span className={isLate ? 'animate-pulse' : ''}>⏳</span>
                                <span>Waiting: {getOrderTime(order.created_at)}</span>
                            </div>

                            <div className="bg-white border border-slate-100 rounded-xl overflow-hidden mb-6 shadow-sm">
                                <ul className="divide-y divide-slate-50">
                                    {order.items && order.items.length > 0 ? order.items.map((item, idx) => (
                                        <li key={idx} className="py-3 px-4 flex justify-between items-center group-hover:bg-slate-50 transition-colors">
                                            <span className="font-bold text-slate-800">{item.name}</span>
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-black shadow-sm ${isOrdered ? 'bg-amber-50 rounded-md text-amber-600 border border-amber-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>x{item.qty}</span>
                                        </li>
                                    )) : (
                                        <li className="py-3 px-4 text-slate-400 text-sm">No items found</li>
                                    )}
                                </ul>
                            </div>

                            <div className="space-y-3 mt-auto">
                                {isOrdered ? (
                                    <button
                                        onClick={() => updateStatus(order.id, 'PREPARING')}
                                        className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-md shadow-amber-200 transition-all flex items-center justify-center space-x-2"
                                    >
                                        <span>Accept & Start Prep</span>
                                        <span>👨‍🍳</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => updateStatus(order.id, 'COMPLETED')}
                                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-200 transition-all flex items-center justify-center space-x-2"
                                    >
                                        <span>Complete Order</span>
                                        <span>✅</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => handlePrintKOT(order.id)}
                                    className="w-full py-2.5 px-4 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 rounded-xl font-bold transition-all flex items-center justify-center space-x-2"
                                >
                                    <span>Print KOT Ticket</span>
                                    <span>🖨️</span>
                                </button>
                            </div>
                        </div>
                    </Card>
                )
            })}
        </div>
    );
};

export default KitchenOrderView;
