import axios from "axios";

// ─── Axios instance ────────────────────────────────────────────────────────────
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token from localStorage on every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Real API ──────────────────────────────────────────────────────────────────
const api = {
  // Auth
  login: async (credentials) => {
    const { data } = await axiosInstance.post("/auth/login", credentials);
    return data; // { token, user }
  },
  superAdminLogin: async (credentials) => {
    const { data } = await axiosInstance.post("/auth/login", credentials);
    return data; // { token, user }
  },

  // Restaurants
  getRestaurants: async () => {
    const { data } = await axiosInstance.get("/restaurants");
    return data;
  },
  createRestaurant: async (restaurantData) => {
    let headers = {};
    if (restaurantData instanceof FormData) {
      headers['Content-Type'] = 'multipart/form-data';
    }
    const { data } = await axiosInstance.post("/restaurants", restaurantData, { headers });
    return data;
  },
  getRestaurant: async (id = 1) => {
    const { data } = await axiosInstance.get("/restaurants");
    return data.find((r) => r.id === id) || data[0];
  },
  deleteRestaurant: async (id) => {
    const { data } = await axiosInstance.delete(`/restaurants/${id}`);
    return data;
  },

  // Helper to get current restaurant ID
  getCurrentRestaurantId: () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (user && user.restaurant_id) return user.restaurant_id;
    return localStorage.getItem("restaurant_id") || 1;
  },

  // Menu Inventory
  getMenu: async (restaurantId) => {
    const rid = restaurantId || api.getCurrentRestaurantId();
    const { data } = await axiosInstance.get(`/inventory/menu/${rid}`);
    return data;
  },
  getCategories: async (restaurantId) => {
    const rid = restaurantId || api.getCurrentRestaurantId();
    const { data } = await axiosInstance.get(`/inventory/categories/${rid}`);
    return data;
  },
  updateMenuItem: async (id, updates) => {
    const { data } = await axiosInstance.patch(
      `/inventory/menu/${id}`,
      updates,
    );
    return data;
  },
  addMenuItem: async (item) => {
    const { data } = await axiosInstance.post("/inventory/menu", {
      restaurant_id: api.getCurrentRestaurantId(),
      ...item,
    });
    return data;
  },
  deleteMenuItem: async (id) => {
    const { data } = await axiosInstance.delete(`/inventory/menu/${id}`);
    return data;
  },

  // Stock (Raw Materials)
  getStock: async (restaurantId) => {
    const rid = restaurantId || api.getCurrentRestaurantId();
    const { data } = await axiosInstance.get(`/inventory/stock/${rid}`);
    return data;
  },
  updateStock: async (itemId, quantity) => {
    const { data } = await axiosInstance.patch(`/inventory/stock/${itemId}`, {
      quantity,
    });
    return data;
  },
  addStock: async (stockItem) => {
    const { data } = await axiosInstance.post("/inventory/stock", {
      restaurant_id: api.getCurrentRestaurantId(),
      ...stockItem,
    });
    return data;
  },

  // Tables
  getTables: async (restaurantId) => {
    const rid = restaurantId || api.getCurrentRestaurantId();
    const { data } = await axiosInstance.get(`/tables/${rid}`);
    return data;
  },
  createTable: async (tableData) => {
    const { data } = await axiosInstance.post("/tables", {
      restaurant_id: api.getCurrentRestaurantId(),
      ...tableData,
    });
    return data;
  },
  updateTableStatus: async (tableId, status) => {
    const { data } = await axiosInstance.patch(`/tables/${tableId}/status`, {
      status,
    });
    return data;
  },
  deleteTable: async (tableId) => {
    const { data } = await axiosInstance.delete(`/tables/${tableId}`);
    return data;
  },

  // Orders
  createOrder: async (orderData) => {
    const { data } = await axiosInstance.post("/orders", {
      restaurant_id: api.getCurrentRestaurantId(),
      type: orderData.type || (orderData.table_id ? "DINE_IN" : "WALK_IN"),
      order_date: new Date().toISOString().split("T")[0],
      order_source: orderData.order_source || 'COUNTER',
      ...orderData,
    });
    return data;
  },
  getOrders: async (restaurantId) => {
    const rid = restaurantId || api.getCurrentRestaurantId();
    const { data } = await axiosInstance.get(`/orders/active/${rid}`);
    return data;
  },
  getAllOrders: async (restaurantId) => {
    const rid = restaurantId || api.getCurrentRestaurantId();
    const { data } = await axiosInstance.get(`/orders/all/${rid}`);
    return data;
  },
  getOrderStatus: async (orderId) => {
    const rid = api.getCurrentRestaurantId();
    const { data } = await axiosInstance.get(`/orders/all/${rid}`);
    return data.find((o) => o.id === parseInt(orderId)) || null;
  },
  updateOrderStatus: async (orderId, status) => {
    const { data } = await axiosInstance.patch(`/orders/${orderId}/status`, {
      status,
    });
    return data;
  },
  cancelOrder: async (orderId) => {
    const { data } = await axiosInstance.patch(`/orders/${orderId}/status`, {
      status: "CANCELLED",
    });
    return data;
  },
  updateOrderItems: async (orderId, items, total_amount) => {
    const { data } = await axiosInstance.put(`/orders/${orderId}/items`, {
      items,
      total_amount,
    });
    return data;
  },
  deleteOrder: async (orderId) => {
    const { data } = await axiosInstance.delete(`/orders/${orderId}`);
    return data;
  },
  processPayment: async (orderId, method) => {
    const { data } = await axiosInstance.patch(`/orders/${orderId}/status`, {
      payment_method: method,
      payment_status: "COMPLETED",
    });
    return data;
  },

  // Expenses
  getExpenses: async (restaurantId, date) => {
    const rid = restaurantId || api.getCurrentRestaurantId();
    const params = date ? { date } : {};
    const { data } = await axiosInstance.get(`/expenses/${rid}`, {
      params,
    });
    return data;
  },
  addExpense: async (expense) => {
    const { data } = await axiosInstance.post("/expenses", {
      restaurant_id: api.getCurrentRestaurantId(),
      ...expense,
    });
    return data;
  },

  // Marketing
  getMarketingMessages: async (restaurantId) => {
    const rid = restaurantId || api.getCurrentRestaurantId();
    const { data } = await axiosInstance.get(`/marketing/${rid}`);
    return data;
  },
  toggleMarketingMessage: async (id) => {
    const { data } = await axiosInstance.patch(`/marketing/${id}/toggle`);
    return data;
  },
  addMarketingMessage: async (message) => {
    const { data } = await axiosInstance.post("/marketing", {
      restaurant_id: api.getCurrentRestaurantId(),
      ...message,
    });
    return data;
  },

  // Analytics — derived from orders
  getAnalytics: async (restaurantId) => {
    const rid = restaurantId || api.getCurrentRestaurantId();
    const { data: orders } = await axiosInstance.get(`/orders/active/${rid}`);
    return {
      total_orders: orders.length,
      revenue: orders.reduce(
        (acc, o) =>
          acc + (o.payment_status === "PAID" ? Number(o.total_amount) : 0),
        0,
      ),
      active_tables: orders.filter((o) =>
        ["ORDERED", "PREPARING", "READY"].includes(o.status),
      ).length,
      popular_items: [],
    };
  },

  // QR Codes & Printers — not yet in backend
  getQRCodes: async () => [],
  generateQR: async (qrData) => ({
    ...qrData,
    id: Date.now(),
    status: "ACTIVE",
  }),
  getPrinters: async (restaurantId) => {
    const rid = restaurantId || api.getCurrentRestaurantId();
    // Implementation for printers can be added here
    return [];
  },
  getActiveKOTs: async (restaurantId, includeCompleted = false) => {
    const rid = restaurantId || api.getCurrentRestaurantId();
    const { data } = await axiosInstance.get(`/orders/kot/${rid}/active`, {
      params: { include_completed: includeCompleted }
    });
    return data;
  },
  updateKOTStatus: async (kotId, status) => {
    const { data } = await axiosInstance.patch(`/orders/kot/${kotId}/status`, {
      status,
    });
    return data;
  },
  createKOTJob: async (orderId) => {
    // This is now automatically handled by the backend on order creation,
    // but we can keep a manual trigger for re-printing if needed.
    const { data } = await axiosInstance.post("/orders/kot/reprint", { order_id: orderId });
    return data;
  },
  // Admin Management (Super Admin)
  getAdmins: async (restaurantId) => {
    const { data } = await axiosInstance.get(`/admins/${restaurantId}`);
    return data;
  },
  createAdmin: async (adminData) => {
    const { data } = await axiosInstance.post("/admins", adminData);
    return data;
  },
  updateAdmin: async (id, adminData) => {
    const { data } = await axiosInstance.patch(`/admins/${id}`, adminData);
    return data;
  },
  deleteAdmin: async (id) => {
    const { data } = await axiosInstance.delete(`/admins/${id}`);
    return data;
  },
  getRoles: async () => {
    const { data } = await axiosInstance.get("/roles");
    return data;
  },
  getCustomerIdentities: async (phone, restaurantId) => {
    const rid = restaurantId || api.getCurrentRestaurantId();
    const { data } = await axiosInstance.get(`/orders/customer-identities/${rid}/${phone}`);
    return data;
  },
};

export default api;
