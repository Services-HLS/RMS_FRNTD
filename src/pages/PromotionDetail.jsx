import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader, Button } from '../components/ui';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import api from '../services/api';

const PromotionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [promo, setPromo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPromo = async () => {
            try {
                // Fetch all promos for the current restaurant and find the one with this ID
                const promos = await api.getMarketingMessages();
                const found = promos.find(p => String(p.id) === String(id));
                setPromo(found);
            } catch (error) {
                console.error("Failed to fetch promotion", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPromo();
    }, [id]);

    if (loading) return <div className="h-screen flex items-center justify-center bg-neutral"><Loader /></div>;
    if (!promo) return (
        <div className="h-screen flex flex-col items-center justify-center space-y-4 bg-neutral">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Promotion Not Found</h2>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
    );

    const getThemeColor = (type) => {
        switch(type) {
            case 'WELCOME': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            case 'STORY': return 'text-amber-600 bg-amber-50 border-amber-100';
            case 'SUGGESTION': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
            default: return 'text-slate-600 bg-slate-50 border-slate-100';
        }
    };

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-neutral min-h-screen relative overflow-y-auto custom-scrollbar">
            <Header isCustomerMode={true} />
            
            <main className="max-w-4xl mx-auto px-6 py-12 w-full flex-1 flex flex-col items-center">
                {/* Back Button */}
                <button 
                    onClick={() => navigate(-1)}
                    className="self-start mb-12 flex items-center text-slate-400 hover:text-primary font-bold text-xs uppercase tracking-widest transition-colors group"
                >
                    <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
                    Back to Menu
                </button>

                {/* Hero Section */}
                <div className={`w-full p-8 md:p-16 rounded-[40px] mb-12 flex flex-col items-center text-center space-y-6 shadow-premium border ${getThemeColor(promo.type)}`}>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-white/50 backdrop-blur-md px-4 py-1.5 rounded-full shadow-inner border border-white/50">
                        {promo.type}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 leading-[0.9]">
                        {promo.title || 'Special Promotion'}
                    </h1>
                    <div className="w-24 h-1.5 bg-slate-900/10 rounded-full"></div>
                </div>

                {/* Content Section */}
                <div className="w-full bg-white rounded-[40px] p-8 md:p-12 shadow-premium border border-neutral-border space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="prose prose-slate max-w-none">
                        <p className="text-[17px] md:text-[19px] text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                            {promo.description || promo.content}
                        </p>
                    </div>
                    
                    <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Posted On</span>
                            <span className="text-[13px] font-bold text-slate-700">{new Date(promo.created_at || Date.now()).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                        <Button 
                            className="bg-primary text-white px-10 py-4 h-auto rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all text-xs"
                            onClick={() => navigate(-1)}
                        >
                            Get Started Now
                        </Button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PromotionDetail;
