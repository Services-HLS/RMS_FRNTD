import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MenuBrowser, Cart } from '../components/features/customer';
import { SmartSuggestions, Loader, Button, PromotionCarousel } from '../components/ui';
import { AdminPOS, OrderHistory } from '../components/features/admin';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useCart } from '../context/CartContext';
import { Modal } from '../components/ui';
import api from '../services/api';

const CustomerMenu = () => {
    const [searchParams] = useSearchParams();
    const tableId = searchParams.get('table_id');
    const orderSource = searchParams.get('source');
    const restaurantId = searchParams.get('restaurant_id');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCart, setShowCart] = useState(false);
    const [activeTab, setActiveTab] = useState('MENU');
    const [tables, setTables] = useState([]);
    const { cartItems, totalAmount } = useCart();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [restaurantName, setRestaurantName] = useState('Restaurant OS');
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [existingIdentities, setExistingIdentities] = useState([]);
    const [isFetchingIdentities, setIsFetchingIdentities] = useState(false);

    useEffect(() => {
        // Auto-show welcome modal cleanly on every new QR scan (new browser session)
        if (!sessionStorage.getItem('qr_session_active')) {
            sessionStorage.setItem('qr_session_active', 'true');
            localStorage.removeItem('last_customer_phone');
            localStorage.removeItem('last_customer_name');
            setCustomerPhone('');
            setCustomerName('');
            setShowWelcomeModal(true);
        } else if (!localStorage.getItem('last_customer_phone')) {
            setShowWelcomeModal(true);
        } else {
            setCustomerPhone(localStorage.getItem('last_customer_phone') || '');
            setCustomerName(localStorage.getItem('last_customer_name') || '');
        }

        if (restaurantId) {
            localStorage.setItem('restaurant_id', restaurantId);
        }

        const localName = localStorage.getItem('restaurant_name');
        if (localName) {
            setRestaurantName(localName);
        } else {
            api.getRestaurant(parseInt(restaurantId || api.getCurrentRestaurantId())).then(res => {
                if (res && res.name) {
                    setRestaurantName(res.name);
                    localStorage.setItem('restaurant_name', res.name);
                }
            }).catch(err => console.error("Failed to fetch restaurant", err));
        }

        const loadData = async () => {
            try {
                const rid = restaurantId || api.getCurrentRestaurantId();
                const [msgData, tablesData] = await Promise.all([
                    api.getMarketingMessages(rid),
                    api.getTables(rid)
                ]);
                setMessages(msgData.filter(m => m.is_active));
                setTables(tablesData);
            } catch (error) {
                console.error("Failed to load data", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        const fetchIdentities = async () => {
            if (customerPhone && customerPhone.trim().length >= 10) {
                setIsFetchingIdentities(true);
                try {
                    const idties = await api.getCustomerIdentities(customerPhone.trim());
                    // Group by name to ensure unique names are shown even if they have multiple IDs
                    const uniqueNames = [];
                    const filteredIdties = [];
                    idties.forEach(idty => {
                        if (!uniqueNames.includes(idty.name)) {
                            uniqueNames.push(idty.name);
                            filteredIdties.push(idty);
                        }
                    });
                    setExistingIdentities(filteredIdties);
                } catch (error) {
                    console.error("Failed to fetch identities", error);
                } finally {
                    setIsFetchingIdentities(false);
                }
            } else {
                setExistingIdentities([]);
            }
        };
        fetchIdentities();
    }, [customerPhone]);

    const handleWelcomeSubmit = (e) => {
        if (e) e.preventDefault();
        if (!customerName || !customerPhone || customerPhone.length < 10) return;
        
        localStorage.setItem('last_customer_phone', customerPhone);
        localStorage.setItem('last_customer_name', customerName);
        setShowWelcomeModal(false);
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-neutral"><Loader /></div>;

    const activeTable = tables.find(t => String(t.id) === String(tableId));

    return (
        <div className="flex-1 bg-neutral flex flex-col lg:flex-row overflow-hidden relative h-screen w-full">
            {/* Mobile Header */}
            <div className="lg:hidden h-16 bg-white shadow-premium z-20 px-4 py-3 flex justify-between items-center flex-none border-b border-neutral-border">
                <div className="flex items-center space-x-2 flex-shrink min-w-0">
                    <span className="text-xl">🍽️</span>
                    <span className="font-bold text-lg text-primary truncate pr-4 max-w-[150px]">{restaurantName}</span>
                </div>
                <div className="flex items-center space-x-3">
                    {activeTab === 'MENU' && cartItems.length > 0 && (
                        <button onClick={() => setShowCart(true)} className="relative p-2 text-primary hover:text-secondary transition-colors">
                            <span className="text-xl">🛒</span>
                            <span className="absolute top-0 right-0 bg-error text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                                {cartItems.length}
                            </span>
                        </button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? '✕' : '☰'}
                    </Button>
                </div>
            </div>

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-[100] w-64 bg-primary text-white transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static h-full flex flex-col flex-none
                ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
            `}>
                <div className="p-6 border-b border-white/10 flex flex-none justify-between items-center bg-primary">
                    <div className="flex items-center space-x-3">
                        <span className="text-2xl bg-white/10 rounded-[8px] p-2 shadow-inner">🍽️</span>
                        <div>
                            <h1 className="text-xl font-bold text-white tracking-tight leading-tight">{restaurantName}</h1>
                            <span className="text-[10px] text-white/60 font-medium uppercase tracking-widest">Digital Menu</span>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 min-h-0 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                    {['MENU', 'POS', 'HISTORY'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => { setActiveTab(tab); setIsMobileMenuOpen(false); }}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-[6px] transition-all ${activeTab === tab
                                ? 'bg-secondary text-white shadow-premium font-semibold'
                                : 'text-white/70 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <div className="flex items-center space-x-3">
                                <span className="text-xl">{tab === 'MENU' ? '🍔' : tab === 'POS' ? '🖥️' : '🕒'}</span>
                                <span className="text-[13px] font-medium">{tab === 'MENU' ? 'Menu' : tab === 'POS' ? 'New Order' : 'History'}</span>
                            </div>
                        </button>
                    ))}
                </nav>

                <div className="p-3 bg-primary border-t border-white/10 flex-none z-10">
                    <div className="flex items-center justify-between px-2 bg-white/5 rounded-[8px] p-3 border border-white/5">
                        <div className="flex flex-col min-w-0">
                            {tableId && activeTable ? (
                                <>
                                    <span className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-0.5">Assigned Table</span>
                                    <span className="text-[13px] font-bold text-white truncate">Table #{activeTable.table_number}</span>
                                </>
                            ) : (
                                <>
                                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-0.5">Order Type</span>
                                    <span className="text-[13px] font-bold text-white truncate">Takeaway / Walk-in</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-neutral h-full relative overflow-y-auto custom-scrollbar">
                <Header isCustomerMode={true} />
                <div className="w-full flex-1 flex flex-col">
                    <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-6 pt-6 pb-24 w-full h-full min-h-0 flex-1">
                        {activeTab === 'MENU' && (
                            <div className="flex flex-col lg:flex-row h-full gap-6">
                                {/* Left Panel: Menu Selection */}
                                <div className="flex-1 flex flex-col min-h-0 h-full">
                                    <PromotionCarousel messages={messages} />
                                    <div className="mb-6">
                                        <h1 className="text-[20px] font-semibold tracking-tight text-primary">Discover Flavour</h1>
                                        <p className="text-neutral-muted text-[13px] font-normal mt-1 tracking-wide">Browse our fresh selection of curated dishes</p>
                                    </div>
                                    <MenuBrowser restaurantId={restaurantId || api.getCurrentRestaurantId()} />
                                </div>

                                 {/* Right Panel: Active Cart & Checkout (Desktop) */}
                                 <div className="hidden lg:flex w-[400px] flex-col h-full flex-shrink-0 animate-in fade-in slide-in-from-right-4 duration-500">
                                     <Cart restaurantId={restaurantId || api.getCurrentRestaurantId()} tableId={tableId} source={orderSource} tables={tables} onTrackOrder={() => setActiveTab('HISTORY')} />
                                 </div>
                            </div>
                        )}

                        {activeTab === 'POS' && (
                            <div className="h-full bg-white rounded-[8px] shadow-premium p-4 border border-neutral-border">
                                <AdminPOS isCustomerMode={true} customerTableId={tableId} />
                            </div>
                        )}

                        {activeTab === 'HISTORY' && (
                            <div className="h-full bg-white rounded-[8px] shadow-premium p-4 border border-neutral-border">
                                <OrderHistory isCustomerMode={true} customerTableId={tableId} customerPhone={localStorage.getItem('last_customer_phone')} />
                            </div>
                        )}
                    </main>
                </div>
                <div className="flex-shrink-0">
                    <Footer />
                </div>
            </div>

            {/* Mobile Cart Overlay */}
            {activeTab === 'MENU' && showCart && (
                <div className="fixed inset-0 z-[40] flex items-end justify-center lg:hidden">
                    <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm" onClick={() => setShowCart(false)}></div>
                    <div className="relative bg-neutral w-full rounded-t-[1.5rem] shadow-2xl h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
                        <div className="pt-4 pb-2 bg-neutral shrink-0">
                            <div className="w-12 h-1.5 bg-neutral-border rounded-full mx-auto mb-4"></div>
                            <div className="flex justify-between items-center px-6">
                                <h3 className="text-xl font-bold text-primary tracking-tight">Your Order</h3>
                                <button onClick={() => setShowCart(false)} className="w-10 h-10 bg-white shadow-sm border border-neutral-border rounded-[8px] flex items-center justify-center text-neutral-muted hover:text-primary transition-colors">✕</button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-hidden p-2">
                             <Cart restaurantId={restaurantId || api.getCurrentRestaurantId()} tableId={tableId} source={orderSource} tables={tables} onTrackOrder={() => { setActiveTab('HISTORY'); setShowCart(false); }} />
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Bottom Action Bar */}
            {activeTab === 'MENU' && cartItems.length > 0 && !showCart && (
                <div className="fixed bottom-6 left-4 right-4 lg:hidden z-20">
                    <button
                        onClick={() => setShowCart(true)}
                        className="w-full h-14 bg-secondary text-white p-4 flex justify-between items-center rounded-[8px] shadow-xl shadow-secondary/20 animate-in slide-in-from-bottom-10 duration-500"
                    >
                        <div className="flex items-center space-x-3">
                            <span className="bg-white/20 w-8 h-8 rounded-[6px] flex items-center justify-center font-bold text-[13px] shadow-inner">
                                {cartItems.length}
                            </span>
                            <span className="font-semibold text-[13px] uppercase tracking-widest">View Order</span>
                        </div>
                        <span className="text-[16px] font-bold tracking-tight">₹{totalAmount}</span>
                    </button>
                </div>
            )}

            {/* Overlay for mobile menu */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-primary/80 backdrop-blur-sm z-[90] lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
            )}

            {/* Welcome Identity Modal */}
            <Modal
                isOpen={showWelcomeModal}
                onClose={() => {}} // Force entry
                title={
                    <div className="text-center w-full">
                        <span className="text-3xl block mb-2">👋</span>
                        <h2 className="text-xl font-bold text-primary tracking-tight">Welcome to {restaurantName}</h2>
                        <p className="text-slate-500 text-xs font-semibold mt-1">Please enter your details to browse the menu</p>
                    </div>
                }
            >
                <form onSubmit={handleWelcomeSubmit} className="space-y-6 pt-4">
                    <div className="space-y-4">
                        <div>
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Mobile Number</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 grayscale opacity-40">📱</span>
                                <input
                                    type="tel"
                                    placeholder="Enter 10-digit mobile"
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold outline-none focus:ring-4 ring-secondary/10 transition-all"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    required
                                    maxLength={10}
                                />
                                {isFetchingIdentities && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <div className="w-4 h-4 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {existingIdentities.length > 0 && (
                            <div className="bg-secondary/5 rounded-2xl p-4 border border-secondary/10 animate-in fade-in slide-in-from-top-2 duration-300">
                                <span className="text-[10px] font-black text-secondary uppercase tracking-widest block mb-2">Previous Identities Found:</span>
                                <div className="flex flex-wrap gap-2">
                                    {existingIdentities.map(idty => (
                                        <button
                                            key={idty.id}
                                            type="button"
                                            onClick={() => setCustomerName(idty.name)}
                                            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${customerName === idty.name ? 'bg-secondary text-white border-secondary shadow-lg shadow-secondary/20' : 'bg-white text-slate-600 border-slate-200 hover:border-secondary'}`}
                                        >
                                            {idty.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Your Name</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 grayscale opacity-40">👤</span>
                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold outline-none focus:ring-4 ring-secondary/10 transition-all"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={!customerName || customerPhone.length < 10}
                        className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-[13px] hover:brightness-110 shadow-xl shadow-primary/20 transition-all uppercase tracking-widest"
                    >
                        Explore Menu & Offers
                    </Button>
                </form>
            </Modal>
        </div>
    );
};

export default CustomerMenu;
