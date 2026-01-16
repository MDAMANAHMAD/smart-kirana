import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
  fetchForecast, fetchMyProducts, fetchRecommendations, fetchOrders,
  fetchVelocityReport, fetchFinancials, fetchExpiryAlerts
} from '../api';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp, AlertTriangle, Package, DollarSign, ArrowRight, Zap,
  Target, BarChart3, ChevronRight, Activity, Percent, Layers, Box,
  PieChart, ArrowDownRight, ArrowUpRight, Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [forecastData, setForecastData] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [velocityData, setVelocityData] = useState([]);
  const [financials, setFinancials] = useState({ revenue: 0, projectedRevenue: 0, loss: 0, netProfit: 0 });
  const [expiryAlerts, setExpiryAlerts] = useState([]);
  const [stats, setStats] = useState({ inventoryValue: 0, lowStock: 0, productsCount: 0 });
  const [orderAnalytics, setOrderAnalytics] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('demand');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          forecastRes, productsRes, recsRes, ordersRes,
          velocityRes, financialsRes, expiryRes
        ] = await Promise.all([
          fetchForecast(user.id).catch(() => ({ data: { forecast: [] } })),
          fetchMyProducts().catch(() => ({ data: [] })),
          fetchRecommendations(user.id).catch(() => ({ data: { rules: [] } })),
          fetchOrders().catch(() => ({ data: [] })),
          fetchVelocityReport().catch(() => ({ data: [] })),
          fetchFinancials().catch(() => ({ data: { revenue: 0, projectedRevenue: 0, loss: 0, netProfit: 0 } })),
          fetchExpiryAlerts().catch(() => ({ data: [] }))
        ]);

        // Robust data processing for charts
        const rawForecast = forecastRes.data?.forecast || [];
        setForecastData(rawForecast.length > 0
          ? rawForecast.map((val, i) => ({
            day: `Day ${i + 1}`,
            sales: Number.isFinite(val) ? Math.round(val) : 0,
            predicted: Number.isFinite(val) ? Math.round(val * 0.9) : 0
          }))
          : [...Array(7)].map((_, i) => ({ day: `Day ${i + 1}`, sales: 0, predicted: 0 }))
        );

        setRecommendations(recsRes.data?.rules || []);
        setVelocityData(velocityRes.data || []);
        setFinancials(financialsRes.data);
        setExpiryAlerts(expiryRes.data || []);

        const products = Array.isArray(productsRes.data) ? productsRes.data : [];
        const lowStock = products.filter(p => p.stock <= (p.minStockThreshold || 10)).length;
        const totalValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);

        setStats({ inventoryValue: totalValue, lowStock, productsCount: products.length });

        // Category Spread
        const catMap = products.reduce((acc, p) => {
          acc[p.category] = (acc[p.category] || 0) + p.stock;
          return acc;
        }, {});
        setCategoryData(Object.keys(catMap).length > 0
          ? Object.entries(catMap).map(([name, value]) => ({ subject: name, A: value, fullMark: 150 }))
          : [{ subject: 'Empty', A: 0, fullMark: 100 }]
        );

        // Order Growth
        const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
        const last7Days = [...Array(7)].map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toLocaleDateString();
        }).reverse();

        setOrderAnalytics(last7Days.map(date => ({
          name: date,
          orders: orders.filter(o => new Date(o.createdAt).toLocaleDateString() === date).length
        })));

        setLoading(false);
      } catch (err) {
        console.error("Dashboard Load Error:", err);
        setLoading(false);
      }
    };
    loadData();
  }, [user.id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <Activity size={48} className="text-blue-600 animate-spin" />
        <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Syncing Neural Data...</p>
      </div>
    </div>
  );

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-xl shadow-blue-500/20"><Activity size={24} /></div>
            <span className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px]">Neural Business Intelligence</span>
          </div>
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-none">Smart <span className="text-blue-600">Analytics.</span></h1>
          <p className="text-slate-400 mt-4 text-lg font-medium opacity-80 underline decoration-blue-500/30">
            {user.role === 'wholesaler' ? 'Wholesaler Hub' : 'Retailer Store'} ID: {user.id.slice(-6)}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/inventory" className="group bg-slate-950 text-white px-10 py-6 rounded-[2rem] font-black text-lg flex items-center gap-4 shadow-2xl hover:bg-blue-600 transition-all hover:scale-105">
            Manage Stock <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <ModernStatCard title="Inventory Count" value={stats.productsCount} sub="Live SKUs" icon={<Package className="text-blue-600" />} />
        <ModernStatCard title="Low Stock" value={stats.lowStock} sub="Items to Reorder" icon={<AlertTriangle className="text-amber-500" />} isAlert={stats.lowStock > 0} />
        <ModernStatCard title="Risk Alert" value={expiryAlerts.length} sub="Expiring Soon" icon={<AlertTriangle className="text-red-600" />} isAlert={expiryAlerts.length > 0} />
        <ModernStatCard title="Total Revenue" value={`₹${financials.revenue.toLocaleString()}`} sub="Current Month" icon={<DollarSign className="text-indigo-600" />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 space-y-10">
          <div className="bg-white p-12 rounded-[3.5rem] shadow-premium border border-slate-50 relative overflow-hidden group min-h-[500px]">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000"><Layers size={200} /></div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 relative z-10">
              <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                  <Zap size={28} className="text-amber-500 fill-amber-500" />
                  Performance Insight
                </h3>
              </div>
              <div className="flex gap-2 p-2 bg-slate-50 rounded-[2rem] border border-slate-100 uppercase text-[10px] font-black tracking-widest">
                <button onClick={() => setActiveTab('demand')} className={`px-8 py-4 rounded-[1.4rem] transition-all ${activeTab === 'demand' ? 'bg-white text-blue-600 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>Forecast</button>
                <button onClick={() => setActiveTab('velocity')} className={`px-8 py-4 rounded-[1.4rem] transition-all ${activeTab === 'velocity' ? 'bg-white text-blue-600 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>Velocity</button>
                <button onClick={() => setActiveTab('growth')} className={`px-8 py-4 rounded-[1.4rem] transition-all ${activeTab === 'growth' ? 'bg-white text-blue-600 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>Orders</button>
              </div>
            </div>

            <div className="h-[350px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                {activeTab === 'demand' ? (
                  <AreaChart data={forecastData}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 800, fontSize: 11 }} dy={15} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 800, fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={6} fillOpacity={1} fill="url(#colorSales)" dot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 3 }} />
                  </AreaChart>
                ) : activeTab === 'velocity' ? (
                  <BarChart data={velocityData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 800, fontSize: 10 }} dy={15} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 800, fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="totalSold" radius={[15, 15, 15, 15]} barSize={50}>
                      {velocityData.map((entry, index) => (
                        <Cell key={index} fill={entry.status === 'Fast-Moving' ? '#3b82f6' : entry.status === 'Slow-Moving' ? '#f87171' : '#cbd5e1'} />
                      ))}
                    </Bar>
                  </BarChart>
                ) : (
                  <BarChart data={orderAnalytics}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 800, fontSize: 10 }} dy={15} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 800, fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="orders" radius={[15, 15, 15, 15]} barSize={50} fill="#3b82f6" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative">
              <h4 className="text-2xl font-black mb-6 flex items-center gap-3"><Clock className="text-amber-500" /> Expiry Alerts</h4>
              <div className="space-y-4 max-h-[150px] overflow-y-auto no-scrollbar">
                {expiryAlerts.length > 0 ? expiryAlerts.map((alert, i) => (
                  <div key={i} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div>
                      <p className="font-bold text-sm">{alert.name}</p>
                      <p className="text-[10px] text-slate-500">Expires: {new Date(alert.expiryDate).toLocaleDateString()}</p>
                    </div>
                    <span className="bg-red-500/20 text-red-500 text-[10px] font-black px-3 py-1 rounded-full">{alert.suggestion}</span>
                  </div>
                )) : (
                  <p className="text-slate-500 text-sm font-medium">All products are within safe dates.</p>
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[3rem] p-10">
              <h4 className="text-2xl font-black mb-4 flex items-center gap-3 text-slate-900"><DollarSign className="text-blue-600" /> Monthly Financials</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-2xl">
                  <span className="text-xs font-black text-emerald-600 uppercase">Revenue</span>
                  <span className="text-xl font-black text-emerald-900">₹{financials.revenue}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-red-50 rounded-2xl">
                  <span className="text-xs font-black text-red-600 uppercase">Loss (Expiry)</span>
                  <span className="text-xl font-black text-red-900">₹{financials.loss}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-900 to-slate-950 p-12 rounded-[4rem] shadow-2xl relative overflow-hidden flex flex-col h-[800px]">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl opacity-50 transition-all group-hover:bg-blue-500/20"></div>
          <h3 className="text-3xl font-black text-white flex items-center gap-4 mb-12 relative z-10">
            <Target size={32} className="text-blue-400" /> Market Basket
          </h3>
          <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar relative z-10">
            {recommendations.length > 0 ? recommendations.map((rule, idx) => (
              <div key={idx} className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] hover:bg-white/10 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Neural Link #{idx + 1}</span>
                  <div className="bg-blue-600/20 text-blue-400 text-[10px] font-black px-2 py-0.5 rounded-full">CONFIDENCE {(rule.confidence * 100).toFixed(0)}%</div>
                </div>
                <p className="text-white font-bold text-sm mb-2">{rule.antecedents.join(' + ')}</p>
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                  <ArrowDownRight size={14} className="text-blue-400" />
                  <span className="text-[10px] uppercase font-black tracking-widest">Often Bought with</span>
                </div>
                <p className="text-blue-400 font-black text-lg">{rule.consequents.join(' + ')}</p>
              </div>
            )) : (
              <div className="py-24 text-center px-10">
                <Activity size={48} className="mx-auto text-blue-500/20 mb-6 animate-pulse" />
                <h5 className="text-white font-black text-xs uppercase tracking-widest mb-2">Training Models...</h5>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  We're analyzing buyer behavior. More data will unlock deep associations.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950 p-4 rounded-2xl shadow-2xl border border-white/10">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{label}</p>
        {payload.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color || '#3b82f6' }} />
            <span className="text-lg font-black text-white">{item.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const ModernStatCard = ({ title, value, sub, icon, isAlert }) => (
  <div className={`bg-white p-10 rounded-[3rem] border ${isAlert ? 'border-red-200 bg-red-50/20' : 'border-slate-50'} shadow-premium hover:shadow-2xl transition-all group overflow-hidden`}>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${isAlert ? 'bg-red-100' : 'bg-slate-50'}`}>{icon}</div>
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{title}</p>
    <h4 className="text-4xl font-black text-slate-900 tracking-tighter">{value}</h4>
    <p className="text-xs font-bold text-slate-400">{sub}</p>
  </div>
);

export default Dashboard;
