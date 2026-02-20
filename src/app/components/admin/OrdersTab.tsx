import React from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, FileSpreadsheet } from 'lucide-react';
import { useAdmin } from './AdminContext';

export const OrdersTab = () => {
  const {
    orders, searchQuery, totalRevenue,
    exportOrdersToExcel, handleUpdateOrderStatus, setSelectedOrder,
  } = useAdmin();

  return (
    <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-serif text-neutral-900">Orders</h2>
          <p className="text-xs text-neutral-500 mt-0.5">{orders.length} total orders &bull; R {totalRevenue.toLocaleString()} revenue</p>
        </div>
        <button onClick={exportOrdersToExcel} className="flex items-center gap-1.5 px-3 py-2 border border-neutral-200 bg-white rounded-md text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
          <FileSpreadsheet className="w-3.5 h-3.5" /> Export Orders
        </button>
      </div>

      {/* Status Pipeline */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {['confirmed', 'processing', 'shipped', 'delivered'].map(status => {
          const count = orders.filter((o: any) => o.status === status).length;
          return (
            <div key={status} className="bg-white rounded-lg border border-neutral-200 p-4">
              <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">{status}</p>
              <p className="text-2xl font-serif text-neutral-900 mt-1">{count}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-neutral-500">Order</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-neutral-500">Customer</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-neutral-500">Total</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-neutral-500">Status</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-neutral-500">Date</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-neutral-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {orders.filter(o => !searchQuery || o.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) || o.customerInfo?.email?.toLowerCase().includes(searchQuery.toLowerCase()) || `${o.customerInfo?.firstName} ${o.customerInfo?.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())).map((order: any) => (
                <tr key={order.orderId} className="hover:bg-neutral-50 transition-colors cursor-pointer" onClick={() => setSelectedOrder(order)}>
                  <td className="px-4 py-3 text-xs font-mono font-semibold text-neutral-900">{order.orderId}</td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium text-neutral-900">{order.customerInfo?.firstName} {order.customerInfo?.lastName}</p>
                    <p className="text-[10px] text-neutral-400">{order.customerInfo?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">R {order.total?.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full ${
                      order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                      order.status === 'shipped' ? 'bg-blue-50 text-blue-700' :
                      order.status === 'processing' ? 'bg-amber-50 text-amber-700' :
                      'bg-neutral-100 text-neutral-600'
                    }`}>{order.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateOrderStatus(order.orderId, e.target.value)}
                      className="text-[10px] border border-neutral-200 rounded px-2 py-1 bg-white outline-none cursor-pointer hover:border-neutral-400 transition-colors"
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && (
          <div className="py-16 text-center">
            <ShoppingCart className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
            <p className="text-neutral-400 text-sm">No orders yet.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
