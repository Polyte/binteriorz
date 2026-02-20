import React from 'react';
import { motion } from 'motion/react';
import { Mail, MessageSquare, Inbox, ShoppingCart, Download, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { useAdmin } from './AdminContext';

export const CustomersTab = () => {
  const {
    orders, newsletterSubs, inquiries, searchQuery, canDelete,
    handleDeleteSubscriber, handleDeleteInquiry, handleUpdateInquiryStatus,
  } = useAdmin();

  return (
    <motion.div key="customers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-serif text-neutral-900">Customers</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Newsletter subscribers & inquiries</p>
        </div>
        <button
          onClick={() => {
            const rows = newsletterSubs.map((s: any) => ({ Email: s.email, 'Subscribed At': new Date(s.subscribedAt).toLocaleDateString() }));
            const ws = XLSX.utils.json_to_sheet(rows);
            ws['!cols'] = [{ wch: 32 }, { wch: 14 }];
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Subscribers');
            XLSX.writeFile(wb, `B-Interiors_Subscribers_${new Date().toISOString().slice(0, 10)}.xlsx`);
            toast.success('Subscribers exported.');
          }}
          className="flex items-center gap-1.5 px-3 py-2 border border-neutral-200 bg-white rounded-md text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> Export Subscribers
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <Mail className="w-5 h-5 text-pink-500 mb-2" />
          <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">Newsletter Subs</p>
          <p className="text-2xl font-serif text-neutral-900 mt-0.5">{newsletterSubs.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <MessageSquare className="w-5 h-5 text-blue-500 mb-2" />
          <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">All Inquiries</p>
          <p className="text-2xl font-serif text-neutral-900 mt-0.5">{inquiries.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <Inbox className="w-5 h-5 text-amber-500 mb-2" />
          <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">Unread</p>
          <p className="text-2xl font-serif text-neutral-900 mt-0.5">{inquiries.filter((i: any) => !i.status || i.status === 'new').length}</p>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <ShoppingCart className="w-5 h-5 text-emerald-500 mb-2" />
          <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">Unique Buyers</p>
          <p className="text-2xl font-serif text-neutral-900 mt-0.5">{new Set(orders.map((o: any) => o.customerInfo?.email)).size}</p>
        </div>
      </div>

      {/* Newsletter Subscribers */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="p-4 border-b border-neutral-100">
          <h3 className="text-[11px] uppercase tracking-[0.15em] font-bold text-neutral-900 flex items-center gap-2">
            <Mail className="w-4 h-4 text-pink-500" /> Newsletter Subscribers
          </h3>
        </div>
        <div className="divide-y divide-neutral-50">
          {newsletterSubs.filter(s => !searchQuery || s.email?.toLowerCase().includes(searchQuery.toLowerCase())).map((sub: any) => (
            <div key={sub.id} className="px-4 py-3 flex items-center justify-between hover:bg-neutral-50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-pink-50 rounded-full flex items-center justify-center text-pink-600 text-[10px] font-bold uppercase">
                  {sub.email?.[0]}
                </div>
                <span className="text-xs text-neutral-900">{sub.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-neutral-400">{new Date(sub.subscribedAt).toLocaleDateString()}</span>
                {canDelete && <button onClick={() => handleDeleteSubscriber(sub.id)} className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded text-neutral-400 hover:text-red-600 transition-all"><Trash2 className="w-3 h-3" /></button>}
              </div>
            </div>
          ))}
          {newsletterSubs.length === 0 && <p className="p-4 text-center text-neutral-400 text-xs">No subscribers yet</p>}
        </div>
      </div>

      {/* Inquiries */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="p-4 border-b border-neutral-100">
          <h3 className="text-[11px] uppercase tracking-[0.15em] font-bold text-neutral-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-500" /> Inquiries
          </h3>
        </div>
        <div className="divide-y divide-neutral-50">
          {inquiries.filter(i => !searchQuery || i.name?.toLowerCase().includes(searchQuery.toLowerCase()) || i.email?.toLowerCase().includes(searchQuery.toLowerCase())).map((inq: any) => (
            <div key={inq.id} className="px-4 py-3 hover:bg-neutral-50 transition-colors group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-neutral-900">{inq.name}</span>
                  <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${
                    inq.status === 'replied' ? 'bg-emerald-50 text-emerald-700' :
                    inq.status === 'read' ? 'bg-blue-50 text-blue-700' :
                    'bg-amber-50 text-amber-700'
                  }`}>{inq.status || 'new'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-neutral-400">{new Date(inq.createdAt).toLocaleDateString()}</span>
                  <select
                    value={inq.status || 'new'}
                    onChange={(e) => handleUpdateInquiryStatus(inq.id, e.target.value)}
                    className="text-[9px] border border-neutral-200 rounded px-1.5 py-0.5 bg-white outline-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                  </select>
                  {canDelete && <button onClick={() => handleDeleteInquiry(inq.id)} className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded text-neutral-400 hover:text-red-600 transition-all"><Trash2 className="w-3 h-3" /></button>}
                </div>
              </div>
              <p className="text-[10px] text-neutral-400">{inq.email}</p>
              {inq.message && <p className="text-xs text-neutral-600 mt-1 line-clamp-2">{inq.message}</p>}
            </div>
          ))}
          {inquiries.length === 0 && <p className="p-4 text-center text-neutral-400 text-xs">No inquiries yet</p>}
        </div>
      </div>
    </motion.div>
  );
};
