import React, { useState, useEffect } from 'react';
import { useCart } from '../../../context/CartContext';
import { Button, Loader, Card } from '../../ui';
import api from '../../../services/api';

const MenuBrowser = () => {
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const data = await api.getMenu();
                setMenu(data);
            } catch (error) {
                console.error("Failed to fetch menu", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMenu();
    }, []);

    const categories = ['All', ...new Set(menu.map((item) => item.category_name || item.category))];

    const filteredMenu =
        activeCategory === 'All'
            ? menu
            : menu.filter((item) => (item.category_name || item.category) === activeCategory);

    if (loading) return <Loader />;

    return (
        <div>
            {/* Category Filter */}
            <div className="flex overflow-x-auto pb-4 mb-4 gap-2 no-scrollbar">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${activeCategory === category
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 gap-4">
                {filteredMenu.map((item) => (
                    <Card key={item.id} className="flex justify-between items-center p-4">
                        <div className="flex-1">
                            <h4 className="text-lg font-bold text-gray-900">{item.name}</h4>
                            <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                            <div className="flex items-center gap-3 mt-1">
                                <p className="text-blue-600 font-semibold">₹{item.price}</p>
                                {item.waiting_time_minutes > 0 && (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-full px-2 py-0.5">
                                        ⏱ {item.waiting_time_minutes} min
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="ml-4">
                            <Button size="sm" onClick={() => addToCart(item)} className="px-3 py-1 text-sm">
                                Add
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default MenuBrowser;
