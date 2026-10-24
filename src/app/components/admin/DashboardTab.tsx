import React from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp, ShoppingCart, Package, UserPlus, Mail, Star,
  AlertTriangle, RefreshCw, Activity, FileText, Images, PanelsTopLeft,
  Layers, MessageSquare, ArrowRight, Plus, Upload, Store, Pencil
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useAdmin, CustomTooltip, PIE_COLORS, timeAgo } from './AdminContext';

export const DashboardTab = () => {
  const {
    products, orders, newsletterSubs, reviews, activityLog, pages, media, vendors, inquiries, homepageContent,
    totalRevenue, avgRating, pendingVendors, revenueByMonth,
    ordersByStatus, productsByCategory, topProducts, lowStockProducts,
    paidOrders, revenueLast30Days, ordersLast30Days, averageOrderValue, itemsSold, uniqueCustomers,
    fetchData, setActiveTab, refreshing, lastUpdatedAt,
    setProductModal, setEditingProduct, setProductGallery, setMediaUploadModal,
  } = useAdmin();

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    maximumFractionDigits: 0,
  }).format(value);

  const storeMetrics = [
    { label: 'Paid revenue', value: formatCurrency(totalRevenue), detail: 'Completed and active orders', icon: TrendingUp, tab: 'orders' },
    { label: 'Last 30 days', value: formatCurrency(revenueLast30Days), detail: `${ordersLast30Days} paid order${ordersLast30Days === 1 ? '' : 's'}`, icon: Activity, tab: 'orders' },
    { label: 'Paid orders', value: paidOrders.length.toLocaleString('en-ZA'), detail: `${orders.length} orders in total`, icon: ShoppingCart, tab: 'orders' },
    { label: 'Average order', value: formatCurrency(averageOrderValue), detail: 'Across revenue orders', icon: Star, tab: 'orders' },
    { label: 'Units sold', value: itemsSold.toLocaleString('en-ZA'), detail: 'Product quantities fulfilled', icon: Package, tab: 'products' },
    { label: 'Customers', value: uniqueCustomers.toLocaleString('en-ZA'), detail: 'Unique customer emails', icon: UserPlus, tab: 'customers' },
  ];
  const homepageSections = Object.values(homepageContent?.sections || {}) as Array<{ enabled?: boolean }>;
  const enabledHomepageSections = homepageSections.filter((section) => section.enabled !== false).length;

  return (
    <motion.div key="dash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#2271b1]"><Store className="h-3.5 w-3.5" /> WooCommerce</div>
          <h2 className="text-2xl font-serif text-neutral-900">Store dashboard</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Manage sales, products and website content from one workspace.</p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdatedAt && <span className="hidden text-[10px] text-neutral-400 sm:inline">Updated {timeAgo(lastUpdatedAt)}</span>}
          <button onClick={fetchData} disabled={refreshing} className="text-xs flex items-center gap-1.5 rounded-sm border border-neutral-300 bg-white px-3 py-2 text-neutral-600 hover:border-neutral-400 hover:text-neutral-900 transition-colors disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> {refreshing ? 'Refreshing' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* WordPress/WooCommerce quick actions */}
      <div className="grid overflow-hidden border border-neutral-200 bg-white sm:grid-cols-2 lg:grid-cols-4">
        <button onClick={() => { setEditingProduct(null); setProductGallery([]); setProductModal(true); }} className="group flex items-center gap-3 border-b border-r border-neutral-100 px-4 py-3.5 text-left hover:bg-[#f6f7f7]">
          <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-[#2271b1] text-white"><Plus className="h-4 w-4" /></span>
          <span><span className="block text-xs font-semibold text-neutral-900">Add product</span><span className="text-[10px] text-neutral-400">Create a catalogue item</span></span>
        </button>
        <button onClick={() => setActiveTab('orders')} className="group flex items-center gap-3 border-b border-r border-neutral-100 px-4 py-3.5 text-left hover:bg-[#f6f7f7]">
          <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-neutral-100 text-neutral-600"><ShoppingCart className="h-4 w-4" /></span>
          <span><span className="block text-xs font-semibold text-neutral-900">Manage orders</span><span className="text-[10px] text-neutral-400">Review fulfilment</span></span>
        </button>
        <button onClick={() => setActiveTab('homepage')} className="group flex items-center gap-3 border-b border-r border-neutral-100 px-4 py-3.5 text-left hover:bg-[#f6f7f7]">
          <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-neutral-100 text-neutral-600"><Pencil className="h-4 w-4" /></span>
          <span><span className="block text-xs font-semibold text-neutral-900">Edit homepage</span><span className="text-[10px] text-neutral-400">Update featured content</span></span>
        </button>
        <button onClick={() => setMediaUploadModal(true)} className="group flex items-center gap-3 border-b border-neutral-100 px-4 py-3.5 text-left hover:bg-[#f6f7f7]">
          <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-neutral-100 text-neutral-600"><Upload className="h-4 w-4" /></span>
          <span><span className="block text-xs font-semibold text-neutral-900">Upload media</span><span className="text-[10px] text-neutral-400">Add images and files</span></span>
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {storeMetrics.map((stat) => (
          <button key={stat.label} onClick={() => setActiveTab(stat.tab)} className="group relative min-h-[148px] overflow-hidden border border-[#d9d1c4] bg-[#fbfaf7] p-5 text-left shadow-[0_12px_34px_-30px_rgba(48,35,20,.55)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#b8914a] hover:shadow-[0_18px_42px_-28px_rgba(83,57,18,.45)]">
            <span className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#6f4b00] via-[#e5c35f] to-[#8a5e00] opacity-75" />
            <div className="mb-5 flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d7c7a7] bg-white text-[#7c5a1f] transition-colors group-hover:border-[#b8914a] group-hover:bg-[#f5ecd7]"><stat.icon className="h-4 w-4" strokeWidth={1.6} /></span>
              <ArrowRight className="h-3.5 w-3.5 text-[#b9aa90] transition-transform group-hover:translate-x-1 group-hover:text-[#8a6421]" />
            </div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#8b7d68]">{stat.label}</p>
            <p className="mt-1 break-words text-[1.35rem] leading-tight text-[#241c14]" style={{ fontFamily: 'var(--font-playfair)' }}>{stat.value}</p>
            <p className="mt-2 text-[10px] leading-relaxed text-[#8b8275]">{stat.detail}</p>
          </button>
        ))}
      </div>

      {/* WordPress-style content overview */}
      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-900">Content at a glance</h3>
            <p className="mt-1 text-[10px] text-neutral-400">Jump into any content type managed by the site.</p>
          </div>
          <button onClick={() => setActiveTab('homepage')} className="flex items-center gap-1 text-[10px] font-bold uppercase text-neutral-400 hover:text-neutral-900">Edit homepage <ArrowRight className="h-3 w-3" /></button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Homepage sections', value: homepageSections.length, detail: `${enabledHomepageSections} currently enabled`, tab: 'homepage', icon: PanelsTopLeft },
            { label: 'Pages', value: pages.length, detail: `${pages.filter((page: any) => page.status === 'published').length} published`, tab: 'pages', icon: FileText },
            { label: 'Products', value: products.length, detail: `${lowStockProducts.length} low stock`, tab: 'products', icon: Package },
            { label: 'Media', value: media.length, detail: 'Images and files', tab: 'media', icon: Images },
            { label: 'Reviews', value: reviews.length, detail: avgRating ? `${avgRating.toFixed(1)} average rating` : 'No ratings yet', tab: 'reviews', icon: Star },
            { label: 'Artisan profiles', value: vendors.length, detail: `${pendingVendors} awaiting review`, tab: 'vendors', icon: Layers },
            { label: 'Inquiries', value: inquiries.length, detail: `${inquiries.filter((item: any) => !item.status || item.status === 'new').length} new`, tab: 'inquiries', icon: MessageSquare },
            { label: 'Subscribers', value: newsletterSubs.length, detail: 'Newsletter audience', tab: 'subscribers', icon: Mail },
          ].map((type) => (
            <button key={type.label} onClick={() => setActiveTab(type.tab)} className="group flex items-center gap-3 border-b border-r border-neutral-100 p-4 text-left hover:bg-neutral-50">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-500 transition-colors group-hover:bg-neutral-900 group-hover:text-white"><type.icon className="h-4 w-4" /></div>
              <div className="min-w-0"><p className="text-xs font-semibold text-neutral-900">{type.label} <span className="ml-1 text-neutral-400">{type.value}</span></p><p className="mt-0.5 truncate text-[10px] text-neutral-400">{type.detail}</p></div>
            </button>
          ))}
        </div>
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
