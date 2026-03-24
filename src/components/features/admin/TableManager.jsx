import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Modal, Loader, Card } from '../../ui';
import api from '../../../services/api';

const TableManager = () => {
    const navigate = useNavigate();
    const [tables, setTables] = useState([]);
    const [activeOrders, setActiveOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // new states for checking out a table
    const [checkoutTable, setCheckoutTable] = useState(null);
    const [checkoutOrder, setCheckoutOrder] = useState(null);

    const [newTable, setNewTable] = useState({ display_name: '', sequence_no: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchTablesAndOrders();
        const pollInterval = setInterval(fetchTablesAndOrders, 10000); // Poll every 10s for live floor updates
        return () => clearInterval(pollInterval);
    }, []);

    const fetchTablesAndOrders = async () => {
        try {
            const [tablesData, ordersData] = await Promise.all([
                api.getTables(),
                api.getOrders()
            ]);
            setTables(tablesData);
            setActiveOrders(ordersData);
        } catch (error) {
            console.error("Failed to fetch tables & orders", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTable = async () => {
        if (!newTable.display_name.trim()) return alert("Table Name is required");
        setSaving(true);
        try {
            await api.createTable({
                ...newTable,
                sequence_no: parseInt(newTable.sequence_no) || tables.length + 1,
                status: 'AVAILABLE'
            });
            setIsModalOpen(false);
            setNewTable({ display_name: '', sequence_no: '' });
            fetchTablesAndOrders();
        } catch (error) {
            console.error("Failed to create table", error);
        } finally {
            setSaving(false);
        }
    };

    const handleCheckoutTable = async (method) => {
        if (!checkoutOrder) {
            // Just clear the Occupied status if there is no active order
            try {
                await api.updateTableStatus(checkoutTable.id, 'AVAILABLE');
                setCheckoutTable(null);
                fetchTablesAndOrders();
            } catch (error) {
                console.error(error);
            }
            return;
        }

        try {
            await api.processPayment(checkoutOrder.id, method);
            alert(`Order #${checkoutOrder.id} successfully Paid via ${method}! Order sent to Kitchen.`);
            setCheckoutTable(null);
            setCheckoutOrder(null);
            fetchTablesAndOrders();
        } catch (error) {
            console.error("Failed to process payment", error);
            alert("Failed to complete the checkout process.");
        }
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'AVAILABLE': return { color: 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-emerald-100', dot: 'bg-emerald-500', icon: '🍃' };
            case 'OCCUPIED': return { color: 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-indigo-100', dot: 'bg-indigo-500', icon: '🍽️' };
            case 'BILLING': return { color: 'bg-amber-50 text-amber-700 border-amber-200 shadow-amber-100', dot: 'bg-amber-500', icon: '💳' };
            case 'CLEANING': return { color: 'bg-orange-50 text-orange-700 border-orange-200 shadow-orange-100', dot: 'bg-orange-500', icon: '🧹' };
            default: return { color: 'bg-slate-50 text-slate-600 border-slate-200 shadow-slate-100', dot: 'bg-slate-400', icon: '🪑' };
        }
    };

    if (loading) return <div className="p-12 flex justify-center"><Loader /></div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Floor Layout</h1>
                    <p className="text-slate-500 font-medium tracking-wide mt-1">Live table management and occupancy tracking</p>
                </div>

                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 bg-white rounded-xl p-1.5 border border-slate-200 shadow-sm mr-2 hidden md:flex">
                        <div className="flex items-center px-3 py-1.5 opacity-80 cursor-help" title="Polling live DB">
                            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
                            <span className="text-xs font-bold text-slate-600">Live Sync</span>
                        </div>
                    </div>
                    <Button onClick={() => setIsModalOpen(true)} className="bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-200 rounded-xl px-6 py-2.5 font-bold transition-all transform hover:scale-105">
                        + Add Table
                    </Button>
                </div>
            </div>

            <div className="bg-slate-200/50 h-px w-full my-4"></div>

            {tables.length === 0 && (
                <div className="py-20 text-center bg-white rounded-3xl shadow-sm border border-slate-200">
                    <div className="w-24 h-24 bg-slate-50 flex items-center justify-center rounded-full mx-auto mb-6">
                        <span className="text-4xl grayscale opacity-50">🪑</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">No tables configured</h3>
                    <p className="text-slate-500 font-medium tracking-wide mt-2">Add your first table to start managing the dining floor.</p>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {tables.map(table => {
                    const config = getStatusConfig(table.status);

                    // Match the active order mapped to this table's ID or Name
                    // AdminPOS actually saves 'tableId' input directly into 'table_id' column, so it could match either
                    const activeOrder = activeOrders.find(o =>
                        o.type === 'DINE_IN' &&
                        (o.table_id == table.id || o.table_id == table.table_number || o.table_id == table.display_name)
                    );

                    return (
                        <Card
                            key={table.id}
                            className={`relative overflow-hidden group cursor-pointer border shadow-lg hover:shadow-xl transition-all h-36 flex flex-col justify-between ${config.color}`}
                            onClick={() => {
                                if (table.status === 'AVAILABLE') {
                                    navigate(`/admin/pos?table=${table.id}`);
                                } else if (table.status === 'OCCUPIED' || activeOrder) {
                                    setCheckoutTable(table);
                                    setCheckoutOrder(activeOrder || null);
                                }
                            }}
                        >
                            <div className="p-5 flex-1 flex flex-col justify-between z-10">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-3 h-3 rounded-full shadow-sm ${table.status === 'OCCUPIED' ? 'animate-pulse' : ''} ${config.dot}`}></div>
                                        <span className="text-xs font-black uppercase tracking-wider opacity-80">{table.status}</span>
                                    </div>
                                    <span className="text-2xl opacity-60 drop-shadow-sm transition-transform group-hover:scale-110">
                                        {activeOrder ? '📝' : config.icon}
                                    </span>
                                </div>

                                <div className="mt-auto flex justify-between items-end">
                                    <p className="text-3xl font-black mt-1 tracking-tight">{table.table_number}</p>
                                    {activeOrder && (
                                        <div className="text-right">
                                            <div className="flex items-center justify-end space-x-1">
                                                {(activeOrder.order_source === 'QR_TABLE' || activeOrder.order_source === 'TABLE_QR') && <span className="text-[10px] bg-indigo-500 text-white px-1.5 py-0.5 rounded font-black mb-1">QR TABLE</span>}
                                                {activeOrder.order_source === 'QR_WALKIN' && <span className="text-[10px] bg-orange-500 text-white px-1.5 py-0.5 rounded font-black mb-1">QR WALK</span>}
                                                <p className="text-[10px] font-bold opacity-75">#{activeOrder.id}</p>
                                            </div>
                                            <p className="text-lg font-black tracking-tight">₹{activeOrder.total_amount}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Abstract Graphic overlay to make cards aesthetic */}
                            <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-white opacity-20 pointer-events-none group-hover:scale-150 transition-transform duration-500"></div>
                        </Card>
                    );
                })}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={<span className="text-2xl font-black text-slate-900 border-b-2 border-slate-100 pb-4 block w-full">Deploy New Table</span>}
            >
                <div className="space-y-6 pt-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Display Name / Number</label>
                        <Input
                            value={newTable.display_name}
                            onChange={(e) => setNewTable({ ...newTable, display_name: e.target.value })}
                            placeholder="e.g. Table 1, Booth A..."
                            className="w-full text-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-0 rounded-xl"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Floor Sequence Offset (Optional)</label>
                        <Input
                            type="number"
                            value={newTable.sequence_no}
                            onChange={(e) => setNewTable({ ...newTable, sequence_no: e.target.value })}
                            placeholder="Priority mapping..."
                            className="w-full text-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-0 rounded-xl"
                        />
                    </div>
                    <div className="flex space-x-4 pt-6 border-t border-slate-100">
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl text-lg">Cancel</Button>
                        <Button onClick={handleCreateTable} disabled={saving} className="flex-1 py-4 font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 rounded-xl text-lg">
                            {saving ? 'Deploying...' : 'Deploy Table'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Complete Order / Checkout Modal */}
            {checkoutTable && (
                <Modal
                    isOpen={!!checkoutTable}
                    onClose={() => { setCheckoutTable(null); setCheckoutOrder(null); }}
                    title={<span className="text-2xl font-black text-slate-900 border-b-2 border-slate-100 pb-4 block w-full">Complete Floor Session - {checkoutTable.table_number}</span>}
                >
                    <div className="pt-4 space-y-6">
                        {checkoutOrder ? (
                            <>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                                    <h4 className="font-bold text-slate-700 text-sm mb-3 uppercase tracking-widest">Active Order Items</h4>
                                    <div className="space-y-2 max-h-[30vh] overflow-y-auto custom-scrollbar pr-2">
                                        {checkoutOrder.items?.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm py-2 border-b border-slate-100 bg-white px-3 rounded-lg shadow-sm">
                                                <span className="font-bold text-slate-800">{item.qty || item.quantity} x {item.name}</span>
                                                <span className="font-bold text-slate-500">₹{((item.qty || item.quantity || 0) * (item.price_at_order || item.price || 0)).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-baseline">
                                        <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Grand Total</span>
                                        <span className="text-3xl font-black text-blue-600">₹{checkoutOrder.total_amount}</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="font-bold text-slate-700 text-sm mb-3 uppercase tracking-widest text-center">Operation Gateways</h4>

                                    <Button
                                        onClick={() => navigate(`/admin/pos?table=${checkoutTable.id}`)}
                                        className="w-full py-4 text-lg font-black shadow-lg shadow-blue-100 bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black text-white"
                                    >
                                        <span className="mr-2">📝</span> Add Items / Order More
                                    </Button>

                                    <h4 className="font-bold text-slate-700 text-sm py-2 uppercase tracking-widest text-center">Tender Method</h4>
                                    <Button
                                        onClick={() => handleCheckoutTable('CASH')}
                                        className="w-full py-4 text-lg font-black shadow-lg shadow-emerald-100 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                                    >
                                        <span className="mr-2">💵</span> Close with Cash
                                    </Button>
                                    <Button
                                        onClick={() => handleCheckoutTable('ONLINE')}
                                        className="w-full py-4 text-lg font-black shadow-lg shadow-blue-100 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                                    >
                                        <span className="mr-2">📱</span> Close with Online / Card
                                    </Button>
                                    <Button
                                        onClick={() => handleCheckoutTable('QR_SCAN')}
                                        className="w-full py-4 text-lg font-black shadow-lg shadow-purple-100 bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 text-white"
                                    >
                                        <span className="mr-2">💳</span> Close with QR Scan
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="py-8 text-center text-slate-500">
                                <p className="mb-6 text-lg font-medium">This table is marked as OCCUPIED but has no active orders mapped in the specific Dine-In format.</p>
                                <Button
                                    onClick={() => handleCheckoutTable('CASH')}
                                    className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-bold w-full py-3"
                                >
                                    Force Free Table
                                </Button>
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default TableManager;
