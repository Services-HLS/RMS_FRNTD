import React, { useState, useEffect } from 'react';
import { Button, Input, Loader, Card } from '../../ui';
import api from '../../../services/api';

const MenuInventoryManager = () => {
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState({
        name: '',
        price: '',
        category: '',
        quantity: 0,
        low_stock_threshold: 5,
        waiting_time_minutes: 0,
    });

    useEffect(() => {
        fetchMenu();
    }, []);

    const fetchMenu = async () => {
        try {
            const data = await api.getMenu();
            setMenu(data);
        } catch (error) {
            console.error("Failed to fetch menu", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (id, field, value) => {
        try {
            const updates = { [field]: value };
            if (['quantity', 'price', 'waiting_time_minutes'].includes(field)) {
                updates[field] = parseFloat(value);
            }

            const updatedItem = await api.updateMenuItem(id, updates);
            setMenu(menu.map(item => item.id === id ? updatedItem : item));
        } catch (error) {
            console.error("Failed to update menu item", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        try {
            await api.deleteMenuItem(id);
            setMenu(menu.filter(item => item.id !== id));
        } catch (error) {
            console.error("Failed to delete item", error);
        }
    };

    const handleAddItem = async () => {
        if (!newItem.name || !newItem.price) return;
        try {
            const added = await api.addMenuItem({
                ...newItem,
                waiting_time_minutes: parseInt(newItem.waiting_time_minutes) || 0,
            });
            setMenu([...menu, added]);
            setIsAdding(false);
            setNewItem({ name: '', price: '', category: '', quantity: 0, low_stock_threshold: 5, waiting_time_minutes: 0 });
        } catch (error) {
            console.error("Failed to add item", error);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Menu Inventory</h2>
                <Button onClick={() => setIsAdding(!isAdding)}>{isAdding ? 'Cancel' : 'Add New Item'}</Button>
            </div>

            {isAdding && (
                <Card className="bg-blue-50 border-blue-200">
                    <h3 className="font-bold mb-4">Add New Menu Item</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-bold mb-1">Name</label>
                            <Input value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} placeholder="Item Name" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-1">Category</label>
                            <Input value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} placeholder="e.g. Starter" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-1">Price (₹)</label>
                            <Input type="number" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} placeholder="0.00" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-1">Initial Qty</label>
                            <Input type="number" value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: e.target.value })} placeholder="0" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-1">Wait Time (mins)</label>
                            <Input
                                type="number"
                                min="0"
                                value={newItem.waiting_time_minutes}
                                onChange={e => setNewItem({ ...newItem, waiting_time_minutes: e.target.value })}
                                placeholder="0"
                            />
                        </div>
                        <div className="flex items-end">
                            <Button onClick={handleAddItem} className="w-full">Save Item</Button>
                        </div>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 gap-6">
                {menu.map(item => (
                    <Card key={item.id} className={item.quantity <= item.low_stock_threshold ? 'border-red-300 bg-red-50' : ''}>
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex-1">
                                <h4 className="font-bold text-lg">{item.name}</h4>
                                <p className="text-sm text-gray-500">{item.category_name || item.category} • ₹{item.price}</p>
                            </div>

                            <div className="flex flex-wrap items-center gap-6">
                                {/* Available Qty */}
                                <div className="text-center">
                                    <label className="block text-xs text-gray-500 mb-1">Available Qty</label>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 font-bold"
                                            onClick={() => handleUpdate(item.id, 'quantity', Math.max(0, item.quantity - 1))}
                                        >-</button>
                                        <span className="font-bold text-xl w-8 text-center">{item.quantity}</span>
                                        <button
                                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 font-bold"
                                            onClick={() => handleUpdate(item.id, 'quantity', item.quantity + 1)}
                                        >+</button>
                                    </div>
                                </div>

                                {/* Alert Limit */}
                                <div className="text-center">
                                    <label className="block text-xs text-gray-500 mb-1">Alert Limit</label>
                                    <Input
                                        type="number"
                                        className="w-16 text-center"
                                        value={item.low_stock_threshold}
                                        onChange={(e) => handleUpdate(item.id, 'low_stock_threshold', e.target.value)}
                                    />
                                </div>

                                {/* Wait Time */}
                                <div className="text-center">
                                    <label className="block text-xs text-gray-500 mb-1">Wait Time (mins)</label>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            className="w-8 h-8 rounded-full bg-orange-100 hover:bg-orange-200 font-bold text-orange-700"
                                            onClick={() => handleUpdate(item.id, 'waiting_time_minutes', Math.max(0, (item.waiting_time_minutes || 0) - 1))}
                                        >-</button>
                                        <span className="font-bold text-xl w-8 text-center text-orange-700">{item.waiting_time_minutes || 0}</span>
                                        <button
                                            className="w-8 h-8 rounded-full bg-orange-100 hover:bg-orange-200 font-bold text-orange-700"
                                            onClick={() => handleUpdate(item.id, 'waiting_time_minutes', (item.waiting_time_minutes || 0) + 1)}
                                        >+</button>
                                    </div>
                                </div>

                                <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => handleDelete(item.id)}>
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default MenuInventoryManager;
