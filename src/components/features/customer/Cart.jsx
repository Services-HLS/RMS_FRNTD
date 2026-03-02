import React from 'react';
import { useCart } from '../../../context/CartContext';
import { Button, Card } from '../../ui';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';

const Cart = ({ tableId, source, onOrderPlaced }) => {
    const { cartItems, updateQuantity, removeFromCart, totalAmount, clearCart } = useCart();
    const navigate = useNavigate();

    const [showPayment, setShowPayment] = React.useState(false);
    const [selectedPayment, setSelectedPayment] = React.useState('ONLINE');
    const [isProcessing, setIsProcessing] = React.useState(false);

    const handleInitiateOrder = () => {
        if (cartItems.length === 0) return;
        setShowPayment(true);
    };

    const handlePlaceOrderAndPay = async () => {
        if (cartItems.length === 0) return;
        setIsProcessing(true);
        try {
            const payload = {
                table_id: tableId || null,
                items: cartItems.map(item => ({ id: item.id, qty: item.qty, price: item.price })),
                total_amount: totalAmount,
                payment_method: selectedPayment,
                payment_status: 'COMPLETED',
                status: 'ORDERED'
            };
            if (source) payload.order_source = source;
            await api.createOrder(payload);
            clearCart();
            if (onOrderPlaced) onOrderPlaced();
            alert('Payment successful! Order sent to kitchen 🎉');
            navigate('/customer/order-status');
        } catch (error) {
            console.error("Failed to place order", error);
            alert('Failed to place order. Please try again.');
        } finally {
            setIsProcessing(false);
            setShowPayment(false);
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

            {showPayment ? (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-6 shadow-2xl rounded-t-3xl z-50">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-800">Complete Payment</h3>
                        <button onClick={() => setShowPayment(false)} className="text-gray-400 p-2 font-bold">✕</button>
                    </div>

                    <div className="space-y-3 mb-6">
                        <button
                            className={`w-full p-4 rounded-xl border-2 flex items-center justify-between font-bold transition-all ${selectedPayment === 'ONLINE' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'}`}
                            onClick={() => setSelectedPayment('ONLINE')}
                        >
                            <span className="flex items-center"><span className="text-2xl mr-3">📱</span> UPI / Digital Wallet</span>
                            {selectedPayment === 'ONLINE' && <span className="text-blue-500">✓</span>}
                        </button>
                        <button
                            className={`w-full p-4 rounded-xl border-2 flex items-center justify-between font-bold transition-all ${selectedPayment === 'CARD' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'}`}
                            onClick={() => setSelectedPayment('CARD')}
                        >
                            <span className="flex items-center"><span className="text-2xl mr-3">💳</span> Credit / Debit Card</span>
                            {selectedPayment === 'CARD' && <span className="text-blue-500">✓</span>}
                        </button>
                        <button
                            className={`w-full p-4 rounded-xl border-2 flex items-center justify-between font-bold transition-all ${selectedPayment === 'CASH' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'}`}
                            onClick={() => setSelectedPayment('CASH')}
                        >
                            <span className="flex items-center"><span className="text-2xl mr-3">💵</span> Pay with Cash</span>
                            {selectedPayment === 'CASH' && <span className="text-blue-500">✓</span>}
                        </button>
                    </div>

                    <div className="flex justify-between items-center mb-4 px-2">
                        <span className="text-gray-600 font-medium">Amount to Pay</span>
                        <span className="text-2xl font-black text-gray-900">₹{totalAmount}</span>
                    </div>

                    <Button
                        className="w-full py-4 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
                        onClick={handlePlaceOrderAndPay}
                        disabled={isProcessing}
                    >
                        {isProcessing ? 'Processing Payment...' : 'Pay & Send to Kitchen'}
                    </Button>
                </div>
            ) : (
                <div className="fixed bottom-0 left-0 right-0 lg:static bg-white border-t p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] lg:shadow-none lg:rounded-xl">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600 font-medium">Total Amount</span>
                        <span className="text-2xl font-black text-gray-900">₹{totalAmount}</span>
                    </div>
                    <Button className="w-full py-3 text-lg font-bold bg-gray-900 hover:bg-black shadow-lg" onClick={handleInitiateOrder}>
                        Proceed to Payment
                    </Button>
                </div>
            )}

            {/* Backdrop for payment modal */}
            {showPayment && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => !isProcessing && setShowPayment(false)}></div>}
        </div>
    );
};

export default Cart;
