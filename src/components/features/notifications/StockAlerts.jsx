import React, { useState, useEffect } from 'react';
import { Card, Button } from '../../ui';
import api from '../../../services/api';

const StockAlerts = ({ isOpen, onClose }) => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchAlerts();
        }
    }, [isOpen]);

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            const [stock, menu] = await Promise.all([
                api.getStock(),
                api.getMenu()
            ]);

            const stockAlerts = stock
                .filter(item => item.quantity <= item.low_stock_threshold)
                .map(item => ({ ...item, type: 'RAW_MATERIAL' }));

            const menuAlerts = menu
                .filter(item => item.quantity <= item.low_stock_threshold)
                .map(item => ({ ...item, type: 'MENU_ITEM' }));

            setAlerts([...stockAlerts, ...menuAlerts]);
        } catch (error) {
            console.error("Failed to fetch alerts", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl flex flex-col animate-slide-in-right">
                <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                    <h2 className="text-lg font-bold text-slate-800">Low Stock Alerts</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 font-bold text-xl">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loading ? (
                        <p className="text-center text-gray-500 py-10">Checking inventory...</p>
                    ) : alerts.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <span className="text-4xl block mb-2">⭐</span>
                            <p>All stock levels are healthy!</p>
                        </div>
                    ) : (
                        alerts.map(item => (
                            <Card key={`${item.type}-${item.id}`} className="border-l-4 border-l-red-500 bg-red-50/30">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-slate-800">{item.name}</p>
                                        <p className="text-xs text-slate-500 uppercase tracking-wider">{item.type.replace('_', ' ')}</p>
                                    </div>
                                    <span className="text-red-600 font-bold">{item.quantity} {item.unit || ''}</span>
                                </div>
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-[10px] text-gray-400">Threshold: {item.low_stock_threshold}</span>
                                    <Button size="xs" variant="outline" className="text-[10px] py-0.5 h-6">Restock</Button>
                                </div>
                            </Card>
                        ))
                    )}
                </div>

                <div className="p-4 border-t bg-slate-50">
                    <Button className="w-full" onClick={onClose}>Close Panel</Button>
                </div>
            </div>
        </div>
    );
};

export default StockAlerts;
