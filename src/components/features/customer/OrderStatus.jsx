import React, { useState, useEffect } from 'react';
import { Loader, Card } from '../../ui';
import api from '../../../services/api';

const OrderStatus = ({ orderId }) => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const data = await api.getOrderStatus(orderId);
                setOrder(data);
            } catch (error) {
                console.error("Failed to fetch order status", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [orderId]);

    if (loading) return <Loader />;
    if (!order) return <p>Order not found</p>;

    const steps = ['ORDERED', 'PREPARING', 'READY', 'COMPLETED'];
    const currentStep = steps.indexOf(order.status);

    return (
        <div className="space-y-6">
            <Card>
                <h3 className="text-xl font-bold mb-4">Order #{order.id}</h3>
                <div className="relative">
                    {steps.map((step, index) => (
                        <div key={step} className="flex items-center mb-4 last:mb-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${index <= currentStep ? 'bg-green-500' : 'bg-gray-300'
                                }`}>
                                {index + 1}
                            </div>
                            <div className="ml-4">
                                <p className={`font-semibold ${index <= currentStep ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {step}
                                </p>
                            </div>
                        </div>
                    ))}
                    <div className="absolute top-4 left-4 w-0.5 h-full bg-gray-200 -z-10" style={{ height: 'calc(100% - 2rem)' }}></div>
                </div>
            </Card>

            <Card title="Items">
                <ul className="divide-y divide-gray-200">
                    {order.items.map((item, idx) => (
                        <li key={idx} className="py-2 flex justify-between">
                            <span>{item.name} x {item.qty}</span>
                            <span>₹{item.price * item.qty}</span>
                        </li>
                    ))}
                </ul>
                <div className="mt-4 pt-4 border-t flex justify-between font-bold">
                    <span>Total</span>
                    <span>₹{order.total_amount}</span>
                </div>
            </Card>
        </div>
    );
};

export default OrderStatus;
