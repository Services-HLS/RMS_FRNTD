import React, { useState, useEffect } from 'react';
import { Button, Input, Card, Loader } from '../../ui';
import api from '../../../services/api';

const AdminPOS = () => {
    const [menu, setMenu] = useState([]);
    const [filteredMenu, setFilteredMenu] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState('CASH'); // CASH, ONLINE
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [categories, setCategories] = useState(['ALL']);

    useEffect(() => {
        fetchMenu();
    }, []);

    useEffect(() => {
        filterMenu();
    }, [searchQuery, selectedCategory, menu]);

    const fetchMenu = async () => {
        try {
            const data = await api.getMenu();
            setMenu(data);
            // Extract unique categories
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
                (item.id && item.id.toString().includes(lowerQ)) // Search by ID/Number
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

    const handlePlaceOrder = async () => {
        if (cart.length === 0) return;
        try {
            const orderData = {
                table_id: null, // Walk-in POS order
                items: cart.map(item => ({ id: item.id, qty: item.qty, price: item.price })),
                total_amount: calculateTotal(),
                payment_method: paymentMethod,
                payment_status: 'PAID',
            };
            await api.createOrder(orderData);
            alert('Order Placed Successfully!');
            setCart([]);
            setSearchQuery('');
        } catch (error) {
            console.error("Failed to place order", error);
            alert('Failed to place order. Please try again.');
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-6">
            {/* Menu Selection */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="mb-4 space-y-4">
                    <Input
                        placeholder="Search by Item Name or Number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                    />
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                        {categories.map(cat => (
                            <Button
                                key={cat}
                                variant={selectedCategory === cat ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {filteredMenu.map(item => (
                            <Card key={item.id} className="cursor-pointer hover:border-blue-500 transition-colors flex flex-col justify-between" onClick={() => addToCart(item)}>
                                <div>
                                    <h4 className="font-bold">{item.name}</h4>
                                    <p className="text-xs text-gray-500 mb-2">{item.category_name || item.category}</p>
                                </div>
                                <div className="flex justify-between items-end mt-2">
                                    <span className="font-bold text-lg">₹{item.price}</span>
                                    <Button size="sm" className="px-2 py-0">+</Button>
                                </div>
                                {item.waiting_time_minutes > 0 && (
                                    <div className="mt-1 text-xs text-orange-600 font-medium">
                                        ⏱ {item.waiting_time_minutes} min wait
                                    </div>
                                )}
                            </Card>
                        ))}
                        {filteredMenu.length === 0 && <p className="col-span-3 text-center text-gray-400 py-10">No items found.</p>}
                    </div>
                </div>
            </div>

            {/* Cart & Checkout */}
            <div className="w-full lg:w-96 bg-white rounded-xl shadow-lg p-6 flex flex-col h-full border border-gray-100">
                <h2 className="text-xl font-bold mb-4">Current Order</h2>
                <div className="flex-1 overflow-y-auto mb-4 space-y-2 pr-1">
                    {cart.length === 0 && <p className="text-gray-400 text-center mt-10">Cart is empty</p>}
                    {cart.map(item => (
                        <div key={item.id} className="flex justify-between items-center border-b border-gray-100 pb-2">
                            <div className="flex-1">
                                <div className="font-medium">{item.name}</div>
                                <div className="text-sm text-gray-500">₹{item.price} each</div>
                            </div>
                            <div className="flex items-center space-x-2 bg-gray-50 rounded px-2 py-1">
                                <button onClick={(e) => { e.stopPropagation(); updateQty(item.id, -1); }} className="px-2 font-bold text-gray-600 hover:text-red-500">-</button>
                                <span className="font-bold w-4 text-center">{item.qty}</span>
                                <button onClick={(e) => { e.stopPropagation(); updateQty(item.id, 1); }} className="px-2 font-bold text-gray-600 hover:text-green-500">+</button>
                            </div>
                            <div className="ml-3 font-bold w-16 text-right">₹{item.price * item.qty}</div>
                            <button onClick={() => removeFromCart(item.id)} className="ml-2 text-red-400 hover:text-red-600">✕</button>
                        </div>
                    ))}
                </div>

                <div className="border-t pt-4 space-y-4">
                    <div className="flex justify-between text-xl font-bold">
                        <span>Total</span>
                        <span>₹{calculateTotal()}</span>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Payment Method</label>
                        <div className="flex space-x-2">
                            <Button
                                className="flex-1"
                                variant={paymentMethod === 'CASH' ? 'primary' : 'outline'}
                                onClick={() => setPaymentMethod('CASH')}
                            >
                                Cash 💵
                            </Button>
                            <Button
                                className="flex-1"
                                variant={paymentMethod === 'ONLINE' ? 'primary' : 'outline'}
                                onClick={() => setPaymentMethod('ONLINE')}
                            >
                                Online 📱
                            </Button>
                        </div>
                    </div>

                    <Button className="w-full py-3 text-lg" onClick={handlePlaceOrder} disabled={cart.length === 0}>
                        Complete Order
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AdminPOS;
