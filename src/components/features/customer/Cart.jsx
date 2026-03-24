import React, { useMemo } from 'react';
import { useCart } from '../../../context/CartContext';
import { Button, Card, Modal } from '../../ui';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';

const Cart = ({ restaurantId, tableId, source, tables, onOrderPlaced, onTrackOrder }) => {
    const { cartItems, updateQuantity, removeFromCart, totalAmount, clearCart } = useCart();
    const navigate = useNavigate();

    const [showPayment, setShowPayment] = React.useState(false);
    const [showCustomerForm, setShowCustomerForm] = React.useState(false);
    const [customerName, setCustomerName] = React.useState('');
    const [customerPhone, setCustomerPhone] = React.useState('');
    const [selectedPayment, setSelectedPayment] = React.useState('ONLINE');
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [successModal, setSuccessModal] = React.useState({ isOpen: false, payloadId: null });

    const [orderType, setOrderType] = React.useState(tableId ? 'DINE_IN' : 'TAKE_AWAY');
    const [customTableId, setCustomTableId] = React.useState(tableId || '');

    React.useEffect(() => {
        console.log("🔒 Secure QR Cart Terminal v3.0 [Admin Layout] - " + new Date().toLocaleTimeString());
    }, []);

    const activeTable = useMemo(() => {
        const idToMatch = customTableId || tableId;
        return tables.find(t => String(t.id) === String(idToMatch));
    }, [tables, tableId, customTableId]);

    const taxRate = 0.05; 
    const serviceChargeRate = orderType === 'DINE_IN' ? 0.05 : 0; 

    const subtotal = totalAmount;
    const taxAmount = subtotal * taxRate;
    const serviceCharge = subtotal * serviceChargeRate;
    const grandTotal = subtotal + taxAmount + serviceCharge;

    const handleInitiateOrder = () => {
        if (cartItems.length === 0) return;
        if (source === 'QR_WALKIN' && orderType === 'DINE_IN' && !customTableId) {
            alert('Please select a table number for Dine-in');
            return;
        }
        
        // Go straight to payment since customer is already identified at start
        setShowPayment(true);
    };

    const handlePlaceOrderAndPay = async () => {
        if (cartItems.length === 0) return;
        
        const storedName = localStorage.getItem('last_customer_name');
        const storedPhone = localStorage.getItem('last_customer_phone');
        
        if (!storedPhone) {
            alert('Guest information missing. Please refresh the page.');
            return;
        }

        setIsProcessing(true);
        try {
            const payload = {
                restaurant_id: restaurantId || api.getCurrentRestaurantId() || localStorage.getItem('restaurant_id'),
                table_id: customTableId || tableId || null,
                items: cartItems.map(item => ({ id: item.id, qty: item.qty, price: item.price })),
                total_amount: grandTotal,
                tax_amount: taxAmount,
                service_charge: serviceCharge,
                payment_method: selectedPayment,
                payment_status: 'PAID',
                status: 'ORDERED',
                type: orderType,
                order_source: source === 'QR_WALKIN' ? 'QR_WALKIN' : 'QR_TABLE',
                ordered_by: 'CUSTOMER',
                ordered_by_role: 'CUSTOMER',
                customer_name: storedName || 'Guest',
                customer_phone: storedPhone
            };

            await api.createOrder(payload);
            clearCart();
            if (onOrderPlaced) onOrderPlaced();
            setSuccessModal({ isOpen: true, payloadId: payload.table_id || 'new' });
        } catch (error) {
            console.error("Failed to place order", error);
            alert('Failed to place order. Please try again.');
        } finally {
            setIsProcessing(false);
            setShowPayment(false);
        }
    };

    return (
        <div className="w-full bg-white rounded-[8px] shadow-premium p-6 flex flex-col flex-1 border border-neutral-border relative overflow-hidden flex-shrink-0 animate-in fade-in duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
            
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-[18px] font-bold text-primary flex items-center">
                    <svg className="w-5 h-5 mr-3 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    Current Order
                </h2>
                {activeTable && <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-[4px] tracking-widest">TABLE {activeTable.table_number}</span>}
            </div>
            {source === 'QR_WALKIN' && !tableId && (
                <div className="mb-4 animate-in fade-in duration-300">
                    <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center justify-center space-x-2">
                        <span className="text-emerald-600 font-bold text-[13px]">🛒 Walk-in Order / Takeaway</span>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto mb-6 pr-1 custom-scrollbar border-t border-neutral-border pt-4">
                {cartItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-10">
                        <div className="w-16 h-16 bg-neutral-zebra rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-110">
                            <svg className="w-8 h-8 text-neutral-border" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                        </div>
                        <p className="font-semibold text-neutral-muted text-[14px]">Basket is empty.</p>
                        <p className="text-neutral-muted text-[12px] mt-1">Add some items from the menu.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {cartItems.map(item => (
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
                                        <button onClick={() => updateQuantity(item.id, item.qty - 1)} className="w-7 h-7 flex items-center justify-center font-bold text-neutral-muted hover:text-error hover:bg-neutral-zebra rounded-[4px] transition-all">-</button>
                                        <span className="font-bold w-7 text-center text-primary text-[13px]">{item.qty}</span>
                                        <button onClick={() => updateQuantity(item.id, item.qty + 1)} className="w-7 h-7 flex items-center justify-center font-bold text-neutral-muted hover:text-secondary hover:bg-neutral-zebra rounded-[4px] transition-all">+</button>
                                    </div>
                                    <div className="font-bold text-primary text-[14px]">₹{item.price * item.qty}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="border-t border-neutral-border pt-6 space-y-5">
                {/* Totals Section */}
                <div className="bg-neutral-zebra p-4 rounded-[8px] border border-neutral-border shadow-inner text-sm">
                    <div className="flex justify-between items-center text-[12px] font-medium text-neutral-muted mb-2">
                        <span>Subtotal</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[12px] font-medium text-neutral-muted mb-2">
                        <span>GST (5%)</span>
                        <span>₹{taxAmount.toFixed(2)}</span>
                    </div>
                    {serviceCharge > 0 && (
                        <div className="flex justify-between items-center text-[12px] font-medium text-neutral-muted mb-3 animate-in fade-in">
                            <span>Service Charge (5%)</span>
                            <span>₹{serviceCharge.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center border-t border-neutral-border/50 pt-3">
                        <span className="text-[15px] font-semibold text-primary">Order Total</span>
                        <span className="text-[24px] font-bold text-secondary tracking-tight">₹{grandTotal.toFixed(2)}</span>
                    </div>
                </div>

                <Button
                    className="w-full h-12 bg-secondary hover:brightness-95 text-white font-bold rounded-[8px] shadow-lg shadow-secondary/20 uppercase tracking-widest text-[13px] transition-all flex items-center justify-center space-x-3 disabled:opacity-40 disabled:cursor-not-allowed group"
                    onClick={handleInitiateOrder}
                    disabled={cartItems.length === 0 || isProcessing}
                >
                    {isProcessing ? (
                        <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                            <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                        </div>
                    ) : (
                        <>
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                            <span>Checkout Order</span>
                        </>
                    )}
                </Button>
            </div>


            {/* Payment Modal */}
            {showPayment && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm" onClick={() => !isProcessing && setShowPayment(false)}></div>
                    <div className="relative bg-white w-full max-w-md rounded-[8px] p-6 shadow-premium animate-in slide-in-from-bottom-8 duration-300">
                        <div className="absolute top-0 left-0 w-full h-1 bg-secondary rounded-t-[8px]"></div>
                        
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-primary">Select Payment</h3>
                                <p className="text-[13px] text-neutral-muted mt-1">Choose how you'd like to pay</p>
                            </div>
                            <button onClick={() => setShowPayment(false)} className="text-neutral-muted hover:text-primary">✕</button>
                        </div>

                        <div className="space-y-3 mb-6">
                            <button
                                className={`w-full p-4 rounded-[6px] border flex items-center justify-between transition-all ${selectedPayment === 'ONLINE' ? 'border-secondary bg-secondary/5 text-primary' : 'border-neutral-border bg-white text-neutral-muted hover:bg-neutral-zebra'}`}
                                onClick={() => setSelectedPayment('ONLINE')}
                            >
                                <span className="flex items-center text-[14px] font-semibold">
                                    <span className="w-8 h-8 bg-white border border-neutral-border rounded-[4px] flex items-center justify-center text-lg mr-3 shadow-sm">📱</span>
                                    UPI / Wallet
                                </span>
                                {selectedPayment === 'ONLINE' && <div className="w-5 h-5 bg-secondary text-white rounded-full flex items-center justify-center text-xs">✓</div>}
                            </button>

                            <button
                                className={`w-full p-4 rounded-[6px] border flex items-center justify-between transition-all ${selectedPayment === 'CARD' ? 'border-secondary bg-secondary/5 text-primary' : 'border-neutral-border bg-white text-neutral-muted hover:bg-neutral-zebra'}`}
                                onClick={() => setSelectedPayment('CARD')}
                            >
                                <span className="flex items-center text-[14px] font-semibold">
                                    <span className="w-8 h-8 bg-white border border-neutral-border rounded-[4px] flex items-center justify-center text-lg mr-3 shadow-sm">💳</span>
                                    Credit / Debit Card
                                </span>
                                {selectedPayment === 'CARD' && <div className="w-5 h-5 bg-secondary text-white rounded-full flex items-center justify-center text-xs">✓</div>}
                            </button>
                        </div>

                        <Button
                            className="w-full py-4 text-[13px] font-bold bg-primary text-white rounded-[6px] hover:brightness-110 transition-all uppercase tracking-widest disabled:opacity-50"
                            onClick={handlePlaceOrderAndPay}
                            disabled={isProcessing}
                        >
                            {isProcessing ? "Processing..." : `Pay ₹${grandTotal.toFixed(2)}`}
                        </Button>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            <Modal
                isOpen={successModal.isOpen}
                onClose={() => {}}
                title={<span className="text-xl font-black text-slate-800 tracking-tight block text-center w-full">Payment Successful</span>}
            >
                <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-2 shadow-inner border border-emerald-100">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-[20px] font-bold text-primary tracking-tight">Order Confirmed! 👨‍🍳</h3>
                    <p className="text-neutral-muted text-[14px] font-medium">Your request has been successfully sent to the kitchen.</p>
                    <div className="w-full pt-6 border-t border-neutral-border mt-2">
                        <Button 
                            onClick={() => {
                                setSuccessModal({ isOpen: false, payloadId: null });
                                const storedPhone = localStorage.getItem('last_customer_phone') || '';
                                
                                if (onTrackOrder) {
                                    onTrackOrder();
                                } else {
                                    navigate(`/order/history/${storedPhone}`);
                                }
                            }}
                            className="w-full py-3 bg-primary border text-white rounded-[6px] font-bold text-[13px] hover:brightness-110 transition-all"
                        >
                            View All My Orders
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Cart;
