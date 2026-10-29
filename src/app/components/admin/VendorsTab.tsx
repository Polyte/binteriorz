import React from 'react';
import { motion } from 'motion/react';
import {
  Layers, Package, CheckCircle2, XCircle, Clock, Star, Globe, Mail,
  ExternalLink, Eye, EyeOff, RefreshCw, Trash2, Download
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { useAdmin } from './AdminContext';

export const VendorsTab = () => {
  const {
    products, vendors, searchQuery, canDelete,
    vendorStatusFilter, setVendorStatusFilter,
    handleUpdateVendor, handleDeleteVendor,
    setEditingVendor, setVendorModal,
  } = useAdmin();

  const statusCounts = { all: vendors.length, pending: 0, approved: 0, rejected: 0, suspended: 0 };
  vendors.forEach((v: any) => { if (statusCounts[v.status as keyof typeof statusCounts] !== undefined) statusCounts[v.status as keyof typeof statusCounts]++; });
  const filtered = vendors.filter((v: any) => {
    if (vendorStatusFilter !== 'all' && v.status !== vendorStatusFilter) return false;
    if (searchQuery && !v.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) && !v.category?.toLowerCase().includes(searchQuery.toLowerCase()) && !v.email?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });
  const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
    pending: { color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', label: 'Pending Review' },
    approved: { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', label: 'Approved' },
    rejected: { color: 'text-red-700', bg: 'bg-red-50 border-red-200', label: 'Rejected' },
    suspended: { color: 'text-neutral-700', bg: 'bg-neutral-100 border-neutral-300', label: 'Suspended' },
  };

  return (
    <motion.div key="vendors" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-serif text-neutral-900">Artisan Guild</h2>
          <p className="text-xs text-neutral-500 mt-0.5">{vendors.length} vendors &bull; {statusCounts.pending} pending review</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => {
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(vendors.map((v: any) => ({ 'Business Name': v.businessName, Email: v.email, Category: v.category, Location: v.location, Status: v.status, Website: v.website, Applied: v.appliedAt, 'Commission %': v.commissionRate || '', Featured: v.featured ? 'Yes' : 'No', 'Admin Notes': v.adminNotes || '' })));
            XLSX.utils.book_append_sheet(wb, ws, 'Vendors');
            XLSX.writeFile(wb, `B-Interior-Designz_Vendors_${new Date().toISOString().slice(0, 10)}.xlsx`);
            toast.success('Vendors exported.');
          }} className="flex items-center gap-1.5 px-3 py-2 border border-neutral-200 bg-white rounded-md text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Vendors', value: statusCounts.all, icon: Layers, color: 'text-neutral-600' },
          { label: 'Pending', value: statusCounts.pending, icon: Clock, color: 'text-amber-600' },
          { label: 'Approved', value: statusCounts.approved, icon: CheckCircle2, color: 'text-emerald-600' },
          { label: 'Rejected', value: statusCounts.rejected, icon: XCircle, color: 'text-red-600' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white rounded-lg border border-neutral-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              <span className="text-2xl font-bold text-neutral-900">{kpi.value}</span>
            </div>
            <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1 bg-white rounded-lg border border-neutral-200 p-1">
        {(['all', 'pending', 'approved', 'rejected', 'suspended'] as const).map(status => (
          <button key={status} onClick={() => setVendorStatusFilter(status)} className={`flex-1 py-2 px-3 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors ${vendorStatusFilter === status ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:bg-neutral-50'}`}>
            {status === 'all' ? 'All' : status} {status !== 'all' && statusCounts[status] > 0 ? `(${statusCounts[status]})` : ''}
          </button>
        ))}
      </div>

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((vendor: any) => {
          const sc = STATUS_CONFIG[vendor.status] || STATUS_CONFIG.pending;
          return (
            <div key={vendor.id} className="bg-white rounded-lg border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-neutral-900 text-white rounded-lg flex items-center justify-center text-lg font-serif flex-shrink-0">
                    {vendor.businessName?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-serif text-neutral-900 flex items-center gap-2">
                          {vendor.businessName}
                          {vendor.featured && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                          <span className="text-[10px] text-neutral-400 flex items-center gap-1"><Package className="w-3 h-3" /> {vendor.category}</span>
                          {vendor.location && <span className="text-[10px] text-neutral-400 flex items-center gap-1"><Globe className="w-3 h-3" /> {vendor.location}</span>}
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border flex-shrink-0 ${sc.bg} ${sc.color}`}>
                        {sc.label}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-neutral-500">
                  {vendor.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {vendor.email}</span>}
                  {vendor.website && <a href={vendor.website} target="_blank" rel="noopener" className="flex items-center gap-1 hover:text-neutral-900 transition-colors"><ExternalLink className="w-3 h-3" /> Website</a>}
                  {vendor.contactPhone && <span className="flex items-center gap-1">{vendor.contactPhone}</span>}
                </div>

                {vendor.description && (
                  <p className="text-xs text-neutral-500 italic border-l-2 border-neutral-100 pl-3 mt-3 line-clamp-2">"{vendor.description}"</p>
                )}

                {vendor.adminNotes && (
                  <div className="mt-3 bg-amber-50/50 border border-amber-100 rounded-md px-3 py-2">
                    <p className="text-[9px] text-amber-700 uppercase tracking-wider font-bold mb-0.5">Admin Notes</p>
                    <p className="text-[11px] text-amber-900 line-clamp-2">{vendor.adminNotes}</p>
                  </div>
                )}

                <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-3 pt-3 border-t border-neutral-50 text-[10px] text-neutral-400">
                  <span>Applied {new Date(vendor.appliedAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  {(() => { const ct = products.filter((p: any) => p.vendorId === vendor.id).length; return ct > 0 ? <span>&bull; <span className="font-medium text-neutral-600">{ct}</span> product{ct !== 1 ? 's' : ''}</span> : null; })()}
                  {vendor.commissionRate && <span>&bull; {vendor.commissionRate}% commission</span>}
                  {vendor.updatedAt && <span>&bull; Updated {new Date(vendor.updatedAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}</span>}
                </div>
              </div>

              {/* Card Actions Footer */}
              <div className="px-5 py-3 bg-neutral-50/50 border-t border-neutral-100 flex items-center gap-2">
                <button onClick={() => { setEditingVendor(vendor); setVendorModal(true); }} className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold text-neutral-700 bg-white border border-neutral-200 rounded-md hover:bg-neutral-50 transition-colors">
                  <Eye className="w-3 h-3" /> View / Edit
                </button>
                {vendor.status === 'pending' && (
                  <>
                    <button onClick={() => handleUpdateVendor(vendor.id, { status: 'approved' })} className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors">
                      <CheckCircle2 className="w-3 h-3" /> Approve
                    </button>
                    <button onClick={() => handleUpdateVendor(vendor.id, { status: 'rejected' })} className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors">
                      <XCircle className="w-3 h-3" /> Reject
                    </button>
                  </>
                )}
                {vendor.status === 'approved' && (
                  <button onClick={() => handleUpdateVendor(vendor.id, { status: 'suspended' })} className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold text-neutral-600 bg-white border border-neutral-200 rounded-md hover:bg-neutral-50 transition-colors">
                    <EyeOff className="w-3 h-3" /> Suspend
                  </button>
                )}
                {vendor.status === 'suspended' && (
                  <button onClick={() => handleUpdateVendor(vendor.id, { status: 'approved' })} className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 transition-colors">
                    <CheckCircle2 className="w-3 h-3" /> Reactivate
                  </button>
                )}
                {vendor.status === 'rejected' && (
                  <button onClick={() => handleUpdateVendor(vendor.id, { status: 'pending' })} className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-md hover:bg-amber-100 transition-colors">
                    <RefreshCw className="w-3 h-3" /> Reconsider
                  </button>
                )}
                <div className="ml-auto">
                  {canDelete && (
                    <button onClick={() => handleDeleteVendor(vendor.id)} className="p-1.5 hover:bg-red-50 rounded text-neutral-300 hover:text-red-600 transition-colors" title="Delete vendor">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-lg border-2 border-dashed border-neutral-200 py-16 text-center">
          <Layers className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
          <p className="text-neutral-400 text-sm">
            {vendors.length === 0 ? 'No guild applications yet.' : `No ${vendorStatusFilter} vendors found.`}
          </p>
        </div>
      )}
    </motion.div>
  );
};
