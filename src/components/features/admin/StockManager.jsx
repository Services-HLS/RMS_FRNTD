import React, { useState, useEffect } from 'react';
import { Button, Input, Loader, Card } from '../../ui';
import api from '../../../services/api';

const StockManager = () => {
    const [stock, setStock] = useState([]);
    const [filteredStock, setFilteredStock] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const [newItem, setNewItem] = useState({
        name: '',
        quantity: 0,
        unit: 'kg',
        low_stock_threshold: 5
    });

    useEffect(() => {
        fetchStock();
    }, []);

    useEffect(() => {
        const filtered = stock.filter(item =>
            (item.name || '').toLowerCase().includes((searchQuery || '').toLowerCase())
        );
        setFilteredStock(filtered);
    }, [searchQuery, stock]);

    const fetchStock = async () => {
        try {
            const data = await api.getStock();
            setStock(data);
            setFilteredStock(data);
        } catch (error) {
            console.error("Failed to fetch stock", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (id, field, value) => {
        // Optimistically update local state
        setStock(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));

        try {
            const numericVal = field === 'name' ? value : (parseFloat(value) || 0);
            await api.updateStock(id, field === 'quantity' ? numericVal : undefined);
        } catch (error) {
            console.error("Failed to update stock", error);
            fetchStock();
        }
    };

    const handleAddItem = async () => {
        if (!newItem.name) {
            alert("Please enter a material name");
            return;
        }
        try {
            const added = await api.addStock({
                ...newItem,
                quantity: parseFloat(newItem.quantity) || 0,
                low_stock_threshold: parseFloat(newItem.low_stock_threshold) || 5
            });
            setStock([...stock, added]);
            setIsAdding(false);
            setNewItem({ name: '', quantity: 0, unit: 'kg', low_stock_threshold: 5 });
        } catch (error) {
            console.error("Failed to add stock", error);
        }
    };

    if (loading) return (
        <div className="h-96 flex items-center justify-center">
            <Loader />
        </div>
    );

    const criticallyLowCount = stock.filter(s => s.quantity <= s.low_stock_threshold).length;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-[8px] border border-neutral-border shadow-premium">
                <div>
                    <h2 className="text-[18px] font-semibold text-primary tracking-tight flex items-center">
                        <span className="bg-primary text-white p-1.5 rounded-[6px] mr-3 shadow-md">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                        </span>
                        Raw Inventory
                    </h2>
                    <p className="text-neutral-muted text-sm font-normal mt-0.5">Manage kitchen supplies and raw material stock levels.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                    <div className="relative group w-full sm:w-auto">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-muted group-focus-within:text-secondary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <Input
                            placeholder="Search materials..."
                            className="pl-11 h-9 !mb-0 border-neutral-border bg-neutral-zebra rounded-[6px] focus:bg-white transition-all font-medium text-sm w-full md:w-56"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={() => setIsAdding(!isAdding)}
                        className={`h-9 px-4 rounded-[6px] text-xs transition-all w-full sm:w-auto ${isAdding ? 'bg-error hover:brightness-90' : 'bg-primary hover:brightness-90'} text-white`}
                    >
                        {isAdding ? 'Cancel' : (
                            <div className="flex items-center justify-center space-x-2">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                                <span>New Material</span>
                            </div>
                        )}
                    </Button>
                </div>
            </div>

            {/* Quick Stats Overlay */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-[8px] border border-neutral-border shadow-premium group transition-all hover:border-primary/20">
                    <p className="text-[10px] font-bold text-neutral-muted uppercase tracking-widest mb-1 group-hover:text-primary">Total Materials</p>
                    <p className="text-xl font-bold text-primary">{stock.length}</p>
                </div>
                <div className="bg-white p-4 rounded-[8px] border border-neutral-border shadow-premium border-l-[4px] border-l-error group transition-all hover:border-error/20">
                    <p className="text-[10px] font-bold text-neutral-muted uppercase tracking-widest mb-1 group-hover:text-error">Critically Low</p>
                    <p className="text-xl font-bold text-error">{criticallyLowCount}</p>
                </div>
            </div>

            {/* Addition Drawer */}
            {isAdding && (
                <Card className="animate-in slide-in-from-top-3 duration-300 border-neutral-border bg-white rounded-[8px] shadow-premium">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                        <div className="md:col-span-2">
                            <label className="block text-[11px] font-medium text-neutral-muted uppercase tracking-wider mb-2 ml-1">Material Name</label>
                            <Input
                                placeholder="e.g. Basmati Rice"
                                className="h-9 !mb-0"
                                value={newItem.name}
                                onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-medium text-neutral-muted uppercase tracking-wider mb-2 ml-1">Unit</label>
                            <select
                                className="w-full h-9 rounded-[6px] font-medium border border-neutral-border bg-white focus:outline-none focus:ring-1 focus:ring-secondary text-sm px-3 appearance-none transition-all cursor-pointer"
                                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '16px' }}
                                value={newItem.unit}
                                onChange={e => setNewItem({ ...newItem, unit: e.target.value })}
                            >
                                <option value="kg">kilogram (kg)</option>
                                <option value="ltr">liter (ltr)</option>
                                <option value="pcs">pieces (pcs)</option>
                                <option value="box">box</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <Button
                                onClick={handleAddItem}
                                className="w-full h-9 bg-secondary hover:brightness-95 text-white font-bold rounded-[6px] shadow-sm transition-all text-xs"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                <span>Register Supply</span>
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Inventory Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredStock.map(item => {
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
                                    <p className="text-[12px] font-medium text-neutral-muted capitalize tracking-wide mb-4">Storage Unit: {item.unit}</p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Quantity Control */}
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-bold text-neutral-muted uppercase tracking-widest pl-0.5">Quantity</p>
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
                                                    className="w-7 h-7 flex-shrink-0 rounded-[4px] bg-white border border-neutral-border shadow-sm hover:bg-neutral hover:text-primary flex items-center justify-center font-bold text-neutral-muted transition-all text-sm mr-1"
                                                    onClick={() => handleUpdate(item.id, 'quantity', (parseFloat(item.quantity) || 0) + 1)}
                                                >+</button>
                                                <span className="text-[10px] font-bold text-neutral-muted/60 lowercase flex-shrink-0 pr-1">{item.unit}</span>
                                            </div>
                                        </div>

                                        {/* Alert Threshold Control */}
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-bold text-neutral-muted uppercase tracking-widest pl-0.5">Alert At</p>
                                            <div className="flex items-center h-[38px]">
                                                <input
                                                    type="number"
                                                    className="w-full h-full bg-neutral-zebra border border-neutral-border font-bold text-center rounded-[6px] text-[13px] outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    value={item.low_stock_threshold === "" ? "" : item.low_stock_threshold}
                                                    onChange={e => handleUpdate(item.id, 'low_stock_threshold', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-neutral-border mt-2">
                                    <div className="flex items-center space-x-3">
                                        <button className="text-[10px] font-bold text-neutral-muted hover:text-primary transition-colors uppercase tracking-wider">History</button>
                                        <span className="text-neutral-border">|</span>
                                        <button className="text-[10px] font-bold text-neutral-muted hover:text-error transition-colors uppercase tracking-wider">Archive</button>
                                    </div>
                                    <span className="text-[10px] font-bold text-neutral-border tracking-tighter self-end">ID: {item.id}</span>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {filteredStock.length === 0 && (
                <div className="bg-white border-2 border-dashed border-neutral-border rounded-[8px] p-20 text-center shadow-premium">
                    <div className="text-4xl mb-4 grayscale opacity-30">🔍</div>
                    <h3 className="text-[16px] font-medium text-primary">No supplies found</h3>
                    <p className="text-neutral-muted mt-2 text-[13px]">Check your spelling or register a new material.</p>
                </div>
            )}
        </div>
    );
};

export default StockManager;
