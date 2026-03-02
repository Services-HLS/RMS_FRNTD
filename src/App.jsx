import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AdminLogin, AdminDashboard, SuperAdminLogin, SuperAdminDashboard, CustomerMenu, OrderTracking, KitchenDashboard } from './pages';
import { SidebarLayout, AdminPOS, ExpensesManager, OrderHistory, StockManager, MenuInventoryManager, MarketingManager, TableManager, QRGenerator, PrinterStatus } from './components/features/admin';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { CartProvider } from './context/CartContext';
import { useAuth } from './context/AuthContext';

// Access Denied Component
const LockedPage = () => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
      <span className="text-5xl">🔒</span>
    </div>
    <h2 className="text-3xl font-bold text-slate-800">Access Restricted</h2>
    <p className="text-slate-500 mt-4 max-w-md mx-auto leading-relaxed">
      Your account role doesn't have permissions to access this module.
      Please contact your Super Admin if you believe this is an error.
    </p>
  </div>
);

// Role-based Route Protection
const RoleProtectedRoute = ({ children, allowedRoles, requireDineIn }) => {
  const { user, token } = useAuth();

  if (!token || !user || !user.role) {
    return <Navigate to="/login" replace />;
  }

  const role = String(user.role).toLowerCase();

  // If a given feature requires Dine-In mode, auto-lock QSR / Takeaway (WALK_IN) users out.
  if (requireDineIn && user.restaurant_type === 'WALK_IN') {
    return <LockedPage />;
  }

  if (allowedRoles && !allowedRoles.map(r => r.toLowerCase()).includes(role)) {
    return <LockedPage />;
  }

  return children;
};

// Helper to redirect to first available page
const AdminLandingRedirect = () => {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase();
  if (role === 'cashier') return <Navigate to="/admin/pos" replace />;
  if (role === 'chef') return <Navigate to="/admin/kitchen" replace />;
  if (role === 'inventory') return <Navigate to="/admin/stock" replace />;
  if (role === 'waiter' && user?.restaurant_type !== 'WALK_IN') return <Navigate to="/admin/tables" replace />;
  return <Navigate to="dashboard" replace />;
};

// Main Layout Wrapper
const MainLayout = ({ children }) => {
  const { token, user } = useAuth();
  const location = useLocation();
  // If user is logged in and on an admin/kitchen route, the Header is rendered inside those layouts instead
  const isInternal = token && user && (location.pathname.startsWith('/admin') || location.pathname.startsWith('/kitchen') || location.pathname.startsWith('/super-admin'));

  // Entirely remove Header/Footer from standard rendering specifically for login screen for a strictly isolated full-screen theme view
  const isIsolatedTheme = location.pathname.startsWith('/login') || location.pathname.startsWith('/super-admin/login');

  return (
    <div className={`flex flex-col bg-slate-50 ${isInternal ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      {!isInternal && !isIsolatedTheme && <Header />}
      <main className={`flex-1 flex flex-col ${isInternal ? 'overflow-hidden' : ''}`}>
        {children}
      </main>
      {!isInternal && !isIsolatedTheme && <Footer />}
    </div>
  );
};

// Admin Layout Wrapper
const AdminLayout = () => (
  <SidebarLayout>
    <Header />
    <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col min-w-0">
      <div className="w-full flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </div>
      <div className="flex-shrink-0">
        <Footer />
      </div>
    </div>
  </SidebarLayout>
);

function App() {
  return (
    <CartProvider>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/kitchen" element={<Navigate to="/admin/kitchen" replace />} />
            <Route path="/login" element={<AdminLogin />} />

            {/* Super Admin Routes */}
            <Route
              path="/super-admin/dashboard"
              element={
                <RoleProtectedRoute allowedRoles={["super_admin"]}>
                  <div className="flex flex-col h-full bg-slate-50 relative min-w-0">
                    <Header />
                    <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col min-w-0">
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
                        <SuperAdminDashboard />
                      </div>
                      <div className="flex-shrink-0">
                        <Footer />
                      </div>
                    </div>
                  </div>
                </RoleProtectedRoute>
              }
            />

            {/* Protected Admin Routes with Sidebar */}
            <Route
              path="/admin"
              element={
                <RoleProtectedRoute allowedRoles={["admin", "super_admin", "manager", "cashier", "inventory", "chef", "waiter"]}>
                  <AdminLayout />
                </RoleProtectedRoute>
              }
            >
              <Route path="dashboard" element={
                <RoleProtectedRoute allowedRoles={["admin", "super_admin", "manager"]}>
                  <AdminDashboard />
                </RoleProtectedRoute>
              } />
              <Route path="pos" element={
                <RoleProtectedRoute allowedRoles={["admin", "super_admin", "manager", "cashier", "waiter"]}>
                  <AdminPOS />
                </RoleProtectedRoute>
              } />
              <Route path="history" element={
                <RoleProtectedRoute allowedRoles={["admin", "super_admin", "manager", "cashier", "chef", "waiter"]}>
                  <OrderHistory />
                </RoleProtectedRoute>
              } />
              <Route path="stock" element={
                <RoleProtectedRoute allowedRoles={["admin", "super_admin", "manager", "inventory"]}>
                  <StockManager />
                </RoleProtectedRoute>
              } />
              <Route path="menu-inventory" element={
                <RoleProtectedRoute allowedRoles={["admin", "super_admin", "manager", "inventory"]}>
                  <MenuInventoryManager />
                </RoleProtectedRoute>
              } />
              <Route path="expenses" element={
                <RoleProtectedRoute allowedRoles={["admin", "super_admin", "manager"]}>
                  <ExpensesManager />
                </RoleProtectedRoute>
              } />
              <Route path="marketing" element={
                <RoleProtectedRoute allowedRoles={["admin", "super_admin", "manager"]}>
                  <MarketingManager />
                </RoleProtectedRoute>
              } />
              <Route path="tables" element={
                <RoleProtectedRoute allowedRoles={["admin", "super_admin", "manager", "cashier", "waiter"]} requireDineIn={true}>
                  <TableManager />
                </RoleProtectedRoute>
              } />
              <Route path="qr" element={
                <RoleProtectedRoute allowedRoles={["admin", "super_admin", "manager", "cashier"]} requireDineIn={true}>
                  <QRGenerator />
                </RoleProtectedRoute>
              } />
              <Route path="printers" element={
                <RoleProtectedRoute allowedRoles={["admin", "super_admin"]}>
                  <PrinterStatus />
                </RoleProtectedRoute>
              } />
              <Route path="kitchen" element={
                <RoleProtectedRoute allowedRoles={["admin", "super_admin", "chef"]}>
                  <KitchenDashboard />
                </RoleProtectedRoute>
              } />
              <Route index element={<AdminLandingRedirect />} />
            </Route>

            {/* Customer Routes */}
            <Route path="/menu" element={<CustomerMenu />} />
            <Route path="/order/:orderId" element={<OrderTracking />} />
          </Routes>
        </MainLayout>
      </Router>
    </CartProvider>
  );
}

export default App;
