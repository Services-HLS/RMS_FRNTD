import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AdminLogin, AdminDashboard, SuperAdminLogin, SuperAdminDashboard, CustomerMenu, OrderTracking, KitchenDashboard } from './pages';
import { SidebarLayout, AdminPOS, ExpensesManager, OrderHistory, StockManager, MenuInventoryManager, MarketingManager, TableManager, QRGenerator, PrinterStatus } from './components/features/admin';
import { CartProvider } from './context/CartContext';

// Admin Layout Wrapper
const AdminLayout = () => (
  <SidebarLayout>
    <Outlet />
  </SidebarLayout>
);

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/admin/login" replace />} />

          {/* Super Admin Routes */}
          <Route path="/super-admin/login" element={<SuperAdminLogin />} />
          <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />

          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Routes with Sidebar */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="pos" element={<AdminPOS />} />
            <Route path="history" element={<OrderHistory />} />
            <Route path="stock" element={<StockManager />} />
            <Route path="menu-inventory" element={<MenuInventoryManager />} />
            <Route path="expenses" element={<ExpensesManager />} />
            <Route path="marketing" element={<MarketingManager />} />
            <Route path="tables" element={<TableManager />} />
            <Route path="qr" element={<QRGenerator />} />
            <Route path="printers" element={<PrinterStatus />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          <Route path="/kitchen" element={<KitchenDashboard />} />

          {/* Customer Routes */}
          <Route path="/menu" element={<CustomerMenu />} />
          <Route path="/order/:orderId" element={<OrderTracking />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
