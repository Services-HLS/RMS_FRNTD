import React, { useState, useEffect } from 'react';
import { Card, Button, Loader } from '../../ui';
import api from '../../../services/api';

const KitchenOrderView = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    
    // Filters
    const [statusFilter, setStatusFilter] = useState('ALL ACTIVE');
    const [sourceFilter, setSourceFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDate, setFilterDate] = useState('');

    useEffect(() => {
        fetchOrders();
        const pollInterval = setInterval(fetchOrders, 10000); // Poll every 10s
        const timerInterval = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => {
            clearInterval(pollInterval);
            clearInterval(timerInterval);
        };
    }, [statusFilter, filterDate]); // Refetch when switching between Active/All or Date

    const fetchOrders = async () => {
        try {
            // If statusFilter is COMPLETED or a date is selected, we include completed in the API call
            const includeCompleted = statusFilter === 'COMPLETED' || statusFilter === 'ALL HISTORY' || filterDate !== '';
            const data = await api.getActiveKOTs(null, includeCompleted);
            setOrders(data);
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
            alert(`KOT Reprint triggered for Order #${orderId}`);
            fetchOrders();
        } catch (error) {
            console.error("Failed to trigger re-print", error);
        }
    };

    const getOrderTime = (createdAt) => {
        const diff = Math.floor((currentTime - new Date(createdAt)) / 1000);
        const mins = Math.floor(diff / 60);
        const secs = diff % 60;
        return `${mins}m ${secs}s`;
    };

    // Advanced Filtering Logic
    const filteredOrders = orders.filter(kot => {
        // Status Match
        let statusMatch = true;
        if (statusFilter === 'ALL ACTIVE') statusMatch = kot.status !== 'COMPLETED';
        else if (statusFilter === 'PENDING') statusMatch = kot.status === 'PENDING';
        else if (statusFilter === 'PRINTED/PREP') statusMatch = kot.status === 'PRINTED';
        else if (statusFilter === 'PROCESSED/READY') statusMatch = kot.status === 'PROCESSED';
        else if (statusFilter === 'COMPLETED') statusMatch = kot.status === 'COMPLETED';

        // Source Match
        const sourceMatch = sourceFilter === 'ALL' || kot.order_source === sourceFilter;

        // Search Match (Order ID or Table)
        const q = searchQuery.toLowerCase();
        const searchMatch = !searchQuery || 
            String(kot.order_id).includes(q) || 
            String(kot.table_number || '').toLowerCase().includes(q) ||
            (kot.items && kot.items.some(i => i.name.toLowerCase().includes(q)));

        // Date Match
        const datePart = kot.created_at ? kot.created_at.split('T')[0] : '';
        const dateMatch = !filterDate || datePart === filterDate;

        return statusMatch && sourceMatch && searchMatch && dateMatch;
    }).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    if (loading && orders.length === 0) return <div className="p-12 flex justify-center"><Loader /></div>;

    const getSourceLabel = (order) => {
        if (order.order_source === 'QR_TABLE') return "📱 Table QR";
        if (order.order_source === 'QR_WALKIN') return "🚶‍♂️ Walk-in QR";
        if (order.order_source === 'COUNTER') return "🖥️ COUNTER";
        return order.order_source || "Order";
    };

    return (
        <div className="space-y-6">
            {/* Filter Bar */}
            <div className="flex flex-col xl:flex-row gap-4 items-center justify-between bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2 ml-1">Status:</span>
                    {['ALL ACTIVE', 'PENDING', 'PRINTED/PREP', 'PROCESSED/READY', 'COMPLETED'].map(f => (
                        <button
                            key={f}
                            onClick={() => setStatusFilter(f)}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border ${statusFilter === f ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200' : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full xl:w-auto">
                    <div className="relative flex-1 w-full xl:w-64">
                         <input 
                            type="text"
                            placeholder="Search Order, Table or Item..."
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 ring-blue-500/20 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                         />
                         <span className="absolute left-3 top-1/2 -translate-y-1/2 grayscale opacity-40">🔍</span>
                    </div>

                    <div className="flex items-center space-x-2 bg-slate-50 w-full md:w-auto rounded-2xl p-1 border border-slate-100 shadow-inner">
                         <input 
                            type="date"
                            className="flex-1 w-full px-3 py-1.5 bg-transparent border-0 rounded-lg text-xs font-bold text-slate-800 outline-none cursor-pointer"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                         />
                         {filterDate && (
                            <button 
                                onClick={() => setFilterDate('')}
                                className="pr-3 text-slate-400 hover:text-red-500 transition-colors text-xs font-bold shrink-0"
                            >
                                ✕
                            </button>
                         )}
                    </div>

                    <select 
                        className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2.5 w-full md:w-auto text-xs font-bold outline-none"
                        value={sourceFilter}
                        onChange={(e) => setSourceFilter(e.target.value)}
                    >
                        <option value="ALL">All Sources</option>
                        <option value="QR_TABLE">Table QR</option>
                        <option value="QR_WALKIN">Walk-in QR</option>
                        <option value="COUNTER">Counter POS</option>
                    </select>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredOrders.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-white rounded-3xl shadow-sm border border-slate-200">
                        <div className="w-24 h-24 bg-slate-50 flex items-center justify-center rounded-full mx-auto mb-6">
                            <span className="text-4xl grayscale opacity-50">📋</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">No orders match filters</h3>
                        <p className="text-slate-500 font-medium tracking-wide mt-2">Adjust your filters to see more results.</p>
                        <button 
                            onClick={() => { setStatusFilter('ALL ACTIVE'); setSourceFilter('ALL'); setSearchQuery(''); setFilterDate(''); }}
                            className="mt-6 text-blue-600 font-bold text-sm hover:underline"
                        >
                            Reset all filters
                        </button>
                    </div>
                )}
                {filteredOrders.map(kot => {
                    const isLate = Math.floor((currentTime - new Date(kot.created_at)) / 1000 / 60) > 15 && kot.status !== 'COMPLETED';
                    const isOrdered = kot.order_status === 'ORDERED';
                    const tableInfo = kot.table_number ? `TABLE #${kot.table_number}` : (kot.type === 'TAKE_AWAY' ? 'TAKEAWAY' : 'WALK-IN');

                    return (
                        <Card
                            key={kot.id}
                            className={`relative overflow-hidden group shadow-lg transition-all ${isOrdered ? 'border-amber-200 shadow-amber-100/50 bg-white' : (kot.status === 'COMPLETED' ? 'border-slate-200 opacity-80' : 'border-blue-200 shadow-blue-100/50 bg-blue-50/10')}`}
                        >
                            {/* Top Status Bar indicator */}
                            <div className={`absolute top-0 left-0 w-full h-1.5 ${isOrdered ? 'bg-amber-400' : (kot.status === 'COMPLETED' ? 'bg-emerald-400' : 'bg-blue-500')}`}></div>

                            <div className="p-6">
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                                    <div className="w-full sm:w-auto">
                                        <h4 className="font-black text-2xl text-slate-900 tracking-tight leading-none truncate">ORDER #{kot.order_id}</h4>
                                        {kot.customer_name && (
                                            <div className="mt-1 flex items-center space-x-1 truncate w-full">
                                                <span className="text-[11px] font-bold text-secondary truncate">👤 {kot.customer_name}</span>
                                                <span className="text-[10px] text-slate-400 shrink-0">({kot.customer_phone})</span>
                                            </div>
                                        )}
                                        <div className="mt-1 flex flex-wrap items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${kot.type === 'DINE_IN' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                                                {tableInfo}
                                            </span>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 uppercase tracking-wider">
                                                {getSourceLabel(kot)}
                                            </span>
                                        </div>
                                        <div className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            KOT: {kot.status}
                                        </div>
                                    </div>
                                    <div className="text-left sm:text-right w-full sm:w-auto pt-2 sm:pt-0 border-t border-slate-100 sm:border-0">
                                        <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm inline-block ${isOrdered ? 'bg-amber-100 text-amber-700 border border-amber-200' : (kot.order_status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-blue-100 text-blue-700 border border-blue-200')}`}>
                                            {kot.order_status}
                                        </span>
                                    </div>
                                </div>

                                <div className={`mb-5 flex items-center space-x-2 font-mono text-sm py-2 px-3 rounded-lg border ${kot.status === 'COMPLETED' ? 'border-slate-100 bg-slate-50 text-slate-400' : (isLate ? 'border-red-200 bg-red-50 text-red-600 font-bold' : 'border-slate-100 bg-slate-50 text-slate-600 font-medium')}`}>
                                    <span>{kot.status === 'COMPLETED' ? '✅' : '⏳'}</span>
                                    <span>{kot.status === 'COMPLETED' ? `Completed at ${new Date(kot.created_at).toLocaleTimeString()}` : `Waiting: ${getOrderTime(kot.created_at)}`}</span>
                                </div>

                                <div className="bg-white border border-slate-100 rounded-xl overflow-hidden mb-6 shadow-sm">
                                    <ul className="divide-y divide-slate-50">
                                        {kot.items && kot.items.length > 0 ? kot.items.map((item, idx) => (
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
                                    {kot.order_status === 'ORDERED' ? (
                                        <button
                                            onClick={() => updateStatus(kot.order_id, 'PREPARING')}
                                            className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-md shadow-amber-200 transition-all flex items-center justify-center space-x-2"
                                        >
                                            <span>Accept & Start Prep</span>
                                            <span>👨‍🍳</span>
                                        </button>
                                    ) : kot.order_status === 'PREPARING' ? (
                                        <button
                                            onClick={() => updateStatus(kot.order_id, 'READY')}
                                            className="w-full py-3 px-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold shadow-md shadow-indigo-200 transition-all flex items-center justify-center space-x-2"
                                        >
                                            <span>Mark Ready</span>
                                            <span>🔔</span>
                                        </button>
                                    ) : kot.order_status === 'READY' ? (
                                        <button
                                            onClick={() => updateStatus(kot.order_id, 'COMPLETED')}
                                            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-200 transition-all flex items-center justify-center space-x-2"
                                        >
                                            <span>Complete Order</span>
                                            <span>✅</span>
                                        </button>
                                    ) : (
                                        <div className="w-full py-3 px-4 bg-slate-100 text-slate-400 rounded-xl font-bold text-center">
                                            Handled & Closed
                                        </div>
                                    )}
                                    <button
                                        onClick={() => handlePrintKOT(kot.order_id)}
                                        className="w-full py-2.5 px-4 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 rounded-xl font-bold transition-all flex items-center justify-center space-x-2"
                                    >
                                        <span>Print KOT Ticket</span>
                                        <span>🖨️</span>
                                    </button>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default KitchenOrderView;
