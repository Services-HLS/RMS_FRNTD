import React, { useState, useEffect } from 'react';
import { Button, Input, Loader, Card } from '../../ui';
import api from '../../../services/api';
import { customConfirm } from '../../../utils/Alert';

const MenuInventoryManager = () => {
    const [menu, setMenu] = useState([]);
    const [filteredMenu, setFilteredMenu] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const [newItem, setNewItem] = useState({
        name: '',
        price: '',
        category: '',
        category_id: '',
        description: '',
        quantity: 0,
        low_stock_threshold: 5,
        waiting_time_minutes: 0,
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        const filtered = menu.filter(item =>
            (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.category_name || item.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredMenu(filtered);
    }, [searchQuery, menu]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const menuData = await api.getMenu().catch(err => {
                console.error("Menu fetch failed", err);
                return [];
            });
            const catData = await api.getCategories().catch(err => {
                console.error("Category fetch failed", err);
                return [];
            });

            setMenu(menuData);

            // If no categories in DB, show some defaults
            if (catData && catData.length > 0) {
                setCategories(catData);
            } else {
                setCategories([
                    { id: 'suggested-1', name: 'Main Course' },
                    { id: 'suggested-2', name: 'Starters' },
                    { id: 'suggested-3', name: 'Drinks' },
                    { id: 'suggested-4', name: 'Desserts' }
                ]);
            }

            setFilteredMenu(menuData);
        } catch (error) {
            console.error("Failed to fetch initial data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (id, field, value) => {
        // Optimistic update - update state instantly for responsiveness
        setMenu(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));

        try {
            const isNumeric = ['quantity', 'price', 'low_stock_threshold', 'waiting_time_minutes'].includes(field);
            const val = isNumeric ? (parseFloat(value) || 0) : value;

            await api.updateMenuItem(id, { [field]: val });
        } catch (error) {
            console.error("Failed to update menu item", error);
            // On failure, re-fetch to get correct server state
            const data = await api.getMenu();
            setMenu(data);
        }
    };

    const handleDelete = async (id) => {
        if (!(await customConfirm("Are you sure you want to delete this item?"))) return;
        try {
            await api.deleteMenuItem(id);
            setMenu(menu.filter(item => item.id !== id));
        } catch (error) {
            console.error("Failed to delete item", error);
        }
    };

    const handleAddItem = async () => {
        if (!newItem.name || !newItem.price || (!newItem.category_id && !newItem.category)) {
            alert("Please fill in Name, Price, and Category");
            return;
        }
        try {
            const payload = { ...newItem };
            // If it's a suggested category, clear the dummy ID so backend creates/finds it by name
            if (typeof payload.category_id === 'string' && payload.category_id.startsWith('suggested-')) {
                delete payload.category_id;
            }

            const added = await api.addMenuItem({
                ...payload,
                price: parseFloat(newItem.price) || 0,
                quantity: parseInt(newItem.quantity) || 0,
                waiting_time_minutes: parseInt(newItem.waiting_time_minutes) || 0,
            });
            setMenu([...menu, added]);
            setIsAdding(false);
            setNewItem({
                name: '', price: '', category: '', category_id: '',
                description: '', quantity: 0, low_stock_threshold: 5,
                waiting_time_minutes: 0
            });
            // Refresh categories in case a new one was created
            const catData = await api.getCategories();
            if (catData && catData.length > 0) setCategories(catData);
        } catch (error) {
            console.error("Failed to add item", error);
        }
    };

    if (loading) return (
        <div className="h-96 flex items-center justify-center">
            <Loader />
        </div>
    );

    const criticallyLow = menu.filter(item => item.quantity <= item.low_stock_threshold).length;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-[8px] border border-neutral-border shadow-premium">
                <div>
                    <h2 className="text-[18px] font-semibold text-primary tracking-tight flex items-center">
                        <span className="bg-primary text-white p-1.5 rounded-[6px] mr-3 shadow-md">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        </span>
                        Menu Inventory
                    </h2>
                    <p className="text-neutral-muted text-sm font-normal mt-0.5">Manage your restaurant dish availability and details.</p>
                </div>

                <div className="flex items-center space-x-3">
                    <div className="relative group">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-muted group-focus-within:text-secondary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <Input
                            placeholder="Search dishes..."
                            className="pl-11 h-9 !mb-0 border-neutral-border bg-neutral-zebra rounded-[6px] focus:bg-white transition-all font-medium text-sm w-56"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={() => setIsAdding(!isAdding)}
                        className={`h-9 px-4 rounded-[6px] text-xs transition-all ${isAdding ? 'bg-error hover:brightness-90' : 'bg-primary hover:brightness-90'} text-white`}
                    >
                        {isAdding ? 'Cancel' : (
                            <div className="flex items-center space-x-2">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                                <span>New Dish</span>
                            </div>
                        )}
                    </Button>
                </div>
            </div>

            {/* Quick Stats Overlay */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-[8px] border border-neutral-border shadow-premium group transition-all hover:border-primary/20">
                    <p className="text-[10px] font-bold text-neutral-muted uppercase tracking-widest mb-1 group-hover:text-primary">Menu Items</p>
                    <p className="text-xl font-bold text-primary">{menu.length}</p>
                </div>
                <div className="bg-white p-4 rounded-[8px] border border-neutral-border shadow-premium border-l-[4px] border-l-error group transition-all hover:border-error/20">
                    <p className="text-[10px] font-bold text-neutral-muted uppercase tracking-widest mb-1 group-hover:text-error">Low Inventory</p>
                    <p className="text-xl font-bold text-error">{criticallyLow}</p>
                </div>
            </div>

            {/* Addition Drawer */}
            {isAdding && (
                <Card className="animate-in slide-in-from-top-3 duration-300 border-neutral-border bg-white rounded-[8px] shadow-premium">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                        <div className="md:col-span-4">
                            <label className="block text-[11px] font-medium text-neutral-muted uppercase tracking-wider mb-2 ml-1">Dish Name</label>
                            <Input
                                placeholder="e.g. Chicken Biryani"
                                className="h-9 !mb-0"
                                value={newItem.name}
                                onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-[11px] font-medium text-neutral-muted uppercase tracking-wider mb-2 ml-1">Category</label>
                            <select
                                className="w-full h-9 rounded-[6px] font-medium border border-neutral-border bg-white focus:outline-none focus:ring-1 focus:ring-secondary text-sm px-3 appearance-none transition-all cursor-pointer"
                                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '16px' }}
                                value={newItem.category_id}
                                onChange={e => {
                                    const val = e.target.value;
                                    if (val === 'new') {
                                        setNewItem({ ...newItem, category_id: '', category: '' });
                                    } else {
                                        setNewItem({ ...newItem, category_id: val, category: categories.find(c => c.id == val)?.name || '' });
                                    }
                                }}
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                                <option value="new" className="font-bold border-t">+ Add New Category</option>
                            </select>
                            {(!newItem.category_id || newItem.category_id === '') && (
                                <Input
                                    placeholder="Enter new category name..."
                                    className="h-9 !mb-0 mt-2 animate-in slide-in-from-top-2"
                                    value={newItem.category}
                                    onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                />
                            )}
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-[11px] font-medium text-neutral-muted uppercase tracking-wider mb-2 ml-1">Price (₹)</label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                className="h-9 !mb-0"
                                value={newItem.price}
                                onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-[11px] font-medium text-neutral-muted uppercase tracking-wider mb-2 ml-1">Stock Left</label>
                            <Input
                                type="number"
                                placeholder="0"
                                className="h-9 !mb-0"
                                value={newItem.quantity}
                                onChange={e => setNewItem({ ...newItem, quantity: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-9">
                            <label className="block text-[11px] font-medium text-neutral-muted uppercase tracking-wider mb-2 ml-1">Description</label>
                            <textarea
                                placeholder="Write a short description of the dish..."
                                className="w-full h-16 p-3 rounded-[6px] font-normal border border-neutral-border bg-white focus:outline-none focus:ring-1 focus:ring-secondary text-sm resize-none transition-all placeholder:text-neutral-muted"
                                value={newItem.description}
                                onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-3 flex items-end">
                            <Button
                                onClick={handleAddItem}
                                className="w-full h-9 bg-secondary hover:brightness-95 text-white font-bold rounded-[6px] shadow-sm transition-all text-[11px]"
                            >
                                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                <span>Register Dish</span>
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredMenu.map(item => {
                    const isLow = item.quantity <= item.low_stock_threshold;
                    return (
                        <Card
                            key={item.id}
                            className={`group relative !p-0 border border-neutral-border rounded-[8px] bg-white transition-all hover:shadow-lg flex flex-col h-full ${isLow ? 'border-error/20' : ''}`}
                        >
                            <div className={`absolute top-0 left-0 w-1.5 h-full ${isLow ? 'bg-error' : 'bg-primary/10'} z-10 transition-colors group-hover:bg-secondary/40`}></div>

                            <div className="p-5 flex flex-col justify-between h-full gap-4 relative">
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1 group-hover:translate-x-1 transition-transform">
                                        <h4 className="text-sm font-semibold text-primary line-clamp-1">{item.name}</h4>
                                        {isLow && (
                                            <span className="bg-error/10 text-error text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[4px] border border-error/20">
                                                Low
                                            </span>
                                        )}
                                    </div>
                                    <div className="mb-3">
                                        <p className="text-[12px] font-medium text-neutral-muted capitalize tracking-wide">
                                            {item.category_name || item.category} <span className="mx-1.5 text-neutral-border">|</span> <span className="text-secondary font-bold">₹{item.price}</span>
                                        </p>
                                    </div>

                                    {/* Description (Editable) */}
                                    <div className="mb-4">
                                        <textarea
                                            className="w-full text-[12px] font-normal text-neutral-text bg-neutral-zebra p-2 rounded-[6px] border border-transparent hover:border-neutral-border focus:bg-white focus:border-secondary focus:ring-1 focus:ring-secondary/20 outline-none transition-all resize-none h-14"
                                            value={item.description || ''}
                                            placeholder="No description set..."
                                            onChange={(e) => handleUpdate(item.id, 'description', e.target.value)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-auto">
                                        {/* Quantity Control */}
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-bold text-neutral-muted uppercase tracking-widest pl-0.5">Stock Left</p>
                                            <div className="flex items-center bg-neutral-zebra p-1 rounded-[6px] border border-neutral-border shadow-inner">
                                                <button
                                                    className="w-7 h-7 flex-shrink-0 rounded-[4px] bg-white border border-neutral-border shadow-sm hover:bg-neutral hover:text-primary flex items-center justify-center font-bold text-neutral-muted transition-all text-sm"
                                                    onClick={() => handleUpdate(item.id, 'quantity', Math.max(0, (parseFloat(item.quantity) || 0) - 1))}
                                                >-</button>
                                                <input
                                                    type="number"
                                                    value={item.quantity === "" ? "" : item.quantity}
                                                    onChange={(e) => handleUpdate(item.id, 'quantity', e.target.value)}
                                                    className={`flex-1 min-w-0 bg-transparent text-center font-bold outline-none text-[13px] px-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isLow ? 'text-error' : 'text-primary'}`}
                                                />
                                                <button
                                                    className="w-7 h-7 flex-shrink-0 rounded-[4px] bg-white border border-neutral-border shadow-sm hover:bg-neutral hover:text-primary flex items-center justify-center font-bold text-neutral-muted transition-all text-sm"
                                                    onClick={() => handleUpdate(item.id, 'quantity', (parseFloat(item.quantity) || 0) + 1)}
                                                >+</button>
                                            </div>
                                        </div>

                                        {/* Wait Time Control */}
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-bold text-neutral-muted uppercase tracking-widest pl-0.5">Prep (min)</p>
                                            <div className="flex items-center bg-secondary/5 p-1 rounded-[6px] border border-secondary/10 shadow-inner">
                                                <button
                                                    className="w-7 h-7 flex-shrink-0 rounded-[4px] bg-white border border-secondary/20 shadow-sm hover:bg-secondary hover:text-white flex items-center justify-center font-bold text-secondary transition-all text-sm"
                                                    onClick={() => handleUpdate(item.id, 'waiting_time_minutes', Math.max(0, (parseFloat(item.waiting_time_minutes) || 0) - 1))}
                                                >-</button>
                                                <input
                                                    type="number"
                                                    value={item.waiting_time_minutes === "" ? "" : (item.waiting_time_minutes || 0)}
                                                    onChange={(e) => handleUpdate(item.id, 'waiting_time_minutes', e.target.value)}
                                                    className="flex-1 min-w-0 bg-transparent text-center font-bold outline-none text-[13px] text-secondary px-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                />
                                                <button
                                                    className="w-7 h-7 flex-shrink-0 rounded-[4px] bg-white border border-secondary/20 shadow-sm hover:bg-secondary hover:text-white flex items-center justify-center font-bold text-secondary transition-all text-sm"
                                                    onClick={() => handleUpdate(item.id, 'waiting_time_minutes', (parseFloat(item.waiting_time_minutes) || 0) + 1)}
                                                >+</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-neutral-border mt-2">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-bold text-neutral-muted uppercase leading-tight tracking-wider">Alert At</span>
                                            <input
                                                type="number"
                                                className="w-12 h-6 bg-neutral-zebra border border-neutral-border rounded-[4px] font-bold text-[11px] text-neutral-muted text-center outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all"
                                                value={item.low_stock_threshold === "" ? "" : item.low_stock_threshold}
                                                onChange={(e) => handleUpdate(item.id, 'low_stock_threshold', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        className="text-neutral-border hover:text-error font-bold text-[11px] p-0 h-auto flex items-center transition-all bg-transparent border-none px-2 py-1"
                                        onClick={() => handleDelete(item.id)}
                                    >
                                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {filteredMenu.length === 0 && (
                <div className="bg-white border-2 border-dashed border-neutral-border rounded-[8px] p-20 text-center shadow-premium">
                    <div className="text-4xl mb-4 grayscale opacity-30">🔍</div>
                    <h3 className="text-[16px] font-medium text-primary">No dishes found</h3>
                    <p className="text-neutral-muted mt-2 text-[13px]">Explore other categories or adjust your search.</p>
                </div>
            )}
        </div>
    );
};

export default MenuInventoryManager;
