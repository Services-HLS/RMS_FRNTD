import React, { useState, useEffect } from 'react';
import { useCart } from '../../../context/CartContext';
import { Loader, Card } from '../../ui';
import api from '../../../services/api';

const MenuBrowser = ({ restaurantId }) => {
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const { addToCart, cartItems } = useCart();

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const data = await api.getMenu(restaurantId);
                setMenu(data);
            } catch (error) {
                console.error("Failed to fetch menu", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMenu();
    }, [restaurantId]);

    const categories = ['All', ...new Set(menu.map((item) => item.category_name || item.category))];
    const filteredMenu = activeCategory === 'All'
            ? menu
            : menu.filter((item) => (item.category_name || item.category) === activeCategory);

    if (loading) return <div className="py-20 flex justify-center"><Loader /></div>;

    return (
        <div className="flex flex-col h-full min-h-0">
            {/* Filters */}
            <div className="mb-6 space-y-4">
                <div className="flex space-x-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar scroll-smooth">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`whitespace-nowrap px-5 py-2 rounded-[6px] text-[13px] font-medium transition-all shadow-sm border ${activeCategory === cat
                                ? 'bg-primary text-white border-primary shadow-premium'
                                : 'bg-white text-neutral-muted border-neutral-border hover:border-primary/30 hover:bg-neutral-zebra'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Menu Grid */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
                    {filteredMenu.map((item) => {
                        const cartItem = cartItems.find(ci => ci.id === item.id);
                        return (
                            <Card
                                key={item.id}
                                className="group cursor-pointer !p-0 border border-neutral-border hover:border-secondary transition-all hover:shadow-lg bg-white rounded-[8px] flex flex-col justify-between h-full relative overflow-hidden"
                                onClick={() => addToCart(item)}
                            >
                                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-secondary/10 to-transparent -mr-8 -mt-8 rounded-full opacity-50 transition-transform group-hover:scale-150"></div>

                                <div className="p-4 relative z-10 flex-col flex flex-1">
                                    <div className="mb-3">
                                        <h4 className="text-[14px] font-semibold text-primary leading-tight group-hover:text-secondary transition-colors line-clamp-2">{item.name}</h4>
                                        <div className="flex items-center mt-1.5 space-x-2">
                                            <p className="text-[10px] font-bold tracking-widest text-neutral-muted uppercase">{item.category_name || item.category}</p>
                                            {item.waiting_time_minutes > 0 && (
                                                <div className="text-[9px] bg-warning/10 text-warning font-bold px-1.5 py-0.5 rounded-[4px] border border-warning/10 flex items-center">
                                                    <svg className="w-2.5 h-2.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    {item.waiting_time_minutes}m
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-[12px] text-neutral-muted font-normal line-clamp-2 h-8 mb-4">
                                        {item.description || `Special freshly prepared ${item.name} with premium ingredients.`}
                                    </p>
                                    
                                    <div className="mt-auto pt-3 flex items-center justify-between border-t border-neutral-border/50">
                                        <span className="font-bold text-[16px] text-primary tracking-tight font-sans">₹{item.price}</span>
                                        <div className={`w-8 h-8 rounded-[6px] flex items-center justify-center font-bold text-sm shadow-sm transition-all ${cartItem ? 'bg-secondary text-white' : 'bg-neutral-zebra text-neutral-muted group-hover:bg-primary group-hover:text-white'}`}>
                                            {cartItem ? cartItem.qty : '+'}
                                        </div>
                                    </div>
                                </div>
                                {cartItem && <div className="absolute top-0 left-0 w-1 h-full bg-secondary"></div>}
                            </Card>
                        );
                    })}
                </div>
                {filteredMenu.length === 0 && (
                    <div className="col-span-full border border-dashed border-neutral-border rounded-[8px] flex flex-col items-center justify-center p-16 text-center bg-white shadow-sm">
                        <svg className="w-12 h-12 text-neutral-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <h3 className="text-[15px] font-bold text-primary">No items available</h3>
                        <p className="text-neutral-muted mt-1 text-[13px]">Check back later or select a different category.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
export default MenuBrowser;
