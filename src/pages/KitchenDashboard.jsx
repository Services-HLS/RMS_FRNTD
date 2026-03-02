import React from 'react';
import { KitchenOrderView } from '../components/features/kitchen';

const KitchenDashboard = () => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Kitchen Display System (KDS)</h1>
                    <p className="text-slate-500 font-medium tracking-wide mt-1">Real-time order tracking and preparation queue</p>
                </div>

                <div className="flex items-center space-x-2 bg-white rounded-xl p-1.5 border border-slate-200 shadow-sm">
                    <div className="flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-lg font-bold text-sm">
                        <span className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
                        Live Sync
                    </div>
                </div>
            </div>

            <div className="bg-slate-200/50 h-px w-full my-4"></div>

            {/* Main Board */}
            <KitchenOrderView />
        </div>
    );
};

export default KitchenDashboard;
