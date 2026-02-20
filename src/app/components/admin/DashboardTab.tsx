import React from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp, ShoppingCart, Package, UserPlus, Mail, Star,
  AlertTriangle, RefreshCw, Activity
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useAdmin, CustomTooltip, PIE_COLORS, timeAgo } from './AdminContext';

export const DashboardTab = () => {
  const {
    products, orders, newsletterSubs, reviews, activityLog,
    totalRevenue, avgRating, pendingVendors, revenueByMonth,
    ordersByStatus, productsByCategory, topProducts, lowStockProducts,
    fetchData, setActiveTab,
  } = useAdmin();

  return (
    <motion.div key="dash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-serif text-neutral-900">Dashboard</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Welcome back. Here's what's happening today.</p>
        </div>
        <button onClick={fetchData} className="text-xs flex items-center gap-1.5 text-neutral-500 hover:text-neutral-900 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {[
          { label: 'Revenue', value: `R ${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Orders', value: orders.length, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Products', value: products.length, icon: Package, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Pending Guild', value: pendingVendors, icon: UserPlus, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Subscribers', value: newsletterSubs.length, icon: Mail, color: 'text-pink-600', bg: 'bg-pink-50' },
          { label: 'Avg Rating', value: avgRating.toFixed(1), icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-lg border border-neutral-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-md ${stat.bg} ${stat.color}`}><stat.icon className="w-4 h-4" /></div>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">{stat.label}</p>
            <h3 className="text-xl font-serif text-neutral-900 mt-0.5">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Low Stock Alert</p>
            <p className="text-xs text-amber-700 mt-0.5">{lowStockProducts.map(p => `${p.name} (${p.stock} left)`).join(', ')}</p>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-lg border border-neutral-200 p-5">
          <h3 className="text-[11px] uppercase tracking-[0.15em] font-bold text-neutral-900 mb-4">Revenue Timeline</h3>
          <div className="h-56">
            {revenueByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueByMonth}>
                  <defs>
                    <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#171717" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#171717" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#a3a3a3' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#a3a3a3' }} axisLine={false} tickLine={false} tickFormatter={v => `R${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="Revenue" stroke="#171717" strokeWidth={2} fill="url(#rg)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-neutral-300 text-sm">No revenue data yet</div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-5">
          <h3 className="text-[11px] uppercase tracking-[0.15em] font-bold text-neutral-900 mb-4">Order Status</h3>
          <div className="h-56">
            {ordersByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={ordersByStatus} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={4} dataKey="value">
                    {ordersByStatus.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-neutral-300 text-sm">No orders yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-neutral-200 p-5">
          <h3 className="text-[11px] uppercase tracking-[0.15em] font-bold text-neutral-900 mb-4">Categories</h3>
          <div className="h-48">
            {productsByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productsByCategory} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                  <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#a3a3a3' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#a3a3a3' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Products" fill="#171717" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (<div className="h-full flex items-center justify-center text-neutral-300 text-sm">No products yet</div>)}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="p-5 border-b border-neutral-100 flex justify-between items-center">
            <h3 className="text-[11px] uppercase tracking-[0.15em] font-bold text-neutral-900">Recent Orders</h3>
            <button onClick={() => setActiveTab('orders')} className="text-[10px] uppercase font-bold text-neutral-400 hover:text-neutral-900">View All</button>
          </div>
          <div className="divide-y divide-neutral-50">
            {orders.slice(0, 5).map((order: any) => (
              <div key={order.orderId} className="px-5 py-3 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-neutral-100 flex items-center justify-center rounded-md text-neutral-500 font-bold text-[10px] uppercase">
                    {order.customerInfo?.firstName?.[0]}{order.customerInfo?.lastName?.[0]}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-900">{order.customerInfo?.firstName} {order.customerInfo?.lastName}</p>
                    <p className="text-[10px] text-neutral-400">{order.orderId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold">R {order.total?.toLocaleString()}</p>
                  <p className="text-[10px] text-neutral-400">{timeAgo(order.createdAt)}</p>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="p-5 text-center text-neutral-400 text-xs">No orders yet</p>}
          </div>
        </div>
      </div>

      {/* Top Products */}
      {topProducts.length > 0 && (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="p-5 border-b border-neutral-100 flex justify-between items-center">
            <h3 className="text-[11px] uppercase tracking-[0.15em] font-bold text-neutral-900">Best Sellers</h3>
            <button onClick={() => setActiveTab('products')} className="text-[10px] uppercase font-bold text-neutral-400 hover:text-neutral-900">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-neutral-50 border-b border-neutral-100">
                <tr>
                  <th className="px-5 py-2 text-[10px] uppercase tracking-widest font-bold text-neutral-400">Product</th>
                  <th className="px-5 py-2 text-[10px] uppercase tracking-widest font-bold text-neutral-400 text-center">Units Sold</th>
                  <th className="px-5 py-2 text-[10px] uppercase tracking-widest font-bold text-neutral-400 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {topProducts.map((tp, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-neutral-900">{tp.name}</td>
                    <td className="px-5 py-3 text-sm text-neutral-500 text-center">{tp.count}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-neutral-900 text-right">R {tp.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Activity Feed */}
      {activityLog.length > 0 && (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="p-5 border-b border-neutral-100 flex justify-between items-center">
            <h3 className="text-[11px] uppercase tracking-[0.15em] font-bold text-neutral-900 flex items-center gap-2"><Activity className="w-3.5 h-3.5 text-neutral-400" /> Recent Activity</h3>
            <button onClick={() => setActiveTab('activity')} className="text-[10px] uppercase font-bold text-neutral-400 hover:text-neutral-900">View All</button>
          </div>
          <div className="divide-y divide-neutral-50">
            {activityLog.slice(0, 5).map((entry: any) => {
              const ROLE_DOT: Record<string, string> = { owner: 'bg-amber-500', admin: 'bg-blue-500', editor: 'bg-neutral-400' };
              const ago = (() => {
                const diff = Date.now() - new Date(entry.timestamp).getTime();
                const mins = Math.floor(diff / 60000);
                if (mins < 1) return 'just now';
                if (mins < 60) return `${mins}m ago`;
                const hours = Math.floor(mins / 60);
                if (hours < 24) return `${hours}h ago`;
                return `${Math.floor(hours / 24)}d ago`;
              })();
              return (
                <div key={entry.id} className="flex items-center gap-3 px-5 py-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${ROLE_DOT[entry.role] || 'bg-neutral-300'}`} />
                  <p className="text-xs text-neutral-700 flex-1 truncate">{entry.details}</p>
                  <span className="text-[10px] text-neutral-400 flex-shrink-0">{ago}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};
