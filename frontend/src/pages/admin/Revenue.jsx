import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loader from '../../components/ui/Loader';
import { 
    DollarSign, 
    ArrowUpRight, 
    Users, 
    TrendingUp, 
    Clock, 
    Activity,
    CreditCard,
    PieChart
} from 'lucide-react';
import { motion } from 'framer-motion';

const Revenue = () => {
    const [analytics, setAnalytics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get('/leads/analytics/revenue');
                setAnalytics(res.data);
            } catch (err) {
                console.error('Failed to load revenue analytics', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader size={40} text="Calculating metrics..." />
            </div>
        );
    }

    const stats = [
        {
            label: 'Total Revenue (Won)',
            value: `₹${analytics?.totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            color: 'text-blue-600',
            bg: 'bg-blue-100'
        },
        {
            label: 'Collected Amount',
            value: `₹${analytics?.receivedRevenue.toLocaleString()}`,
            icon: CreditCard,
            color: 'text-green-600',
            bg: 'bg-green-100'
        },
        {
            label: 'Pending Balance',
            value: `₹${analytics?.pendingRevenue.toLocaleString()}`,
            icon: Clock,
            color: 'text-amber-600',
            bg: 'bg-amber-100'
        },
        {
            label: 'Conversion Rate',
            value: `${analytics?.conversionRate}%`,
            icon: TrendingUp,
            color: 'text-purple-600',
            bg: 'bg-purple-100'
        }
    ];

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-serif font-bold tracking-tight">Revenue Dashboard</h1>
                <p className="text-muted-foreground mt-2">Insights into your business growth and financial health.</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-card border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <Activity className="h-4 w-4 text-muted-foreground/30" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                        <h3 className="text-2xl font-bold mt-1 tracking-tight">{stat.value}</h3>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Lead Pipeline Overview */}
                <div className="lg:col-span-2 bg-card border rounded-3xl p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold font-serif">Lead Distribution</h3>
                            <p className="text-sm text-muted-foreground">Volume across different acquisition channels.</p>
                        </div>
                        <Users className="h-5 w-5 text-muted-foreground" />
                    </div>

                    <div className="space-y-6">
                        {Object.entries(analytics?.leadsBySource || {}).map(([source, count], i) => (
                            <div key={source} className="space-y-2">
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="capitalize">{source} Leads</span>
                                    <span>{count} ({Math.round((count / analytics.totalLeads) * 100) || 0}%)</span>
                                </div>
                                <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(count / analytics.totalLeads) * 100}%` }}
                                        transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                                        className={`h-full rounded-full ${
                                            source === 'manual' ? 'bg-blue-500' : 
                                            source === 'contact' ? 'bg-primary' : 'bg-purple-500'
                                        }`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 pt-8 border-t flex items-center justify-around text-center">
                        <div>
                            <p className="text-2xl font-bold">{analytics?.totalLeads}</p>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">Total Leads</p>
                        </div>
                        <div className="h-8 border-r"></div>
                        <div>
                            <p className="text-2xl font-bold text-primary">{analytics?.wonLeadsCount}</p>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">Won Deals</p>
                        </div>
                    </div>
                </div>

                {/* Conversion Logic Card */}
                <div className="bg-primary text-primary-foreground rounded-3xl p-8 shadow-xl shadow-primary/10 flex flex-col justify-between">
                    <div>
                        <PieChart className="h-10 w-10 mb-6 opacity-80" />
                        <h3 className="text-2xl font-serif font-bold mb-4">Business Efficiency</h3>
                        <p className="text-primary-foreground/80 leading-relaxed">
                            Your conversion rate is <strong>{analytics?.conversionRate}%</strong>. 
                            {parseFloat(analytics?.conversionRate) > 50 
                                ? " You are performing significantly above average for the photography industry!" 
                                : " There is potential to improve follow-up strategies to boost these numbers."}
                        </p>
                    </div>
                    
                    <button 
                        onClick={() => window.location.href='/admin/crm'}
                        className="mt-8 bg-white text-primary font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform active:scale-95 shadow-lg"
                    >
                        Optimize Pipeline <ArrowUpRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Revenue;
