import React, { useState, useEffect } from 'react';
import { Card, Loader, Button } from '../../ui';
import api from '../../../services/api';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Sub-page routing state
    const [selectedOrder, setSelectedOrder] = useState(null);

    const getStatusConfig = (status) => {
        switch (status) {
            case 'COMPLETED': return { badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', bar: 'bg-emerald-500' };
            case 'READY': return { badge: 'bg-blue-50 text-blue-700 border-blue-100', bar: 'bg-blue-500' };
            case 'PREPARING': return { badge: 'bg-amber-50 text-amber-700 border-amber-100', bar: 'bg-amber-500' };
            case 'ORDERED': return { badge: 'bg-rose-50 text-rose-700 border-rose-100', bar: 'bg-rose-400' };
            case 'CANCELLED': return { badge: 'bg-red-50 text-red-700 border-red-100', bar: 'bg-red-500' };
            default: return { badge: 'bg-slate-50 text-slate-700 border-slate-200', bar: 'bg-slate-300' };
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [filterDate, statusFilter]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const allOrders = await api.getAllOrders();
            const filtered = allOrders.filter(o => {
                // Date Filtering
                const datePart = o.created_at ? o.created_at.split('T')[0] : '';
                const dateMatch = !filterDate || datePart === filterDate;

                // Status Filtering
                let statusMatch = true;
                if (statusFilter === 'PENDING') {
                    statusMatch = o.status === 'ORDERED' || o.status === 'PREPARING';
                } else if (statusFilter === 'READY') {
                    statusMatch = o.status === 'READY';
                } else if (statusFilter === 'COMPLETED') {
                    statusMatch = o.status === 'COMPLETED';
                } else if (statusFilter === 'CANCELLED') {
                    statusMatch = o.status === 'CANCELLED';
                }

                return dateMatch && statusMatch;
            });
            setOrders(filtered);

            // If viewing a detailed order, aggressively update its state
            if (selectedOrder) {
                const updatedTarget = filtered.find(o => o.id === selectedOrder.id);
                if (updatedTarget) setSelectedOrder(updatedTarget);
            }
        } catch (error) {
            console.error("Failed to fetch order history", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteOrder = async (method) => {
        if (!selectedOrder) return;
        try {
            await api.processPayment(selectedOrder.id, method);
            alert(`Order #${selectedOrder.id} successfully Paid via ${method}!`);
            await fetchHistory(); // Trigger a refetch which will update selectedOrder
        } catch (error) {
            console.error("Failed to process payment", error);
            alert("Failed to process the payment.");
        }
    };

    const handleCancelOrder = async () => {
        if (!window.confirm("Are you sure you want to CANCEL this order? This will revert inventory stock.")) return;
        try {
            await api.cancelOrder(selectedOrder.id);
            alert("Order Cancelled successfully.");
            await fetchHistory();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to cancel order.");
        }
    };

    const handleDeleteOrder = async () => {
        if (!window.confirm("Permanently DELETE this order history? This cannot be undone.")) return;
        try {
            await api.deleteOrder(selectedOrder.id);
            alert("Order deleted permanently.");
            setSelectedOrder(null);
            await fetchHistory();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to delete order.");
        }
    };

    // ITEM EDITING LOGIC
    const [isEditingItems, setIsEditingItems] = useState(false);
    const [editingItems, setEditingItems] = useState([]);
    const [menuItems, setMenuItems] = useState([]);

    const startEditing = async () => {
        try {
            const menu = await api.getMenu();
            setMenuItems(menu);
            setEditingItems([...(selectedOrder.items || [])]);
            setIsEditingItems(true);
        } catch (err) {
            alert("Failed to load menu for editing");
        }
    };

    const updateItemQty = (id, delta) => {
        setEditingItems(prev => prev.map(item => {
            if ((item.id || item.menu_item_id) === id) {
                const newQty = Math.max(0, (item.qty || item.quantity) + delta);
                return { ...item, qty: newQty, quantity: newQty };
            }
            return item;
        }).filter(item => (item.qty || item.quantity) > 0));
    };

    const addItemToOrder = (menuItem) => {
        setEditingItems(prev => {
            const exists = prev.find(i => (i.id || i.menu_item_id) === menuItem.id);
            if (exists) {
                return prev.map(i => (i.id || i.menu_item_id) === menuItem.id ? { ...i, qty: (i.qty || i.quantity) + 1, quantity: (i.qty || i.quantity) + 1 } : i);
            }
            return [...prev, { ...menuItem, menu_item_id: menuItem.id, qty: 1, quantity: 1, price_at_order: menuItem.price }];
        });
    };

    const saveOrderItems = async () => {
        const total = editingItems.reduce((acc, i) => acc + (i.qty || i.quantity) * (i.price_at_order || i.price), 0);
        try {
            await api.updateOrderItems(selectedOrder.id, editingItems, total);
            alert("Order items updated successfully!");
            setIsEditingItems(false);
            await fetchHistory();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update items");
        }
    };

    if (loading && orders.length === 0) return <Loader />;

    // ─────────────────────────────────────────────────────────────────
    // DETAILED ORDER PAGE VIEW
    // ─────────────────────────────────────────────────────────────────
    if (selectedOrder) {
        const isClosed = selectedOrder.status === 'COMPLETED';
        const isCancelled = selectedOrder.status === 'CANCELLED';
        const isPreparing = selectedOrder.status === 'PREPARING';
        const isReady = selectedOrder.status === 'READY';
        const canEdit = selectedOrder.status === 'ORDERED';

        return (
            <div className="animate-in slide-in-from-right-8 duration-500 pb-12">
                {/* Editing Modal Overlay */}
                {isEditingItems && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <Card className="max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col !p-0 border-0 shadow-2xl">
                            <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">Edit Order Items</h2>
                                    <p className="text-sm text-slate-500">Add or remove items before preparation starts</p>
                                </div>
                                <button onClick={() => setIsEditingItems(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">✕</button>
                            </div>

                            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                                {/* Current Items */}
                                <div className="w-full md:w-1/2 p-6 overflow-y-auto border-r border-slate-100">
                                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Current Selection</h3>
                                    <div className="space-y-3">
                                        {editingItems.map(item => (
                                            <div key={item.id || item.menu_item_id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                <div className="flex-1">
                                                    <p className="font-bold text-slate-800">{item.name}</p>
                                                    <p className="text-xs text-slate-500">₹{item.price_at_order || item.price}</p>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <button onClick={() => updateItemQty(item.id || item.menu_item_id, -1)} className="w-7 h-7 bg-white rounded-full border shadow-sm flex items-center justify-center font-bold text-slate-500 hover:bg-slate-50">-</button>
                                                    <span className="font-black text-slate-800">{item.qty || item.quantity}</span>
                                                    <button onClick={() => updateItemQty(item.id || item.menu_item_id, 1)} className="w-7 h-7 bg-white rounded-full border shadow-sm flex items-center justify-center font-bold text-slate-500 hover:bg-slate-50">+</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                                        <span className="text-slate-500 font-bold">New Subtotal:</span>
                                        <span className="text-xl font-black text-slate-900">₹{editingItems.reduce((acc, i) => acc + (i.qty || i.quantity) * (i.price_at_order || i.price), 0).toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Menu Selection */}
                                <div className="w-full md:w-1/2 p-6 bg-slate-50/50 overflow-y-auto">
                                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Add from Menu</h3>
                                    <div className="grid grid-cols-1 gap-2">
                                        {menuItems.map(item => (
                                            <button
                                                key={item.id}
                                                onClick={() => addItemToOrder(item)}
                                                className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all text-left"
                                            >
                                                <span className="font-bold text-slate-700">{item.name}</span>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-xs font-bold text-slate-400">₹{item.price}</span>
                                                    <span className="text-blue-500 font-bold text-lg">+</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-white border-t border-slate-200 flex justify-end space-x-4">
                                <Button variant="outline" onClick={() => setIsEditingItems(false)}>Cancel Changes</Button>
                                <Button onClick={saveOrderItems} style={{ backgroundColor: '#2F2F2F', color: 'white' }}>Update Order ₹{editingItems.reduce((acc, i) => acc + (i.qty || i.quantity) * (i.price_at_order || i.price), 0)}</Button>
                            </div>
                        </Card>
                    </div>
                )}

                <button
                    onClick={() => setSelectedOrder(null)}
                    className="flex items-center text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors mb-6 group"
                >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to History
                </button>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <div className="flex items-center space-x-3 mb-1">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Order #{selectedOrder.id}</h1>
                            {isClosed ? (
                                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-md border border-emerald-200">Completed</span>
                            ) : isCancelled ? (
                                <span className="bg-red-100 text-red-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-md border border-red-200">Cancelled</span>
                            ) : (
                                <span className="bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-md border border-amber-200">Active / {selectedOrder.status}</span>
                            )}
                        </div>
                        <p className="text-slate-500 font-medium">Placed on {new Date(selectedOrder.created_at).toLocaleString()}</p>
                    </div>

                    <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200 text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Bill</p>
                        <p className="text-3xl font-black text-slate-900 tracking-tight">₹{selectedOrder.total_amount}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Items List */}
                    <Card className="lg:col-span-2 !p-0 border border-slate-200 shadow-lg shadow-slate-100/50 rounded-2xl overflow-hidden">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                Ordered Items
                            </h2>
                            <div className="flex items-center space-x-2">
                                {canEdit && (
                                    <button
                                        onClick={startEditing}
                                        className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 hover:bg-blue-100 transition-colors"
                                    >
                                        Edit Items ✏️
                                    </button>
                                )}
                                <span className="text-sm font-bold text-slate-400">{selectedOrder.items?.length || 0} items</span>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                selectedOrder.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-6 bg-white hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                                                {item.qty || item.quantity}x
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{item.name}</p>
                                                <p className="text-sm text-slate-500 font-medium">₹{item.price_at_order || item.price} each</p>
                                            </div>
                                        </div>
                                        <p className="font-black text-slate-900">₹{((item.qty || item.quantity || 0) * (item.price_at_order || item.price || 0)).toFixed(2)}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-slate-400 font-medium">No items logged.</div>
                            )}
                        </div>
                    </Card>

                    {/* Meta & Actions */}
                    <div className="space-y-6">
                        <Card className="border border-slate-200 shadow-lg shadow-slate-100/50 rounded-2xl p-6 bg-white">
                            <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-widest">Order Details</h3>
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between border-b border-slate-100 pb-3">
                                    <span className="text-slate-500 font-medium">Order Status</span>
                                    <span className={`font-bold uppercase tracking-wider ${isCancelled ? 'text-red-500' : 'text-slate-900'}`}>{selectedOrder.status}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-100 pb-3">
                                    <span className="text-slate-500 font-medium">Order Type</span>
                                    <span className="font-bold text-slate-900">{selectedOrder.type === 'DINE_IN' ? 'Dine-In' : 'QSR / Walk-In'}</span>
                                </div>
                                {selectedOrder.type === 'DINE_IN' && (
                                    <div className="flex justify-between border-b border-slate-100 pb-3">
                                        <span className="text-slate-500 font-medium">Table Number</span>
                                        <span className="font-bold text-slate-900">{selectedOrder.table_id || 'N/A'}</span>
                                    </div>
                                )}
                                <div className="flex justify-between border-b border-slate-100 pb-3">
                                    <span className="text-slate-500 font-medium">Payment Status</span>
                                    <span className={`font-bold ${selectedOrder.payment_status === 'COMPLETED' ? 'text-emerald-600' : isCancelled || selectedOrder.payment_status === 'FAILED' ? 'text-red-500' : 'text-amber-500'}`}>
                                        {selectedOrder.payment_status || (isCancelled ? 'FAILED' : 'PENDING')}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 font-medium">Tender Method</span>
                                    <span className="font-bold text-slate-900">{isCancelled ? 'N/A' : (selectedOrder.payment_method || 'Unpaid')}</span>
                                </div>
                            </div>
                        </Card>

                        {/* Order Management Actions */}
                        {!isClosed && !isCancelled && (
                            <div className="space-y-3">
                                {canEdit ? (
                                    <>
                                        <button
                                            onClick={handleCancelOrder}
                                            className="w-full flex items-center justify-center p-4 bg-red-50 rounded-xl border border-red-100 hover:bg-red-100 transition-all group"
                                        >
                                            <span className="font-bold text-red-700 tracking-wide uppercase">Cancel Order 🚫</span>
                                        </button>
                                    </>
                                ) : (
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Actions Locked</p>
                                        <p className="text-xs text-slate-500 font-medium italic">Order is in {selectedOrder.status.toLowerCase()} phase.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Process Payment Widget */}
                        {selectedOrder.payment_status !== 'COMPLETED' && !isCancelled && !isClosed && (
                            <Card className="border-0 ring-1 ring-blue-100 shadow-xl shadow-blue-100/50 rounded-2xl p-0 overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50/30">
                                <div className="p-6">
                                    <h3 className="font-black text-blue-900 mb-2">Process Payment</h3>
                                    <p className="text-sm text-blue-700/80 font-medium mb-6">Select the tender method to finalize the payment and send order to kitchen.</p>

                                    <div className="space-y-3">
                                        <button
                                            onClick={() => handleCompleteOrder('CASH')}
                                            className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all group"
                                        >
                                            <span className="font-bold tracking-wide text-slate-700 group-hover:text-blue-700">Cash Settlement</span>
                                            <span className="text-xl">💵</span>
                                        </button>
                                        <button
                                            onClick={() => handleCompleteOrder('ONLINE')}
                                            className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all group"
                                        >
                                            <span className="font-bold tracking-wide text-slate-700 group-hover:text-blue-700">Digital / Card / UPI</span>
                                            <span className="text-xl">📱</span>
                                        </button>
                                        <button
                                            onClick={() => handleCompleteOrder('QR_SCAN')}
                                            className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all group"
                                        >
                                            <span className="font-bold tracking-wide text-slate-700 group-hover:text-blue-700">QR Scan / App</span>
                                            <span className="text-xl">💳</span>
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        )}

                        <button
                            onClick={() => {
                                alert(`Receipt / KOT sent to Printer for Order #${selectedOrder.id}`);
                            }}
                            className="w-full flex items-center justify-center p-4 bg-orange-50 rounded-xl border border-orange-200 hover:bg-orange-100 transition-all shadow-sm"
                        >
                            <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            <span className="font-bold text-orange-700 tracking-wide uppercase">Print KOT / Receipt</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────
    // MAIN HISTORY LIST VIEW
    // ─────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-8">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-2">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Order History</h1>
                    <p className="text-slate-500 font-medium tracking-wide mt-1">Review operational receipts and finalize pending transactions</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {/* Status Tabs */}
                    <div className="flex bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        {[
                            { label: 'All', value: 'ALL' },
                            { label: 'Started', value: 'PENDING' },
                            { label: 'Ready', value: 'READY' },
                            { label: 'Finished', value: 'COMPLETED' }
                        ].map((btn) => (
                            <button
                                key={btn.value}
                                onClick={() => setStatusFilter(btn.value)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${statusFilter === btn.value
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                                    }`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>

                    {/* Date Picker */}
                    <div className="flex items-center space-x-2 bg-white rounded-xl p-1.5 border border-slate-200 shadow-sm">
                        <span className="pl-3 pr-1 text-sm font-bold text-slate-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 00-2 2z" /></svg>
                        </span>
                        <input
                            type="date"
                            className="px-3 py-1.5 bg-slate-50 border-0 rounded-lg text-sm font-bold text-slate-800 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <Loader />
            ) : orders.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-16 text-center bg-white/50">
                    <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <h3 className="text-xl font-bold text-slate-900">No operations found</h3>
                    <p className="text-slate-500 mt-2">No incoming or closed orders recorded for this exact date.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {orders.map(order => {
                        const isClosed = order.status === 'COMPLETED';
                        const statusConfig = getStatusConfig(order.status);

                        return (
                            <Card
                                key={order.id}
                                className="group cursor-pointer !p-0 bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-100/50 rounded-2xl transition-all relative overflow-hidden"
                                onClick={() => setSelectedOrder(order)}
                            >
                                <div className={`absolute top-0 left-0 w-1.5 h-full ${statusConfig.bar}`}></div>

                                <div className="p-5 pl-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className="font-black text-lg text-slate-900"># {order.id}</span>
                                                <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-md border ${statusConfig.badge}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <div className="text-xs font-semibold text-slate-400 flex items-center">
                                                <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-black text-xl text-slate-900 tracking-tight">₹{order.total_amount}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center text-sm font-medium text-slate-500 mb-4 line-clamp-1 h-5 overflow-hidden">
                                        {order.items?.map(i => `${i.qty}x ${i.name}`).join(', ') || <span className="italic text-slate-400">Loading contents...</span>}
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded">
                                                {order.type === 'DINE_IN' ? `TABLE ${order.table_id}` : 'Walk In'}
                                            </span>
                                            {order.status === 'CANCELLED' ? (
                                                <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">FAILED</span>
                                            ) : (
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${order.payment_status === 'COMPLETED' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                    {order.payment_status || 'PENDING'}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center text-sm font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                                            {isClosed ? 'View Receipt' : 'Take Action'}
                                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default OrderHistory;
