import React, { useState, useEffect } from 'react';
import { Card, Loader } from '../../ui';
import api from '../../../services/api';

const AnalyticsDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const orders = await api.getAllOrders();
            const total_orders = orders.length;
            const active_orders = orders.filter((o) =>
                ["ORDERED", "PREPARING", "READY"].includes(o.status)
            ).length;
            const revenue = orders.reduce((acc, o) => acc + Number(o.total_amount || 0), 0);

            const itemCounts = {};
            orders.forEach(order => {
                if (order.items && Array.isArray(order.items)) {
                    order.items.forEach(item => {
                        const count = Number(item.quantity || 1);
                        if (itemCounts[item.name]) {
                            itemCounts[item.name] += count;
                        } else {
                            itemCounts[item.name] = count;
                        }
                    });
                }
            });

            const popular_items = Object.entries(itemCounts)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 6);

            setStats({
                total_orders,
                revenue,
                active_tables: active_orders,
                popular_items
            });
        } catch (error) {
            console.error("Failed to fetch analytics", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="h-96 flex items-center justify-center">
            <Loader />
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div className="flex items-center justify-between border-b border-neutral-border pb-6">
                <div>
                    <h1 className="text-[20px] font-semibold tracking-tight text-primary">Performance Analytics</h1>
                    <p className="text-neutral-muted text-[13px] font-normal mt-1 tracking-wide">Real-time operational metrics and sales overview.</p>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Revenue Card (Secondary/Green) */}
                <Card className="!p-6 border border-secondary/10 bg-white shadow-premium rounded-[8px] relative overflow-hidden group border-t-4 border-t-secondary">
                    <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                        <svg className="w-32 h-32 text-secondary" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.16-2.88 2.86-3.22V4h2.67v1.91c1.38.36 2.55 1.25 2.76 2.86h-1.99c-.1-1.09-.76-1.87-2.42-1.87-1.49 0-2.32.76-2.32 1.54 0 .75.48 1.39 2.76 1.95 2.68.66 4.09 1.76 4.09 3.84 0 2.05-1.4 3.09-2.92 3.48z" /></svg>
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-secondary text-[11px] font-bold tracking-widest uppercase">Total Revenue</h3>
                            <div className="w-8 h-8 rounded-[6px] bg-secondary/10 flex items-center justify-center text-secondary">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                            </div>
                        </div>
                        <p className="text-3xl font-bold tracking-tight text-primary">₹{stats?.revenue?.toLocaleString() || 0}</p>
                    </div>
                </Card>

                {/* Orders Card (Primary/Charcoal) */}
                <Card className="!p-6 border border-neutral-border bg-white shadow-premium rounded-[8px] relative overflow-hidden group border-t-4 border-t-primary">
                    <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                        <svg className="w-32 h-32 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-primary text-[11px] font-bold tracking-widest uppercase">Gross Orders</h3>
                            <div className="w-8 h-8 rounded-[6px] bg-primary/5 flex items-center justify-center text-primary">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                            </div>
                        </div>
                        <p className="text-3xl font-bold tracking-tight text-primary">{stats?.total_orders?.toLocaleString() || 0}</p>
                    </div>
                </Card>

                {/* Active Operations (Info/Blue) */}
                <Card className="!p-6 border border-info/10 bg-white shadow-premium rounded-[8px] relative overflow-hidden group border-t-4 border-t-info">
                    <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                        <svg className="w-32 h-32 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-info text-[11px] font-bold tracking-widest uppercase">Active Operations</h3>
                            <div className="w-8 h-8 rounded-[6px] bg-info/10 flex items-center justify-center text-info">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                        </div>
                        <p className="text-3xl font-bold tracking-tight text-primary">{stats?.active_tables || 0}</p>
                    </div>
                </Card>
            </div>

            {/* Popular Items Panel */}
            <Card className="border border-neutral-border shadow-premium rounded-[8px] !p-0 overflow-hidden">
                <div className="bg-neutral-zebra px-6 py-4 border-b border-neutral-border">
                    <h2 className="text-[16px] font-semibold tracking-tight text-primary flex items-center">
                        <svg className="w-5 h-5 mr-3 text-secondary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                        Bestselling Menu Items
                    </h2>
                </div>

                {stats?.popular_items && stats.popular_items.length > 0 ? (
                    <div className="divide-y divide-neutral-border bg-white">
                        {stats.popular_items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 hover:bg-neutral-zebra transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 rounded-full bg-neutral-zebra flex items-center justify-center font-bold text-neutral-muted text-sm border border-neutral-border/50">
                                        #{idx + 1}
                                    </div>
                                    <div className="font-semibold text-primary">{item.name}</div>
                                </div>
                                <div className="flex items-center space-x-3 text-sm">
                                    <div className="flex items-center text-neutral-muted font-medium bg-white border border-neutral-border px-3 py-1.5 rounded-[6px] shadow-sm">
                                        <span className="text-primary font-bold text-base mr-1.5">{item.count}</span>
                                        Sales
                                    </div>
                                    {idx === 0 && <span className="bg-secondary text-white text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-[4px] shadow-sm">Top Star</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-16 text-center text-neutral-muted">
                        <div className="text-4xl mb-3 grayscale opacity-20">📊</div>
                        <p className="text-[14px]">No item analytics available yet.</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default AnalyticsDashboard;
