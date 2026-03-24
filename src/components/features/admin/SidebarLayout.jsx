import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../ui';
import StockAlerts from '../notifications/StockAlerts';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

const SidebarLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, token, logout: authLogout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAlertsOpen, setIsAlertsOpen] = useState(false);
    const [alertCount, setAlertCount] = useState(0);
    const [restaurantName, setRestaurantName] = useState(user?.restaurant_name || localStorage.getItem('restaurant_name') || 'Restaurant OS');

    useEffect(() => {
        if (user?.restaurant_name) {
            setRestaurantName(user.restaurant_name);
        }
    }, [user]);

    const userRole = (user?.role || 'admin').toLowerCase();

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
        { id: '/admin/dashboard', label: 'Analytics', icon: '📊', roles: ['admin', 'super_admin', 'manager'] },
        { id: '/admin/pos', label: 'New Order (POS)', icon: '🖥️', roles: ['admin', 'super_admin', 'manager', 'cashier', 'waiter'] },
        { id: '/admin/history', label: 'Order History', icon: '🕒', roles: ['admin', 'super_admin', 'manager', 'cashier', 'chef', 'waiter'] },
        { id: '/admin/kitchen', label: 'Kitchen & Prep', icon: '🍳', roles: ['admin', 'super_admin', 'manager', 'chef'] },
        { id: '/admin/stock', label: 'Raw Stock', icon: '🥕', roles: ['admin', 'super_admin', 'manager', 'inventory'] },
        { id: '/admin/menu-inventory', label: 'Menu Inventory', icon: '🍔', roles: ['admin', 'super_admin', 'manager', 'inventory'] },
        { id: '/admin/expenses', label: 'Expenses', icon: '💰', roles: ['admin', 'super_admin', 'manager'] },
        { id: '/admin/marketing', label: 'Marketing', icon: '📣', roles: ['admin', 'super_admin', 'manager'] },
        { id: '/admin/tables', label: 'Tables Management', icon: '🪑', roles: ['admin', 'super_admin', 'manager', 'cashier', 'waiter'] },
        { id: '/admin/qr', label: 'QR Ordering', icon: '📱', roles: ['admin', 'super_admin', 'manager', 'cashier'] },
        { id: '/admin/printers', label: 'Printers', icon: '🖨️', roles: ['admin', 'super_admin'] },
    ].filter(item => !(item.id === '/admin/tables' && user?.restaurant_type === 'WALK_IN'));

    const handleNavigation = (path) => {
        navigate(path);
        setIsMobileMenuOpen(false);
    };

    const handleLogout = () => {
        authLogout();
        navigate('/login');
    };

    return (
        <div className="flex-1 bg-neutral flex flex-col lg:flex-row overflow-hidden relative min-h-0">
            {/* Mobile Header */}
            <div className="lg:hidden h-16 bg-white shadow-premium z-20 px-4 py-3 flex justify-between items-center flex-none border-b border-neutral-border">
                <span className="font-bold text-lg text-primary truncate pr-4">{restaurantName}</span>
                <Button size="sm" variant="outline" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? '✕' : '☰'}
                </Button>
            </div>

            <aside className={`
                fixed inset-y-0 left-0 z-[60] w-64 bg-primary text-white transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static h-full flex flex-col flex-none
                ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
            `}>
                <div className="p-6 border-b border-white/10 flex flex-none justify-between items-center">
                    <h1 className="text-xl font-bold truncate pr-4 text-white tracking-tight">{restaurantName}</h1>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setIsAlertsOpen(true)}
                            className="relative p-2 text-white/60 hover:text-white transition-colors"
                        >
                            <span className="text-xl">🔔</span>
                            {alertCount > 0 && (
                                <span className="absolute top-1 right-1 bg-error text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                    {alertCount}
                                </span>
                            )}
                        </button>
                        <button className="lg:hidden text-white/40 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>✕</button>
                    </div>
                </div>

                <StockAlerts isOpen={isAlertsOpen} onClose={() => setIsAlertsOpen(false)} />

                <nav className="flex-1 min-h-0 overflow-y-auto p-4 space-y-1 custom-scrollbar overscroll-contain">
                    {menuItems.map(item => {
                        const hasAccess = !item.roles || item.roles.includes(userRole);
                        const isActive = location.pathname === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => hasAccess ? handleNavigation(item.id) : null}
                                disabled={!hasAccess}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-[6px] transition-all ${isActive
                                    ? 'bg-secondary text-white shadow-premium font-semibold'
                                    : hasAccess
                                        ? 'text-white/70 hover:bg-white/5 hover:text-white'
                                        : 'text-white/30 cursor-not-allowed grayscale'
                                    }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <span className="text-xl">{item.icon}</span>
                                    <span className="text-sm font-medium">{item.label}</span>
                                </div>
                                {!hasAccess && <span className="text-xs">🔒</span>}
                            </button>
                        );
                    })}

                    {userRole === 'super_admin' && (
                        <div className="pt-4 mt-4 border-t border-white/10">
                            <button
                                onClick={() => handleNavigation('/super-admin/dashboard')}
                                className="w-full flex items-center space-x-3 px-4 py-3 rounded-[6px] text-warning hover:bg-white/5 transition-colors"
                            >
                                <span className="text-xl">🏠</span>
                                <span className="font-medium text-[13px]">Super Admin Portal</span>
                            </button>
                        </div>
                    )}
                </nav>

                <div className="p-3 bg-primary border-t border-white/10 flex-none z-10">
                    <div className="flex items-center justify-between px-2 bg-white/5 rounded-xl p-2 border border-white/5">
                        <div className="flex items-center space-x-2 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold flex-none text-xs text-white">
                                {userRole === 'super_admin' ? 'SA' : 'AD'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold truncate text-white capitalize">
                                    {userRole.replace('_', ' ')}
                                </p>
                                <p className="text-[10px] text-white/50 truncate">Staff Member</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            title="Log Out"
                            className="p-2 rounded-[6px] bg-white/5 hover:bg-error/20 hover:text-error text-white/40 transition-all ml-2 flex-none border border-white/10"
                        >
                            <span className="text-sm">🔒</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-neutral h-full relative overflow-hidden">
                {children}
            </div>

            {/* Overlay for mobile menu */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-primary/80 backdrop-blur-sm z-[55] lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </div>
    );
};

export default SidebarLayout;
