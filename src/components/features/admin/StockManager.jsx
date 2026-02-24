import React, { useState, useEffect } from 'react';
import { Button, Input, Loader, Card } from '../../ui';
import api from '../../../services/api';

const StockManager = () => {
    const [stock, setStock] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStock();
    }, []);

    const fetchStock = async () => {
        try {
            const data = await api.getStock();
            setStock(data);
        } catch (error) {
            console.error("Failed to fetch stock", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (id, newQty) => {
        try {
            const updatedItem = await api.updateStock(id, parseFloat(newQty));
            setStock(stock.map(item => item.id === id ? updatedItem : item));
        } catch (error) {
            console.error("Failed to update stock", error);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Raw Material Stock</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stock.map(item => (
                    <Card key={item.id} className={item.quantity <= item.low_stock_threshold ? 'border-red-300 bg-red-50' : ''}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="font-bold text-lg">{item.name}</h4>
                                <p className="text-sm text-gray-500">Unit: {item.unit}</p>
                            </div>
                            {item.quantity <= item.low_stock_threshold && (
                                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-bold">LOW STOCK</span>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleUpdate(item.id, e.target.value)}
                                className="w-24"
                            />
                            <span className="text-gray-600">{item.unit}</span>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default StockManager;
