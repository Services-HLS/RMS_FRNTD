import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MenuBrowser, Cart } from '../components/features/customer';
import { SmartSuggestions, Loader } from '../components/ui';
import { useCart } from '../context/CartContext';
import api from '../services/api';

const CustomerMenu = () => {
    const [searchParams] = useSearchParams();
    const tableId = searchParams.get('table_id');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCart, setShowCart] = useState(false);
    const { cartItems, totalAmount } = useCart();

    useEffect(() => {
        const loadData = async () => {
            try {
                const msgData = await api.getMarketingMessages();
                setMessages(msgData.filter(m => m.is_active));
            } catch (error) {
                console.error("Failed to load data", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader /></div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Spicy Bites</h1>
                        {tableId && <span className="text-sm text-gray-500">Table {tableId}</span>}
                    </div>
                    {/* Cart toggle button (mobile) */}
                    <button
                        className="relative lg:hidden bg-blue-600 text-white px-4 py-2 rounded-lg font-medium"
                        onClick={() => setShowCart(!showCart)}
                    >
                        🛒 Cart
                        {cartItems.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                {cartItems.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/* Main Menu Area */}
                    <div className="flex-1 w-full">
                        <MenuBrowser />
                    </div>

                    {/* Sidebar: Cart + Suggestions (Desktop) */}
                    <div className="hidden lg:flex flex-col gap-4 w-96 sticky top-20">
                        {/* Cart summary on desktop */}
                        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
                            <h3 className="font-bold text-lg mb-3">Your Cart</h3>
                            <Cart tableId={tableId} />
                        </div>
                        <SmartSuggestions messages={messages} />
                    </div>
                </div>
            </div>

            {/* Mobile: Cart slide-up panel */}
            {showCart && (
                <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setShowCart(false)}>
                    <div
                        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 max-h-[80vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Your Cart</h3>
                            <button onClick={() => setShowCart(false)} className="text-gray-400 text-xl">✕</button>
                        </div>
                        <Cart tableId={tableId} onOrderPlaced={() => setShowCart(false)} />
                    </div>
                </div>
            )}

            {/* Mobile sticky bottom bar */}
            {cartItems.length > 0 && !showCart && (
                <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-blue-600 text-white p-4 flex justify-between items-center shadow-lg z-30">
                    <span className="font-medium">{cartItems.length} item{cartItems.length > 1 ? 's' : ''}</span>
                    <span className="font-bold">₹{totalAmount}</span>
                    <button
                        className="bg-white text-blue-600 font-bold px-4 py-1 rounded-lg"
                        onClick={() => setShowCart(true)}
                    >
                        View Cart
                    </button>
                </div>
            )}
        </div>
    );
};

export default CustomerMenu;
