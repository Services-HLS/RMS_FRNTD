import React, { useState } from 'react';
import { StockManager, MenuInventoryManager, OrderHistory } from '../components/features/admin'; // Reuse components
import { KitchenOrderView } from '../components/features/kitchen';
import { Button } from '../components/ui';

const KitchenDashboard = () => {
    const [activeTab, setActiveTab] = useState('orders');

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Kitchen Display & Inventory</h1>
                    <div className="space-x-4">
                        <Button
                            variant={activeTab === 'orders' ? 'primary' : 'secondary'}
                            onClick={() => setActiveTab('orders')}
                        >
                            Active Orders
                        </Button>
                        <Button
                            variant={activeTab === 'menu-inventory' ? 'primary' : 'secondary'}
                            onClick={() => setActiveTab('menu-inventory')}
                        >
                            Menu Stock
                        </Button>
                        <Button
                            variant={activeTab === 'stock' ? 'primary' : 'secondary'}
                            onClick={() => setActiveTab('stock')}
                        >
                            Raw Materials
                        </Button>
                        <Button
                            variant={activeTab === 'history' ? 'primary' : 'secondary'}
                            onClick={() => setActiveTab('history')}
                        >
                            History
                        </Button>
                    </div>
                </div>

                {activeTab === 'orders' && <KitchenOrderView />}
                {activeTab === 'menu-inventory' && <MenuInventoryManager />}
                {activeTab === 'stock' && <StockManager />}
                {activeTab === 'history' && <OrderHistory />}
            </div>
        </div>
    );
};

export default KitchenDashboard;
