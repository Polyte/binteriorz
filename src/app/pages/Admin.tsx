import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, Package, ShoppingCart, Users, FileText, Image, Star,
  Settings, Plus, Search, Bell, ChevronRight, UserPlus, AlertTriangle,
  PanelLeftClose, PanelLeft, Globe, X, Layers, Activity, MessageSquare,
  CheckCircle2, Shield
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { supabase } from '../../../utils/supabase/client';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
const logo = "/logo.png";

// Admin context + tabs
import { AdminProvider, AdminStore } from '../components/admin/AdminContext';
import { DashboardTab } from '../components/admin/DashboardTab';
import { ProductsTab } from '../components/admin/ProductsTab';
import { OrdersTab } from '../components/admin/OrdersTab';
import { CustomersTab } from '../components/admin/CustomersTab';
import { PagesTab } from '../components/admin/PagesTab';
import { MediaTab } from '../components/admin/MediaTab';
import { ReviewsTab } from '../components/admin/ReviewsTab';
import { VendorsTab } from '../components/admin/VendorsTab';
import { ActivityTab } from '../components/admin/ActivityTab';
import { SettingsTab } from '../components/admin/SettingsTab';
import { AdminModals } from '../components/admin/AdminModals';
import { PageBuilder } from '../components/admin/PageBuilder';

const API = `https://${projectId}.supabase.co/functions/v1/make-server-710d82e2`;

// ─── Sidebar Navigation Config ────────────────────────────────
const sidebarSections = [
  { title: 'Main', items: [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }] },
  { title: 'E-Commerce', items: [
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'customers', label: 'Customers', icon: Users },
  ]},
  { title: 'Content', items: [
    { id: 'pages', label: 'Pages', icon: FileText },
    { id: 'media', label: 'Media Library', icon: Image },
  ]},
  { title: 'Community', items: [
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'vendors', label: 'Artisan Guild', icon: Layers },
  ]},
  { title: 'System', items: [
    { id: 'activity', label: 'Activity Log', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings, minRole: 'admin' },
  ]},
];

const exportProductsToExcel = (products: any[]) => {
  const rows = products.map(p => ({
    'Product ID': p.id, 'Name': p.name, 'Category': p.category,
    'Material': p.material, 'Color': p.color, 'Price (ZAR)': p.price,
    'Stock': p.stock ?? 'N/A', 'Rooms': (p.rooms || []).join(', '),
    'Tags': (p.tags || []).join(', '), 'Image URL': p.image || p.image_url || '',
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 12 }, { wch: 30 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 8 }, { wch: 24 }, { wch: 30 }, { wch: 60 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Product Archive');
  XLSX.writeFile(wb, `B-Interiors_Products_${new Date().toISOString().slice(0, 10)}.xlsx`);
  toast.success('Product spreadsheet exported.');
};

// ═══════════════════════════════════════════════════════════════
// ADMIN COMPONENT (Orchestrator)
// ═══════════════════════════════════════════════════════════════
export const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Data state
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [newsletterSubs, setNewsletterSubs] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [activityRoleFilter, setActivityRoleFilter] = useState('all');
  const [activityActionFilter, setActivityActionFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  // Modals
  const [productModal, setProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [pageModal, setPageModal] = useState(false);
  const [editingPage, setEditingPage] = useState<any>(null);
  const [mediaUploadModal, setMediaUploadModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [productGallery, setProductGallery] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [pageBuilderOpen, setPageBuilderOpen] = useState(false);

  // Role-based access
  const [userRole, setUserRole] = useState<string>('editor');
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');

  // Bulk import
  const [importModal, setImportModal] = useState(false);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importLoading, setImportLoading] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);

  // Vendor management
  const [vendorStatusFilter, setVendorStatusFilter] = useState('all');
  const [vendorModal, setVendorModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<any>(null);
  const [quickLinkOpen, setQuickLinkOpen] = useState(false);
  const [quickLinkSearch, setQuickLinkSearch] = useState('');
  const [quickLinkSelected, setQuickLinkSelected] = useState<Set<string>>(new Set());
  const [quickLinkLoading, setQuickLinkLoading] = useState(false);
  const [bulkUnlinkMode, setBulkUnlinkMode] = useState(false);
  const [bulkUnlinkSelected, setBulkUnlinkSelected] = useState<Set<string>>(new Set());
  const [bulkUnlinkLoading, setBulkUnlinkLoading] = useState(false);
  const [bulkUnlinkConfirm, setBulkUnlinkConfirm] = useState(false);

  const canEdit = userRole === 'owner' || userRole === 'admin';
  const canDelete = userRole === 'owner' || userRole === 'admin';
  const isOwner = userRole === 'owner';

  // ─── Auth ───────────────────────────────────────────────────
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = '/login'; return; }
      setSession(session);
    };
    checkAuth();
  }, []);

  const authHeaders = useCallback(() => ({
    Authorization: `Bearer ${session?.access_token}`,
    apikey: publicAnonKey,
    'Content-Type': 'application/json',
  }), [session]);

  // ─── Data Fetching ──────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const h = authHeaders();
      const [pRes, oRes, vRes, rRes, iRes, nRes, pgRes, mRes, sRes] = await Promise.all([
        fetch(`${API}/products`, { headers: h }),
        fetch(`${API}/orders`, { headers: h }),
        fetch(`${API}/vendors`, { headers: h }),
        fetch(`${API}/all-reviews`, { headers: h }),
        fetch(`${API}/inquiries`, { headers: h }),
        fetch(`${API}/newsletter-subs`, { headers: h }),
        fetch(`${API}/pages`, { headers: h }),
        fetch(`${API}/media`, { headers: h }),
        fetch(`${API}/site-settings`, { headers: h }),
      ]);

      if (pRes.status === 401 || oRes.status === 401) {
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login';
        return;
      }

      const [pData, oData, vData, rData, iData, nData, pgData, mData, sData] = await Promise.all([
        pRes.ok ? pRes.json() : [], oRes.ok ? oRes.json() : [], vRes.ok ? vRes.json() : [],
        rRes.ok ? rRes.json() : [], iRes.ok ? iRes.json() : [], nRes.ok ? nRes.json() : [],
        pgRes.ok ? pgRes.json() : [], mRes.ok ? mRes.json() : [], sRes.ok ? sRes.json() : null,
      ]);

      setProducts(Array.isArray(pData) ? pData : []); setOrders(Array.isArray(oData) ? oData : []); setVendors(Array.isArray(vData) ? vData : []);
      setReviews(Array.isArray(rData) ? rData : []); setInquiries(Array.isArray(iData) ? iData : []); setNewsletterSubs(Array.isArray(nData) ? nData : []);
      setPages(Array.isArray(pgData) ? pgData : []); setMedia(Array.isArray(mData) ? mData : []); setSiteSettings(sData);

      try {
        const alRes = await fetch(`${API}/activity-log`, { headers: h });
        if (alRes.ok) {
          const alData = await alRes.json();
          setActivityLog(Array.isArray(alData) ? alData : []);
        }
      } catch { /* non-critical */ }

      // Fetch notifications
      try {
        const notifsRes = await fetch(`${API}/notifications`, { headers: h });
        if (notifsRes.ok) {
          const notifsData = await notifsRes.json();
          setNotifications(Array.isArray(notifsData) ? notifsData : []);
        }
      } catch { /* non-critical */ }

      try {
        const roleRes = await fetch(`${API}/admin-role`, { headers: h });
        if (roleRes.ok) {
          const roleData = await roleRes.json();
          setUserRole(roleData.role || 'editor');
          if (roleData.role === 'owner') {
            const teamRes = await fetch(`${API}/admin-roles`, { headers: h });
            if (teamRes.ok) {
              const tmData = await teamRes.json();
              setTeamMembers(Array.isArray(tmData) ? tmData : []);
            }
          }
        } else if (roleRes.status === 403) {
          toast.error('You do not have admin access.');
          window.location.href = '/';
          return;
        }
      } catch { /* role fetch optional */ }
    } catch (err) {
      console.error('Admin fetchData error:', err);
      toast.error('Failed to load administration data');
    } finally { setLoading(false); }
  }, [session, authHeaders]);

  useEffect(() => { if (session) fetchData(); }, [session, fetchData]);

  // Poll notifications every 30s
  useEffect(() => {
    if (!session) return;
    const poll = setInterval(async () => {
      try {
        const h = authHeaders();
        const res = await fetch(`${API}/notifications`, { headers: h });
        if (res.ok) {
          const data = await res.json();
          setNotifications(Array.isArray(data) ? data : []);
        }
      } catch { /* silent */ }
    }, 30000);
    return () => clearInterval(poll);
  }, [session, authHeaders]);

  // ─── Actions ────────────────────────────────────────────────
  const handleLogout = async () => { await supabase.auth.signOut(); window.location.href = '/'; };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Delete this product permanently?')) return;
    try {
      const res = await fetch(`${API}/products/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (res.ok) { toast.success('Product deleted'); fetchData(); }
    } catch { toast.error('Failed to delete product'); }
  };

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());
    // Extract rooms (checkboxes) and tags (comma string)
    const rooms = fd.getAll('rooms').map(r => String(r));
    const tagsRaw = String(data.tags || '');
    const tags = tagsRaw.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    const productData: any = {
      ...data,
      price: Number(data.price),
      stock: Number(data.stock) || 0,
      gallery: productGallery,
      image: productGallery.length > 0 ? productGallery[0].url : (data.image || ''),
      rooms,
      tags,
    };
    delete productData.image_input;
    try {
      const url = editingProduct ? `${API}/products/${editingProduct.id}` : `${API}/products`;
      const res = await fetch(url, { method: editingProduct ? 'PUT' : 'POST', headers: authHeaders(), body: JSON.stringify(productData) });
      if (res.ok) { toast.success(editingProduct ? 'Product updated' : 'Product created'); setProductModal(false); setEditingProduct(null); setProductGallery([]); fetchData(); }
    } catch { toast.error('Failed to save product'); }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm('Delete this review permanently?')) return;
    try {
      const res = await fetch(`${API}/reviews/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (res.ok) { toast.success('Review deleted'); fetchData(); }
    } catch { toast.error('Failed to delete review'); }
  };

  const handleDeleteSubscriber = async (id: string) => {
    if (!confirm('Remove this subscriber?')) return;
    try {
      const res = await fetch(`${API}/newsletter-subs/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (res.ok) { toast.success('Subscriber removed'); fetchData(); }
    } catch { toast.error('Failed to remove subscriber'); }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!confirm('Delete this inquiry permanently?')) return;
    try {
      const res = await fetch(`${API}/inquiries/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (res.ok) { toast.success('Inquiry deleted'); fetchData(); }
    } catch { toast.error('Failed to delete inquiry'); }
  };

  const handleUpdateInquiryStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`${API}/inquiries/${id}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ status }) });
      if (res.ok) { toast.success(`Inquiry marked as ${status}`); fetchData(); }
    } catch { toast.error('Failed to update inquiry'); }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`${API}/orders/${orderId}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ status }) });
      if (res.ok) { toast.success(`Order ${status}`); fetchData(); }
    } catch { toast.error('Failed to update order'); }
  };

  const exportOrdersToExcel = () => {
    const rows = orders.map((o: any) => ({
      'Order ID': o.orderId,
      'Customer': `${o.customerInfo?.firstName || ''} ${o.customerInfo?.lastName || ''}`.trim(),
      'Email': o.customerInfo?.email || '',
      'Total (ZAR)': o.total,
      'Items': o.items?.length || 0,
      'Status': o.status,
      'Date': new Date(o.createdAt).toLocaleDateString(),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{ wch: 14 }, { wch: 24 }, { wch: 28 }, { wch: 12 }, { wch: 6 }, { wch: 12 }, { wch: 12 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orders');
    XLSX.writeFile(wb, `B-Interiors_Orders_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success('Orders exported.');
  };

  const handleUpdateVendor = async (id: string, updates: any) => {
    try {
      const res = await fetch(`${API}/vendors/${id}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify(updates) });
      if (res.ok) { toast.success(updates.status ? `Vendor ${updates.status}` : 'Vendor profile updated'); fetchData(); }
      else { const data = await res.json(); toast.error(data.error || 'Failed to update vendor'); }
    } catch { toast.error('Failed to update vendor'); }
  };

  const handleDeleteVendor = async (id: string) => {
    if (!confirm('Remove this vendor application permanently?')) return;
    try {
      const res = await fetch(`${API}/vendors/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (res.ok) { toast.success('Vendor removed'); fetchData(); }
      else { const d = await res.json(); toast.error(d.error || 'Failed to delete vendor'); }
    } catch { toast.error('Failed to delete vendor'); }
  };

  const handleSaveVendorProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingVendor) return;
    const fd = new FormData(e.currentTarget);
    const updates: any = {};
    ['businessName', 'email', 'website', 'category', 'location', 'description', 'contactPhone', 'commissionRate', 'adminNotes'].forEach(k => {
      const val = fd.get(k) as string;
      if (val !== undefined && val !== null) updates[k] = val;
    });
    updates.featured = fd.get('featured') === 'on';
    if (updates.commissionRate) updates.commissionRate = Number(updates.commissionRate);
    await handleUpdateVendor(editingVendor.id, updates);
    setVendorModal(false);
    setEditingVendor(null);
  };

  const handleSavePage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());
    try {
      const url = editingPage ? `${API}/pages/${editingPage.id}` : `${API}/pages`;
      const res = await fetch(url, { method: editingPage ? 'PUT' : 'POST', headers: authHeaders(), body: JSON.stringify(data) });
      if (res.ok) { toast.success(editingPage ? 'Page updated' : 'Page created'); setPageModal(false); setEditingPage(null); fetchData(); }
    } catch { toast.error('Failed to save page'); }
  };

  const handleDeletePage = async (id: string) => {
    if (!confirm('Delete this page permanently?')) return;
    try {
      const res = await fetch(`${API}/pages/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (res.ok) { toast.success('Page deleted'); fetchData(); }
    } catch { toast.error('Failed to delete page'); }
  };

  const handleMediaUpload = async (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        try {
          const res = await fetch(`${API}/media/upload`, {
            method: 'POST', headers: authHeaders(),
            body: JSON.stringify({ fileName: file.name, fileType: file.type, fileSize: file.size, base64Data: base64 }),
          });
          if (res.ok) { toast.success(`${file.name} uploaded`); fetchData(); }
          else { const err = await res.json(); toast.error(err.error || 'Upload failed'); }
        } catch { toast.error(`Failed to upload ${file.name}`); }
      };
      reader.readAsDataURL(file);
    }
    setMediaUploadModal(false);
  };

  const handleDeleteMedia = async (id: string) => {
    if (!confirm('Delete this media file permanently?')) return;
    try {
      const res = await fetch(`${API}/media/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (res.ok) { toast.success('Media deleted'); fetchData(); }
    } catch { toast.error('Failed to delete media'); }
  };

  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(fd.entries());
    data.freeShippingThreshold = Number(data.freeShippingThreshold) || 0;
    data.enableReviews = data.enableReviews === 'on';
    data.enableNewsletter = data.enableNewsletter === 'on';
    data.maintenanceMode = data.maintenanceMode === 'on';
    try {
      const res = await fetch(`${API}/site-settings`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) });
      if (res.ok) { toast.success('Settings saved'); fetchData(); }
    } catch { toast.error('Failed to save settings'); }
  };

  const handleQuickLinkProduct = async (productId: string, vendorId: string) => {
    try {
      const res = await fetch(`${API}/products/${productId}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ vendorId }) });
      if (res.ok) { toast.success('Product linked to vendor'); fetchData(); }
    } catch { toast.error('Failed to link product'); }
  };

  const handleBulkLinkProducts = async (productIds: string[], vendorId: string) => {
    setQuickLinkLoading(true);
    let linked = 0;
    try {
      await Promise.all(productIds.map(async (pid) => {
        const res = await fetch(`${API}/products/${pid}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ vendorId }) });
        if (res.ok) linked++;
      }));
      toast.success(`${linked} product${linked !== 1 ? 's' : ''} linked to vendor`);
      setQuickLinkSelected(new Set());
      setQuickLinkOpen(false);
      fetchData();
    } catch { toast.error('Failed to link some products'); }
    finally { setQuickLinkLoading(false); }
  };

  const handleUnlinkProduct = async (productId: string) => {
    try {
      const res = await fetch(`${API}/products/${productId}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ vendorId: '' }) });
      if (res.ok) { toast.success('Product unlinked'); fetchData(); }
    } catch { toast.error('Failed to unlink product'); }
  };

  const handleBulkUnlinkProducts = async (productIds: string[]) => {
    setBulkUnlinkLoading(true);
    let unlinked = 0;
    try {
      await Promise.all(productIds.map(async (pid) => {
        const res = await fetch(`${API}/products/${pid}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ vendorId: '' }) });
        if (res.ok) unlinked++;
      }));
      toast.success(`${unlinked} product${unlinked !== 1 ? 's' : ''} unlinked`);
      setBulkUnlinkSelected(new Set());
      setBulkUnlinkMode(false);
      fetchData();
    } catch { toast.error('Failed to unlink some products'); }
    finally { setBulkUnlinkLoading(false); }
  };

  // ─── Bulk Import ────────────────────────────────────────────
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws);
        if (rows.length === 0) { toast.error('No data found in file'); return; }
        setImportPreview(rows.slice(0, 100));
        setImportModal(true);
      } catch { toast.error('Failed to parse file'); }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const handleBulkImport = async () => {
    if (importPreview.length === 0) return;
    setImportLoading(true);
    try {
      const res = await fetch(`${API}/products/bulk`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ products: importPreview }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`${data.imported} products imported successfully`);
        setImportModal(false); setImportPreview([]); fetchData();
      } else { const err = await res.json(); toast.error(err.error || 'Import failed'); }
    } catch { toast.error('Import failed'); }
    finally { setImportLoading(false); }
  };

  const downloadImportTemplate = () => {
    const template = [
      { Name: 'Example Chair', Category: 'Seating', Material: 'Leather', Color: 'Black', 'Price (ZAR)': 5000, Stock: 10, Description: 'A beautiful chair', 'Image URL': 'https://example.com/chair.jpg', Rooms: 'living-room, bedroom', Tags: 'leather, modern, handcrafted' },
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    ws['!cols'] = [{ wch: 24 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 8 }, { wch: 30 }, { wch: 50 }, { wch: 24 }, { wch: 30 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Import Template');
    XLSX.writeFile(wb, 'B-Interiors_Import_Template.xlsx');
    toast.success('Template downloaded');
  };

  // ─── Team Management ──────────────────────────────────────

  // ─── Notification Actions ────────────────────────────────
  const unreadNotifications = notifications.filter((n: any) => !n.read);

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await fetch(`${API}/notifications/${id}/read`, { method: 'PATCH', headers: authHeaders() });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch { /* silent */ }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch(`${API}/notifications/read-all`, { method: 'POST', headers: authHeaders() });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch { /* silent */ }
  };

  const handleDismissNotification = async (id: string) => {
    try {
      await fetch(`${API}/notifications/${id}`, { method: 'DELETE', headers: authHeaders() });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch { /* silent */ }
  };

  const handleClearAllNotifications = async () => {
    if (!confirm('Clear all notifications?')) return;
    try {
      await fetch(`${API}/notifications`, { method: 'DELETE', headers: authHeaders() });
      setNotifications([]);
      toast.success('Notifications cleared');
    } catch { toast.error('Failed to clear notifications'); }
  };

  // ─── Team Management ──────────────────────────────────────
  const handleInviteTeamMember = async () => {
    if (!inviteEmail.trim()) return;
    try {
      const res = await fetch(`${API}/admin-roles`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }) });
      const data = await res.json();
      if (res.ok) { toast.success(`${inviteEmail} added as ${inviteRole}`); setInviteEmail(''); fetchData(); }
      else { toast.error(data.error || 'Failed to add team member'); }
    } catch { toast.error('Failed to invite team member'); }
  };

  const handleRemoveTeamMember = async (userId: string, email: string) => {
    if (!confirm(`Remove ${email} from the admin team?`)) return;
    try {
      const res = await fetch(`${API}/admin-roles/${userId}`, { method: 'DELETE', headers: authHeaders() });
      if (res.ok) { toast.success(`${email} removed`); fetchData(); }
      else { const d = await res.json(); toast.error(d.error); }
    } catch { toast.error('Failed to remove team member'); }
  };

  const handleUpdateTeamRole = async (userId: string, email: string, role: string) => {
    try {
      const res = await fetch(`${API}/admin-roles`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ email, role }) });
      if (res.ok) { toast.success(`${email} is now ${role}`); fetchData(); }
    } catch { toast.error('Failed to update role'); }
  };

  // ─── Derived Analytics ──────────────────────────────────────
  // Belt-and-suspenders: ensure arrays even if state somehow got corrupted
  const _orders = Array.isArray(orders) ? orders : [];
  const _products = Array.isArray(products) ? products : [];
  const _vendors = Array.isArray(vendors) ? vendors : [];
  const _reviews = Array.isArray(reviews) ? reviews : [];
  const _inquiries = Array.isArray(inquiries) ? inquiries : [];

  const totalRevenue = _orders.reduce((a: number, b: any) => a + (b.total || 0), 0);
  const avgRating = _reviews.length ? (_reviews.reduce((a: number, r: any) => a + r.rating, 0) / _reviews.length) : 0;
  const pendingVendors = _vendors.filter((v: any) => v.status === 'pending').length;

  const revenueByMonth = (() => {
    const months: Record<string, number> = {};
    _orders.forEach((o: any) => { const d = new Date(o.createdAt); const key = d.toLocaleDateString('en-ZA', { month: 'short', year: '2-digit' }); months[key] = (months[key] || 0) + (o.total || 0); });
    return Object.entries(months).map(([month, revenue]) => ({ month, Revenue: revenue }));
  })();

  const ordersByStatus = (() => {
    const counts: Record<string, number> = {};
    _orders.forEach((o: any) => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return Object.entries(counts).map(([status, count]) => ({ name: status.charAt(0).toUpperCase() + status.slice(1), value: count }));
  })();

  const productsByCategory = (() => {
    const counts: Record<string, number> = {};
    _products.forEach((p: any) => { counts[p.category] = (counts[p.category] || 0) + 1; });
    return Object.entries(counts).map(([category, count]) => ({ category, Products: count }));
  })();

  const topProducts = (() => {
    const freq: Record<string, { name: string; count: number; revenue: number }> = {};
    _orders.forEach((o: any) => {
      o.items?.forEach((item: any) => {
        const key = item.name || item.id;
        if (!freq[key]) freq[key] = { name: key, count: 0, revenue: 0 };
        freq[key].count += item.quantity || 1;
        freq[key].revenue += (item.price || 0) * (item.quantity || 1);
      });
    });
    return Object.values(freq).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  })();

  const lowStockProducts = _products.filter((p: any) => typeof p.stock === 'number' && p.stock <= 5);

  const getBadge = (id: string) => {
    if (id === 'orders') return _orders.filter((o: any) => o.status === 'confirmed').length || undefined;
    if (id === 'vendors') return pendingVendors || undefined;
    if (id === 'reviews') return _reviews.length || undefined;
    return undefined;
  };

  if (!session) return null;

  // ─── Context Store ──────────────────────────────────────────
  const store: AdminStore = {
    products, orders, vendors, reviews, inquiries, newsletterSubs, pages, media,
    siteSettings, activityLog, teamMembers,
    session, userRole, canEdit, canDelete, isOwner,
    searchQuery, setSearchQuery, setActiveTab,
    setProductModal, setEditingProduct, setProductGallery,
    setPageModal, setEditingPage,
    setMediaUploadModal, setSelectedOrder,
    setVendorModal, setEditingVendor, setImportModal,
    setPageBuilderOpen,
    vendorStatusFilter, setVendorStatusFilter,
    quickLinkOpen, setQuickLinkOpen, quickLinkSearch, setQuickLinkSearch,
    quickLinkSelected, setQuickLinkSelected, quickLinkLoading,
    bulkUnlinkMode, setBulkUnlinkMode,
    bulkUnlinkSelected, setBulkUnlinkSelected, bulkUnlinkLoading,
    bulkUnlinkConfirm, setBulkUnlinkConfirm,
    activityRoleFilter, setActivityRoleFilter,
    activityActionFilter, setActivityActionFilter,
    inviteEmail, setInviteEmail, inviteRole, setInviteRole,
    importFileRef, importPreview, importLoading,
    authHeaders, fetchData,
    handleDeleteProduct, handleDeleteReview, handleDeleteSubscriber,
    handleDeleteInquiry, handleUpdateInquiryStatus, handleUpdateOrderStatus,
    handleDeletePage, handleDeleteMedia,
    handleUpdateVendor, handleDeleteVendor, handleSaveVendorProfile,
    handleSaveSettings,
    handleQuickLinkProduct, handleBulkLinkProducts,
    handleUnlinkProduct, handleBulkUnlinkProducts,
    handleInviteTeamMember, handleRemoveTeamMember, handleUpdateTeamRole,
    handleImportFile, handleBulkImport, downloadImportTemplate,
    exportProductsToExcel, exportOrdersToExcel,
    totalRevenue, avgRating, pendingVendors,
    revenueByMonth, ordersByStatus, productsByCategory, topProducts, lowStockProducts,
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <AdminProvider value={store}>
    <div className="min-h-screen bg-[#f0f0f1] fixed inset-0 z-[60] flex">
      {/* ─── SIDEBAR ─── */}
      <aside className={`hidden lg:flex flex-col bg-[#1d2327] text-white transition-all duration-300 ${sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'} flex-shrink-0`}>
        <div className={`flex items-center gap-3 px-4 h-16 border-b border-white/5 flex-shrink-0 ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 bg-neutral-800 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 border border-white/10">
            <img src={logo} alt="" className="w-full h-full object-contain" />
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <h1 className="text-xs font-bold tracking-[0.15em] uppercase truncate">B-Interiors</h1>
              <p className="text-[9px] text-neutral-500 tracking-wider uppercase">Admin Console</p>
            </div>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-thin">
          {sidebarSections.map((section) => (
            <div key={section.title}>
              {!sidebarCollapsed && <p className="px-3 mb-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500">{section.title}</p>}
              <div className="space-y-0.5">
                {section.items.filter((item: any) => {
                  const RMAP: Record<string, number> = { owner: 3, admin: 2, editor: 1 };
                  return !item.minRole || (RMAP[userRole] || 0) >= (RMAP[item.minRole] || 0);
                }).map(item => {
                  const badge = getBadge(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setActiveTab(item.id); setMobileSidebarOpen(false); }}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={`w-full flex items-center gap-3 rounded-md text-[13px] transition-all duration-200 relative group ${sidebarCollapsed ? 'justify-center p-2.5' : 'px-3 py-2'} ${activeTab === item.id ? 'bg-white/10 text-white font-semibold' : 'text-neutral-400 hover:bg-white/5 hover:text-white'}`}
                    >
                      <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                      {badge && !sidebarCollapsed && <span className="ml-auto bg-blue-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">{badge}</span>}
                      {badge && sidebarCollapsed && <span className="absolute -top-0.5 -right-0.5 bg-blue-500 w-2.5 h-2.5 rounded-full" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-white/5 p-2 flex-shrink-0">
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-neutral-500 hover:text-white hover:bg-white/5 transition-all text-xs">
            {sidebarCollapsed ? <PanelLeft className="w-4 h-4" /> : <><PanelLeftClose className="w-4 h-4" /><span>Collapse</span></>}
          </button>
        </div>
      </aside>

      {/* ─── MOBILE SIDEBAR ─── */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileSidebarOpen(false)} className="lg:hidden fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="lg:hidden fixed left-0 top-0 bottom-0 w-[260px] bg-[#1d2327] text-white z-50 flex flex-col">
              <div className="flex items-center gap-3 px-4 h-16 border-b border-white/5 flex-shrink-0">
                <div className="w-9 h-9 bg-neutral-800 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0"><img src={logo} alt="" className="w-full h-full object-contain" /></div>
                <div className="min-w-0 flex-1"><h1 className="text-xs font-bold tracking-[0.15em] uppercase">B-Interiors</h1><p className="text-[9px] text-neutral-500 tracking-wider uppercase">Admin Console</p></div>
                <button onClick={() => setMobileSidebarOpen(false)} className="text-neutral-500 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
                {sidebarSections.map((section) => (
                  <div key={section.title}>
                    <p className="px-3 mb-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500">{section.title}</p>
                    <div className="space-y-0.5">
                      {section.items.filter((item: any) => {
                        const RM: Record<string, number> = { owner: 3, admin: 2, editor: 1 };
                        return !item.minRole || (RM[userRole] || 0) >= (RM[item.minRole] || 0);
                      }).map(item => (
                        <button key={item.id} onClick={() => { setActiveTab(item.id); setMobileSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] transition-all ${activeTab === item.id ? 'bg-white/10 text-white font-semibold' : 'text-neutral-400 hover:bg-white/5 hover:text-white'}`}>
                          <item.icon className="w-[18px] h-[18px]" /><span>{item.label}</span>
                          {getBadge(item.id) && <span className="ml-auto bg-blue-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{getBadge(item.id)}</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ─── MAIN CONTENT ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 bg-white border-b border-neutral-200 flex items-center gap-3 px-4 flex-shrink-0 z-10">
          <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden p-1.5 hover:bg-neutral-100 rounded-md"><PanelLeft className="w-5 h-5 text-neutral-600" /></button>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <a href="/" className="hover:text-neutral-900 transition-colors text-xs flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> Visit Site</a>
            <ChevronRight className="w-3 h-3" />
            <span className="text-neutral-900 font-medium text-xs capitalize">{activeTab.replace('-', ' ')}</span>
            <span className={`ml-2 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${userRole === 'owner' ? 'bg-neutral-900 text-white' : userRole === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-neutral-100 text-neutral-500'}`}>{userRole}</span>
          </div>
          <div className="flex-1" />
          <div className="hidden md:flex items-center gap-1.5 bg-neutral-100 rounded-lg px-3 py-1.5 w-64">
            <Search className="w-3.5 h-3.5 text-neutral-400" />
            <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent text-xs outline-none flex-1 text-neutral-700 placeholder:text-neutral-400" />
          </div>
          <div className="relative">
            <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="relative p-2 hover:bg-neutral-100 rounded-md transition-colors">
              <Bell className="w-4 h-4 text-neutral-500" />
              {unreadNotifications.length > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full px-1 animate-pulse">
                  {unreadNotifications.length > 99 ? '99+' : unreadNotifications.length}
                </span>
              )}
            </button>
            <AnimatePresence>
              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setNotificationsOpen(false)} />
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }} className="absolute right-0 top-full mt-2 w-96 bg-white border border-neutral-200 rounded-lg shadow-xl z-30 overflow-hidden">
                    <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-100 flex items-center justify-between">
                      <h4 className="text-[11px] uppercase tracking-[0.12em] font-bold text-neutral-700">
                        Notifications {unreadNotifications.length > 0 && <span className="text-red-500">({unreadNotifications.length})</span>}
                      </h4>
                      <div className="flex items-center gap-2">
                        {unreadNotifications.length > 0 && (
                          <button onClick={handleMarkAllRead} className="text-[10px] text-blue-600 hover:text-blue-800 font-medium">Mark all read</button>
                        )}
                        {notifications.length > 0 && (
                          <button onClick={handleClearAllNotifications} className="text-[10px] text-neutral-400 hover:text-red-600 font-medium">Clear</button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-neutral-50">
                      {notifications.slice(0, 30).map((notif: any) => {
                        const ICON_MAP: Record<string, { icon: any; bg: string; color: string }> = {
                          order: { icon: ShoppingCart, bg: 'bg-blue-50', color: 'text-blue-600' },
                          inquiry: { icon: MessageSquare, bg: 'bg-pink-50', color: 'text-pink-600' },
                          vendor: { icon: UserPlus, bg: 'bg-purple-50', color: 'text-purple-600' },
                          stock: { icon: AlertTriangle, bg: 'bg-amber-50', color: 'text-amber-600' },
                          review: { icon: Star, bg: 'bg-yellow-50', color: 'text-yellow-600' },
                          system: { icon: Settings, bg: 'bg-neutral-50', color: 'text-neutral-600' },
                        };
                        const iconInfo = ICON_MAP[notif.type] || ICON_MAP.system;
                        const IconComp = iconInfo.icon;
                        const ago = (() => {
                          const diff = Date.now() - new Date(notif.createdAt).getTime();
                          const mins = Math.floor(diff / 60000);
                          if (mins < 1) return 'just now';
                          if (mins < 60) return `${mins}m ago`;
                          const hrs = Math.floor(mins / 60);
                          if (hrs < 24) return `${hrs}h ago`;
                          return `${Math.floor(hrs / 24)}d ago`;
                        })();
                        return (
                          <div
                            key={notif.id}
                            className={`px-4 py-3 flex items-start gap-3 hover:bg-neutral-50 transition-colors cursor-pointer group ${!notif.read ? 'bg-blue-50/30' : ''}`}
                            onClick={() => {
                              if (!notif.read) handleMarkNotificationRead(notif.id);
                              if (notif.actionTab) { setActiveTab(notif.actionTab); setNotificationsOpen(false); }
                            }}
                          >
                            <div className={`p-1.5 ${iconInfo.bg} rounded-md flex-shrink-0 mt-0.5`}>
                              <IconComp className={`w-3.5 h-3.5 ${iconInfo.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className={`text-xs font-medium ${!notif.read ? 'text-neutral-900' : 'text-neutral-600'} line-clamp-1`}>{notif.title}</p>
                                {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />}
                              </div>
                              <p className="text-[10px] text-neutral-400 line-clamp-2 mt-0.5">{notif.message}</p>
                              <p className="text-[9px] text-neutral-300 mt-1">{ago}</p>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDismissNotification(notif.id); }}
                              className="p-1 rounded hover:bg-neutral-100 text-neutral-300 hover:text-neutral-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                      {notifications.length === 0 && (
                        <div className="px-4 py-10 text-center">
                          <CheckCircle2 className="w-8 h-8 text-neutral-200 mx-auto mb-2" />
                          <p className="text-xs text-neutral-400">No notifications yet</p>
                          <p className="text-[10px] text-neutral-300 mt-1">New orders, inquiries, and vendor applications will appear here</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
            <div className="w-7 h-7 bg-neutral-900 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
              {session?.user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <button onClick={handleLogout} className="text-xs text-neutral-500 hover:text-red-600 transition-colors font-medium">Sign Out</button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto p-4 md:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-32">
                <div className="w-10 h-10 border-2 border-neutral-200 border-t-neutral-900 animate-spin rounded-full" />
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {activeTab === 'dashboard' && <DashboardTab />}
                {activeTab === 'products' && <ProductsTab />}
                {activeTab === 'orders' && <OrdersTab />}
                {activeTab === 'customers' && <CustomersTab />}
                {activeTab === 'pages' && <PagesTab />}
                {activeTab === 'media' && <MediaTab />}
                {activeTab === 'reviews' && <ReviewsTab />}
                {activeTab === 'vendors' && <VendorsTab />}
                {activeTab === 'activity' && <ActivityTab />}
                {activeTab === 'settings' && canEdit && <SettingsTab />}
              </AnimatePresence>
            )}
          </div>
        </main>
      </div>

      {/* ─── MODALS ─── */}
      <AdminModals
        productModal={productModal} editingProduct={editingProduct} productGallery={productGallery}
        pageModal={pageModal} editingPage={editingPage}
        mediaUploadModal={mediaUploadModal}
        selectedOrder={selectedOrder}
        vendorModal={vendorModal} editingVendor={editingVendor}
        importModal={importModal} importPreview={importPreview} importLoading={importLoading}
        bulkUnlinkConfirm={bulkUnlinkConfirm}
        setProductModal={setProductModal} setEditingProduct={setEditingProduct} setProductGallery={setProductGallery}
        setPageModal={setPageModal} setEditingPage={setEditingPage}
        setMediaUploadModal={setMediaUploadModal}
        setSelectedOrder={setSelectedOrder}
        setVendorModal={setVendorModal} setEditingVendor={setEditingVendor}
        setImportModal={setImportModal} setImportPreview={setImportPreview}
        handleSaveProduct={handleSaveProduct}
        handleSavePage={handleSavePage}
        handleMediaUpload={handleMediaUpload}
        handleBulkImport={handleBulkImport}
        downloadImportTemplate={downloadImportTemplate}
      />

      {/* ─── PAGE BUILDER ─── */}
      <AnimatePresence>
        {pageBuilderOpen && (
          <PageBuilder
            page={editingPage}
            onSave={async (pageData) => {
              const url = editingPage ? `${API}/pages/${editingPage.id}` : `${API}/pages`;
              const method = editingPage ? 'PUT' : 'POST';
              const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(pageData) });
              if (res.ok) {
                toast.success(editingPage ? 'Page updated' : 'Page created');
                setPageBuilderOpen(false);
                setEditingPage(null);
                fetchData();
              } else {
                throw new Error('Save failed');
              }
            }}
            onClose={() => { setPageBuilderOpen(false); setEditingPage(null); }}
          />
        )}
      </AnimatePresence>
    </div>
    </AdminProvider>
  );
};