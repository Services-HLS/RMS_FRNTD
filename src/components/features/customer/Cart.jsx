import React from 'react';
import { useCart } from '../../../context/CartContext';
import { Button, Card } from '../../ui';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';

const Cart = ({ tableId, onOrderPlaced }) => {
    const { cartItems, updateQuantity, removeFromCart, totalAmount, clearCart } = useCart();
    const navigate = useNavigate();

    const handlePlaceOrder = async () => {
        if (cartItems.length === 0) return;
        try {
            await api.createOrder({
                table_id: tableId || null,
                items: cartItems.map(item => ({ id: item.id, qty: item.qty, price: item.price })),
                total_amount: totalAmount,
                payment_method: 'CASH',
            });
            clearCart();
            if (onOrderPlaced) onOrderPlaced();
            alert('Order placed successfully! 🎉');
            navigate('/customer/order-status');
        } catch (error) {
            console.error("Failed to place order", error);
            alert('Failed to place order. Please try again.');
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="text-center py-10">
                <p className="text-gray-500 mb-4">Your cart is empty</p>
                <Button variant="outline" onClick={() => navigate(-1)}>
                    Browse Menu
                </Button>
            </div>
        );
    }

    return (
        <div className="pb-20">
            <div className="space-y-4">
                {cartItems.map((item) => (
                    <Card key={item.id} className="flex justify-between items-center">
                        <div className="flex-1">
                            <h4 className="font-semibold">{item.name}</h4>
                            <p className="text-sm text-gray-500">₹{item.price} x {item.qty}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"
                                onClick={() => updateQuantity(item.id, item.qty - 1)}
                            >
                                -
                            </button>
                            <span className="font-medium w-6 text-center">{item.qty}</span>
                            <button
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"
                                onClick={() => updateQuantity(item.id, item.qty + 1)}
                            >
                                +
                            </button>
                            <button
                                className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500 ml-1"
                                onClick={() => removeFromCart(item.id)}
                            >
                                ✕
                            </button>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600">Total</span>
                    <span className="text-xl font-bold">₹{totalAmount}</span>
                </div>
                <Button className="w-full" onClick={handlePlaceOrder}>
                    Place Order
                </Button>
            </div>
        </div>
    );
};

export default Cart;
