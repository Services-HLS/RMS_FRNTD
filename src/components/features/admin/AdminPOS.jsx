import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Input, Card, Loader } from '../../ui';
import api from '../../../services/api';

const AdminPOS = () => {
    const [menu, setMenu] = useState([]);
    const [filteredMenu, setFilteredMenu] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [categories, setCategories] = useState(['ALL']);

    const [orderType, setOrderType] = useState('WALK_IN');
    const [tableId, setTableId] = useState('');
    const [activeTableOrder, setActiveTableOrder] = useState(null);
    const [searchParams] = useSearchParams();
    const [paymentMethod, setPaymentMethod] = useState('CASH');

    useEffect(() => {
        const tableParam = searchParams.get('table');
        if (tableParam) {
            setOrderType('DINE_IN');
            setTableId(tableParam);
        }
    }, [searchParams]);

    useEffect(() => {
        fetchMenu();
    }, []);

    useEffect(() => {
        filterMenu();
    }, [searchQuery, selectedCategory, menu]);

    useEffect(() => {
        if (orderType === 'DINE_IN' && tableId) {
            fetchActiveOrderForTable();
        } else {
            setActiveTableOrder(null);
        }
    }, [tableId, orderType]);

    const fetchActiveOrderForTable = async () => {
        try {
            const activeOrders = await api.getOrders();
            const match = activeOrders.find(o =>
                o.table_id == tableId ||
                o.table_id === `TABLE ${tableId}` ||
                o.display_name === tableId
            );
            setActiveTableOrder(match || null);
        } catch (error) {
            console.error("Failed to check active table order", error);
        }
    };

    const fetchMenu = async () => {
        try {
            const data = await api.getMenu();
            setMenu(data);
            const cats = ['ALL', ...new Set(data.map(item => item.category_name || item.category))];
            setCategories(cats);
        } catch (error) {
            console.error("Failed to fetch menu", error);
        } finally {
            setLoading(false);
        }
    };

    const filterMenu = () => {
        let updated = menu;
        if (selectedCategory !== 'ALL') {
            updated = updated.filter(item => (item.category_name || item.category) === selectedCategory);
        }
        if (searchQuery) {
            const lowerQ = searchQuery.toLowerCase();
            updated = updated.filter(item =>
                item.name.toLowerCase().includes(lowerQ) ||
                (item.id && item.id.toString().includes(lowerQ))
            );
        }
        setFilteredMenu(updated);
    };

    const addToCart = (item) => {
        const existing = cart.find(c => c.id === item.id);
        if (existing) {
            setCart(cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
        } else {
            setCart([...cart, { ...item, qty: 1 }]);
        }
    };

    const removeFromCart = (itemId) => {
        setCart(cart.filter(c => c.id !== itemId));
    };

    const updateQty = (itemId, delta) => {
        setCart(cart.map(c => {
            if (c.id === itemId) {
                const newQty = Math.max(1, c.qty + delta);
                return { ...c, qty: newQty };
            }
            return c;
        }));
    };

    const calculateTotal = () => {
        return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    };

    const handlePlaceOrder = async (targetStatus) => {
        if (cart.length === 0) return;
        if (orderType === 'DINE_IN' && !tableId.trim()) {
            alert('Please enter a Table Number for Dine-In orders.');
            return;
        }

        try {
            const orderData = {
                table_id: orderType === 'DINE_IN' ? tableId : null,
                type: orderType,
                items: cart.map(item => ({ id: item.id, qty: item.qty, price: item.price })),
                total_amount: calculateTotal(),
                payment_method: paymentMethod || 'CASH',
                payment_status: 'COMPLETED',
                status: targetStatus,
            };
            await api.createOrder(orderData);
            alert('Order Paid & Sent to Kitchen Display!');

            setCart([]);
            setSearchQuery('');
            setTableId('');
        } catch (error) {
            console.error("Failed to place order", error);
            alert('Failed to place order. Please try again.');
        }
    };

    if (loading) return (
        <div className="h-96 flex items-center justify-center">
            <Loader />
        </div>
    );

    return (
        <div className="flex flex-col lg:flex-row h-full gap-6 animate-in fade-in duration-500 pb-10">
            {/* Left Panel: Menu Selection */}
            <div className="flex-1 flex flex-col min-h-0">
                <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div>
                        <h1 className="text-[20px] font-semibold tracking-tight text-primary">Universal POS</h1>
                        <p className="text-neutral-muted text-[13px] font-normal mt-1 tracking-wide">Direct Counter & Dine-In Sales Management.</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 space-y-4">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-secondary">
                            <svg className="w-5 h-5 text-neutral-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <Input
                            placeholder="Enter Item Name or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 h-10 border-neutral-border bg-white shadow-premium font-medium text-sm rounded-[8px]"
                        />
                    </div>

                    <div className="flex space-x-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar scroll-smooth">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`whitespace-nowrap px-5 py-2 rounded-[6px] text-[13px] font-medium transition-all shadow-sm border ${selectedCategory === cat
                                    ? 'bg-primary text-white border-primary shadow-premium'
                                    : 'bg-white text-neutral-muted border-neutral-border hover:border-primary/30 hover:bg-neutral-zebra'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Menu Grid */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
                        {filteredMenu.map(item => (
                            <Card
                                key={item.id}
                                className="group cursor-pointer !p-0 border border-neutral-border hover:border-secondary transition-all hover:shadow-lg bg-white rounded-[8px] flex flex-col justify-between h-full relative overflow-hidden"
                                onClick={() => addToCart(item)}
                            >
                                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-secondary/10 to-transparent -mr-8 -mt-8 rounded-full opacity-50 transition-transform group-hover:scale-150"></div>

                                <div className="p-4 relative z-10 flex-col flex flex-1">
                                    <div className="mb-3">
                                        <h4 className="text-[13px] font-semibold text-primary leading-tight group-hover:text-secondary transition-colors line-clamp-2">{item.name}</h4>
                                        <div className="flex items-center mt-1.5 space-x-2">
                                            <p className="text-[10px] font-bold tracking-widest text-neutral-muted uppercase">{item.category_name || item.category}</p>
                                            {item.waiting_time_minutes > 0 && (
                                                <div className="text-[9px] bg-warning/10 text-warning font-bold px-1.5 py-0.5 rounded-[4px] border border-warning/10 flex items-center">
                                                    <svg className="w-2.5 h-2.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    {item.waiting_time_minutes}m
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-auto pt-3 flex items-center justify-between border-t border-neutral-border/50">
                                        <span className="font-bold text-[16px] text-primary tracking-tight font-sans">₹{item.price}</span>
                                        <div className="w-8 h-8 rounded-[6px] bg-neutral-zebra flex items-center justify-center text-neutral-muted group-hover:bg-secondary group-hover:text-white transition-all shadow-sm">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                        {filteredMenu.length === 0 && (
                            <div className="col-span-full border-2 border-dashed border-neutral-border rounded-[8px] flex flex-col items-center justify-center p-16 text-center bg-white/50 shadow-premium">
                                <svg className="w-16 h-16 text-neutral-border mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                <h3 className="text-lg font-bold text-primary">No items found</h3>
                                <p className="text-neutral-muted mt-1 cursor-pointer hover:text-secondary transition-colors" onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); }}>Clear filters to see all items</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Panel: Active Cart & Checkout */}
            <div className="w-full lg:w-[400px] bg-white rounded-[8px] shadow-premium p-6 flex flex-col h-full border border-neutral-border relative overflow-hidden flex-shrink-0">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>

                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-[18px] font-bold text-primary flex items-center">
                        <svg className="w-5 h-5 mr-3 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        Current Order
                    </h2>
                    <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-[4px] tracking-widest">LIVE</span>
                </div>

                {/* Order Type Selector */}
                <div className="mb-6">
                    <div className="flex bg-neutral-zebra p-1 rounded-[6px] border border-neutral-border shadow-inner mb-4 h-11 items-center">
                        <button
                            className={`flex-1 h-full flex items-center justify-center text-[13px] font-semibold rounded-[4px] transition-all ${orderType === 'WALK_IN' ? 'bg-white text-primary shadow-sm border border-neutral-border' : 'text-neutral-muted hover:text-primary'}`}
                            onClick={() => { setOrderType('WALK_IN'); setTableId(''); }}
                        >
                            Walk-In
                        </button>
                        <button
                            className={`flex-1 h-full flex items-center justify-center text-[13px] font-semibold rounded-[4px] transition-all ${orderType === 'DINE_IN' ? 'bg-white text-primary shadow-sm border border-neutral-border' : 'text-neutral-muted hover:text-primary'}`}
                            onClick={() => setOrderType('DINE_IN')}
                        >
                            Dine-In
                        </button>
                    </div>

                    {orderType === 'DINE_IN' && (
                        <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                            <Input
                                placeholder="Enter Table Number..."
                                value={tableId}
                                onChange={(e) => setTableId(e.target.value)}
                                className="w-full font-bold border-neutral-border bg-neutral-zebra text-center h-10 rounded-[6px]"
                            />
                            {activeTableOrder && (
                                <div className="mt-3 bg-secondary/5 border border-secondary/10 rounded-[6px] p-3 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-2 h-2 bg-secondary rounded-full animate-pulse mr-2"></div>
                                        <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Running Order Active</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-primary tracking-tight">#{activeTableOrder.id}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto mb-6 pr-1 custom-scrollbar border-t border-neutral-border pt-4">
                    {cart.length === 0 && !activeTableOrder && (
                        <div className="h-full flex flex-col items-center justify-center text-center py-10">
                            <div className="w-16 h-16 bg-neutral-zebra rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-110">
                                <svg className="w-8 h-8 text-neutral-border" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                            </div>
                            <p className="font-semibold text-neutral-muted text-[14px]">Basket is empty.</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        {cart.map(item => (
                            <div key={item.id} className="p-3 border border-neutral-border rounded-[8px] bg-neutral-zebra transition-all relative group shadow-sm hover:shadow-md">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-semibold text-primary text-[13px] leading-tight pr-6">{item.name}</div>
                                    <button onClick={() => removeFromCart(item.id)} className="absolute top-2.5 right-2.5 text-neutral-border hover:text-error transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <div className="text-[12px] font-medium text-neutral-muted">₹{item.price}</div>
                                    <div className="flex items-center bg-white border border-neutral-border rounded-[6px] shadow-inner p-0.5">
                                        <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 flex items-center justify-center font-bold text-neutral-muted hover:text-error hover:bg-neutral-zebra rounded-[4px] transition-all">-</button>
                                        <span className="font-bold w-7 text-center text-primary text-[13px]">{item.qty}</span>
                                        <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 flex items-center justify-center font-bold text-neutral-muted hover:text-secondary hover:bg-neutral-zebra rounded-[4px] transition-all">+</button>
                                    </div>
                                    <div className="font-bold text-primary text-[14px]">₹{item.price * item.qty}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border-t border-neutral-border pt-6 space-y-5">
                    {/* Totals Section */}
                    <div className="bg-neutral-zebra p-4 rounded-[8px] border border-neutral-border shadow-inner">
                        <div className="flex justify-between items-center text-[12px] font-medium text-neutral-muted mb-3">
                            <span>Subtotal</span>
                            <span>₹{calculateTotal()}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-neutral-border/50 pt-3">
                            <span className="text-[15px] font-semibold text-primary">Order Total</span>
                            <span className="text-[24px] font-bold text-secondary tracking-tight">₹{calculateTotal()}</span>
                        </div>
                    </div>

                    {/* Payment Method Selector */}
                    <div className="flex space-x-2">
                        <button
                            className={`flex-1 py-2 text-[12px] font-bold rounded-[6px] border transition-all ${paymentMethod === 'CASH' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-neutral-muted border-neutral-border hover:bg-neutral-zebra'}`}
                            onClick={() => setPaymentMethod('CASH')}
                        >
                            💵 Cash
                        </button>
                        <button
                            className={`flex-1 py-2 text-[12px] font-bold rounded-[6px] border transition-all ${paymentMethod === 'ONLINE' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-neutral-muted border-neutral-border hover:bg-neutral-zebra'}`}
                            onClick={() => setPaymentMethod('ONLINE')}
                        >
                            📱 Online
                        </button>
                        <button
                            className={`flex-1 py-2 text-[12px] font-bold rounded-[6px] border transition-all ${paymentMethod === 'QR_SCAN' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-white text-neutral-muted border-neutral-border hover:bg-neutral-zebra'}`}
                            onClick={() => setPaymentMethod('QR_SCAN')}
                        >
                            💳 QR
                        </button>
                    </div>

                    <Button
                        className="w-full h-12 bg-secondary hover:brightness-95 text-white font-bold rounded-[8px] shadow-lg shadow-secondary/20 uppercase tracking-widest text-[13px] transition-all flex items-center justify-center space-x-3 disabled:opacity-40 disabled:cursor-not-allowed group"
                        onClick={() => handlePlaceOrder('ORDERED')}
                        disabled={cart.length === 0}
                    >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        <span>Mark Paid & Send to Kitchen</span>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AdminPOS;
