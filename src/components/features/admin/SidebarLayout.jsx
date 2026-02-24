import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../ui';
import StockAlerts from '../notifications/StockAlerts';
import api from '../../../services/api';

const SidebarLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAlertsOpen, setIsAlertsOpen] = useState(false);
    const [alertCount, setAlertCount] = useState(0);
    const [restaurantName, setRestaurantName] = useState(localStorage.getItem('restaurant_name') || 'Restaurant OS');
    const token = localStorage.getItem('token');
    const userRole = (() => {
        try {
            if (!token) return 'ADMIN';
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.role || 'ADMIN';
        } catch (e) {
            return 'ADMIN';
        }
    })();

    useEffect(() => {
        const fetchAlertCount = async () => {
            try {
                const [stock, menu] = await Promise.all([
                    api.getStock(),
                    api.getMenu()
                ]);
                const count = [...stock, ...menu].filter(i => i.quantity <= i.low_stock_threshold).length;
                setAlertCount(count);
            } catch (error) {
                console.error("Failed to fetch alert count", error);
            }
        };
        fetchAlertCount();
        const interval = setInterval(fetchAlertCount, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    const menuItems = [
        { id: '/admin/dashboard', label: 'Analytics', icon: '📊' },
        { id: '/admin/pos', label: 'New Order (POS)', icon: '🖥️' },
        { id: '/admin/history', label: 'Order History', icon: '🕒' },
        { id: '/admin/stock', label: 'Raw Stock', icon: '🥕' },
        { id: '/admin/menu-inventory', label: 'Menu Inventory', icon: '🍔' },
        { id: '/admin/expenses', label: 'Expenses', icon: '💰' },
        { id: '/admin/marketing', label: 'Marketing', icon: '📣' },
        { id: '/admin/tables', label: 'Tables & QR', icon: '🪑' },
        { id: '/admin/printers', label: 'Printers', icon: '🖨️' },
    ];

    const handleNavigation = (path) => {
        navigate(path);
        setIsMobileMenuOpen(false);
    };

    const handleLogout = () => {
        localStorage.clear(); // Clear all session data including restaurant selection
        navigate('/admin/login');
    };

    return (
        <div className="h-screen h-[100dvh] bg-gray-100 flex flex-col lg:flex-row overflow-hidden relative">
            {/* Mobile Header */}
            <div className="lg:hidden h-16 bg-white shadow-sm z-20 px-4 py-3 flex justify-between items-center flex-none">
                <span className="font-bold text-lg text-gray-800 truncate pr-4">{restaurantName}</span>
                <Button size="sm" variant="outline" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? '✕' : '☰'}
                </Button>
            </div>

            {/* Sidebar (Desktop & Mobile Overlay) */}
            <aside className={`
                fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:block h-screen lg:h-full flex flex-col flex-none
                ${isMobileMenuOpen ? 'translate-x-0 bubble-shadow' : '-translate-x-full'}
            `}>
                <div className="p-6 border-b border-slate-700 flex flex-none justify-between items-center">
                    <h1 className="text-xl font-bold truncate pr-4">{restaurantName}</h1>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setIsAlertsOpen(true)}
                            className="relative p-2 text-slate-400 hover:text-white transition-colors"
                        >
                            <span className="text-xl">🔔</span>
                            {alertCount > 0 && (
                                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                    {alertCount}
                                </span>
                            )}
                        </button>
                        <button className="lg:hidden text-gray-400" onClick={() => setIsMobileMenuOpen(false)}>✕</button>
                    </div>
                </div>

                <StockAlerts isOpen={isAlertsOpen} onClose={() => setIsAlertsOpen(false)} />
                
                <nav className="flex-1 min-h-0 overflow-y-auto p-4 space-y-1 custom-scrollbar overscroll-contain">
                    {menuItems.map(item => {
                        const isActive = location.pathname === item.id || (item.id === '/admin/dashboard' && location.pathname === '/admin/dashboard');
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNavigation(item.id)}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                <span className="font-medium">{item.label}</span>
                            </button>
                        );
                    })}

                    {userRole === 'SUPER_ADMIN' && (
                        <div className="pt-4 mt-4 border-t border-slate-700">
                             <button
                                onClick={() => handleNavigation('/super-admin/dashboard')}
                                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-yellow-500 hover:bg-slate-800 transition-colors"
                            >
                                <span className="text-xl">🏠</span>
                                <span className="font-medium text-sm">Super Admin Portal</span>
                            </button>
                        </div>
                    )}
                </nav>

                <div className="p-3 bg-slate-900 border-t border-slate-700 flex-none z-10">
                    <div className="flex items-center justify-between px-2 bg-slate-800/50 rounded-xl p-2 border border-slate-700/50">
                        <div className="flex items-center space-x-2 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold flex-none text-xs">
                                {userRole === 'SUPER_ADMIN' ? 'SA' : 'AD'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold truncate text-white">
                                    {userRole === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                                </p>
                                <p className="text-[10px] text-slate-400 truncate">Manager</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            title="Log Out"
                            className="p-2 rounded-lg bg-slate-700 hover:bg-red-600/20 hover:text-red-400 text-slate-400 transition-all ml-2 flex-none border border-slate-600"
                        >
                            <span className="text-sm">🔒</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-gray-50 h-full relative">
                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {children}
                    </div>
                </main>
            </div>

            {/* Overlay for mobile menu */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </div>
    );
};

export default SidebarLayout;
