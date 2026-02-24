export const MOCK_RESTAURANT = {
    id: 1,
    name: "Spicy Bites",
    type: "DINE_IN",
    logo_url: "https://via.placeholder.com/150",
};

export const MOCK_TABLES = [
    { id: 1, sequence_no: 1, display_name: "Table 1", status: "AVAILABLE" },
    { id: 2, sequence_no: 2, display_name: "Table 2", status: "OCCUPIED" },
    { id: 3, sequence_no: 3, display_name: "Table 3", status: "AVAILABLE" },
];

export const MOCK_MENU = [
    {
        id: 1,
        name: "Paneer Butter Masala",
        price: 250,
        category: "Main Course",
        description: "Cottage cheese in rich tomato gravy",
        is_available: true,
        quantity: 50, // New: Daily serving count
        low_stock_threshold: 10,
    },
    {
        id: 2,
        name: "Butter Naan",
        price: 40,
        category: "Breads",
        description: "Tandoor baked bread with butter",
        is_available: true,
        quantity: 100,
        low_stock_threshold: 20,
    },
    {
        id: 3,
        name: "Jeera Rice",
        price: 150,
        category: "Rice",
        description: "Basmati rice flavored with cumin",
        is_available: true,
        quantity: 40,
        low_stock_threshold: 10,
    },
];

export const MOCK_QR_CODES = [
    { id: 1, table_id: 1, design_theme: "classic", status: "ACTIVE" },
    { id: 2, table_id: 2, design_theme: "modern", status: "ACTIVE" },
];

export const MOCK_PRINTERS = [
    { id: 1, name: "Kitchen Printer", status: "ONLINE", is_active: true },
    { id: 2, name: "Bar Printer", status: "OFFLINE", is_active: true },
];

export const MOCK_ORDERS = [
    {
        id: 101,
        table_id: 2,
        status: "PREPARING",
        total_amount: 540,
        payment_status: "PENDING",
        payment_method: "CASH",
        items: [
            { id: 1, name: "Paneer Butter Masala", qty: 2, price: 250 },
            { id: 2, name: "Butter Naan", qty: 1, price: 40 },
        ],
        created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    },
    {
        id: 102,
        table_id: 1,
        status: "CLOSED",
        total_amount: 150,
        payment_status: "PAID",
        payment_method: "ONLINE",
        items: [
            { id: 3, name: "Jeera Rice", qty: 1, price: 150 },
        ],
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    },
];

export const MOCK_STOCK = [ // Renamed from INVENTORY
    { id: 1, name: "Paneer", unit: "kg", quantity: 5.5, low_stock_threshold: 2 },
    { id: 2, name: "Butter", unit: "kg", quantity: 1.2, low_stock_threshold: 1 },
    { id: 3, name: "Basmati Rice", unit: "kg", quantity: 25, low_stock_threshold: 5 },
    { id: 4, name: "Tomato", unit: "kg", quantity: 8, low_stock_threshold: 3 },
    { id: 5, name: "Cream", unit: "liter", quantity: 0.5, low_stock_threshold: 1 },
];

export const MOCK_MARKETING = [
    { id: 1, type: "WELCOME", content: "Welcome to Spicy Bites! Try our new Paneer Tikka.", active: true },
    { id: 2, type: "STORY", content: "Did you know? Our spices are freshly ground every morning!", active: true },
    { id: 3, type: "SUGGESTION", content: "Butter Naan goes great with Paneer Butter Masala.", active: true },
    { id: 4, type: "ORDER_READY", content: "Wow! Your order is ready. Enjoy the fresh taste!", active: true },
];

export const MOCK_EXPENSES = [
    { id: 1, category: 'Groceries', amount: 5000, description: 'Weekly vegetables', date: '2023-10-25' },
    { id: 2, category: 'Utilities', amount: 1200, description: 'Gas refill', date: '2023-10-26' },
];

export const MOCK_KOT_JOBS = [];
