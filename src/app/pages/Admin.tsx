import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, Package, ShoppingCart, Users, FileText, Image, Star,
  Settings, Plus, Search, Bell, ChevronRight, UserPlus, AlertTriangle,
  PanelLeftClose, PanelLeft, Globe, X, Layers, Activity, MessageSquare,
  CheckCircle2, Shield, PanelsTopLeft, Mail, ExternalLink, Building2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { cloudflareAuth } from '../../../utils/cloudflare/client';
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
import { HomepageTab } from '../components/admin/HomepageTab';
import { CompanyTab } from '../components/admin/CompanyTab';
import { normalizeCompanyContent } from '../content/company';
import { normalizeHomepageContent } from '../content/homepage';
import { resolveProductCatalogue } from '../data/productCatalogue';

const API = `/api`;
const ADMIN_REQUEST_TIMEOUT = 10000;

const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = ADMIN_REQUEST_TIMEOUT) => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    window.clearTimeout(timeoutId);
  }
};

// ─── Sidebar Navigation Config ────────────────────────────────
const sidebarSections = [
  { title: 'Main', items: [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }] },
  { title: 'WooCommerce', items: [
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
  ]},
  { title: 'Content', items: [
    { id: 'homepage', label: 'Homepage', icon: PanelsTopLeft },
    { id: 'company', label: 'Company Profile', icon: Building2 },
    { id: 'pages', label: 'Pages', icon: FileText },
    { id: 'media', label: 'Media Library', icon: Image },
  ]},
  { title: 'Community', items: [
    { id: 'inquiries', label: 'Inquiries', icon: MessageSquare },
    { id: 'subscribers', label: 'Subscribers', icon: Mail },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'vendors', label: 'Artisan Guild', icon: Layers },
  ]},
  { title: 'System', items: [
    { id: 'activity', label: 'Activity Log', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings, minRole: 'admin' },
  ]},
];

const getInitialAdminTab = () => {
  if (typeof window === 'undefined') return 'dashboard';
  const requested = window.location.hash.replace(/^#/, '');
  return sidebarSections.some((section) => section.items.some((item) => item.id === requested)) ? requested : 'dashboard';
};

const exportProductsToExcel = (products: any[]) => {
  const rows = products.map(p => ({
    'Original ID': p.originalId || '',
    'Internal SKU': p.internalSku || p.sku || '',
    'Barcode (Code 128)': p.barcode || '',
    'Category': p.category || '',
    'Website Product Name': p.name || '',
    'Product Description': p.description || '',
    'Color': p.color || '',
    'Material / Finish': p.materialFinish || p.material || '',
    'Search Tags': p.searchTags || (p.tags || []).join(', '),
    'Est. Cost (ZAR)': p.costPrice ?? 0,
    'Est. Selling (ZAR)': p.price ?? 0,
    'Availability': p.availability || '',
    'Original Image Filename': p.originalImageFilename || '',
    'Pricing / Supplier Notes': p.pricingSupplierNotes || p.notes || '',
    'Previous Website Category': p.previousWebsiteCategory || '',
    'Main Image': p.mainImage || p.image || p.image_url || '',
    'Gallery Images': (p.galleryImageFiles || p.gallery?.map((item: any) => item.fileName) || []).join(', '),
    'Image Count': p.imageCount ?? p.gallery?.length ?? 0,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 12 }, { wch: 16 }, { wch: 18 }, { wch: 16 }, { wch: 34 }, { wch: 70 }, { wch: 16 }, { wch: 24 }, { wch: 42 }, { wch: 15 }, { wch: 16 }, { wch: 14 }, { wch: 30 }, { wch: 70 }, { wch: 24 }, { wch: 45 }, { wch: 70 }, { wch: 12 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Product Archive');
  XLSX.writeFile(wb, `B-Interiors_Products_${new Date().toISOString().slice(0, 10)}.xlsx`);
  toast.success('Product spreadsheet exported.');
};

// ═══════════════════════════════════════════════════════════════
// ADMIN COMPONENT (Orchestrator)
// ═══════════════════════════════════════════════════════════════
interface AdminProps {
  products: any[];
  onProductsChange: (products: any[]) => void;
}

export const Admin = ({ products, onProductsChange }: AdminProps) => {
  const [activeTab, setActiveTab] = useState(getInitialAdminTab);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Data state
  const [orders, setOrders] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [newsletterSubs, setNewsletterSubs] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [homepageContent, setHomepageContent] = useState<any>(() => normalizeHomepageContent());
  const [homepagePublishedAt, setHomepagePublishedAt] = useState<string | null>(null);
  const [companyContent, setCompanyContent] = useState<any>(() => normalizeCompanyContent());
  const [companyPublishedAt, setCompanyPublishedAt] = useState<string | null>(null);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [activityRoleFilter, setActivityRoleFilter] = useState('all');
  const [activityActionFilter, setActivityActionFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [session, setSession] = useState<any>(null);
  const hasLoadedRef = useRef(false);
  const refreshSessionPromiseRef = useRef<Promise<any> | null>(null);

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

  useEffect(() => {
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${activeTab}`);
  }, [activeTab]);

  // ─── Auth ───────────────────────────────────────────────────
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await cloudflareAuth.getSession();
        if (error) throw error;
        if (!session) { window.location.replace('/login'); return; }
        setAuthError(null);
        setSession(session);
      } catch (error) {
        console.error('Admin authentication failed:', error);
        setAuthError('We could not verify your session because the authentication service did not respond. Your login has not been cleared.');
      } finally {
        setAuthChecking(false);
      }
    };
    checkAuth();

    const { data: authListener } = cloudflareAuth.onAuthStateChange((event, nextSession) => {
      if (nextSession) {
        setSession(nextSession);
        setAuthChecking(false);
      } else if (event === 'SIGNED_OUT') {
        window.location.replace('/login?redirect=/admin');
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const authHeaders = useCallback(() => ({
    Authorization: `Bearer ${session?.access_token}`,
    'Content-Type': 'application/json',
  }), [session]);

  const authorizedFetch = useCallback(async (url: string, options: RequestInit = {}, timeout = ADMIN_REQUEST_TIMEOUT) => {
    const readSession = async (forceRefresh = false) => {
      if (forceRefresh) {
        if (!refreshSessionPromiseRef.current) {
          refreshSessionPromiseRef.current = cloudflareAuth.refreshSession()
            .then(({ data, error }) => (!error ? data.session : null))
            .finally(() => { refreshSessionPromiseRef.current = null; });
        }
        const refreshedSession = await refreshSessionPromiseRef.current;
        if (refreshedSession) return refreshedSession;
      }
      const { data, error } = await cloudflareAuth.getSession();
      if (error) throw error;
      return data.session;
    };

    let activeSession = await readSession(false);
    if (!activeSession) {
      const noSessionError: any = new Error('No active session');
      noSessionError.code = 'NO_SESSION';
      throw noSessionError;
    }

    const request = (token: string) => {
      const headers = new Headers(options.headers);
      headers.set('Authorization', `Bearer ${token}`);
      if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
      return fetchWithTimeout(url, { ...options, headers }, timeout);
    };

    let response = await request(activeSession.access_token);
    if (response.status !== 401) return response;

    activeSession = await readSession(true);
    if (!activeSession) return response;
    return request(activeSession.access_token);
  }, []);

  // ─── Data Fetching ──────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!session) return;
    const isFirstLoad = !hasLoadedRef.current;
    if (isFirstLoad) setLoading(true);
    else setRefreshing(true);
    setLoadError(null);
    try {
      const resources = [
        { key: 'products', path: '/products' },
        { key: 'orders', path: '/orders' },
        { key: 'vendors', path: '/vendors' },
        { key: 'reviews', path: '/all-reviews' },
        { key: 'inquiries', path: '/inquiries' },
        { key: 'subscribers', path: '/newsletter-subs' },
        { key: 'pages', path: '/pages' },
        { key: 'media', path: '/media' },
        { key: 'settings', path: '/site-settings' },
        { key: 'homepage', path: '/homepage-content/admin' },
        { key: 'company', path: '/company-content/admin' },
      ] as const;

      const results = await Promise.allSettled(resources.map(async (resource) => {
        const response = await authorizedFetch(`${API}${resource.path}`);
        if (!response.ok) {
          const resourceError: any = new Error(`${resource.key} returned ${response.status}`);
          resourceError.status = response.status;
          throw resourceError;
        }
        return {
          key: resource.key,
          data: await response.json(),
          catalogueVersion: resource.key === 'products'
            ? response.headers.get('X-Product-Catalogue-Version')
            : null,
        };
      }));

      if (results.some((result) => result.status === 'rejected' && (result.reason as any)?.code === 'NO_SESSION')) {
        window.location.replace('/login?redirect=/admin');
        return;
      }
      if (results.some((result) => result.status === 'rejected' && (result.reason as any)?.status === 401)) {
        const { data: sessionCheck } = await cloudflareAuth.getSession();
        if (!sessionCheck.session) {
          window.location.replace('/login?redirect=/admin');
          return;
        }
      }

      let loadedCount = 0;
      let loadedProtectedResourceCount = 0;
      const failedResources: string[] = [];
      const deniedResourceCount = results.filter((result) => result.status === 'rejected' && (result.reason as any)?.status === 403).length;
      const protectedResourceCount = resources.filter((resource) => resource.key !== 'products').length;
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          failedResources.push(resources[index].key);
          return;
        }
        loadedCount += 1;
        const { key, data, catalogueVersion } = result.value;
        if (key !== 'products') loadedProtectedResourceCount += 1;
        if (key === 'products') onProductsChange(resolveProductCatalogue(data, catalogueVersion));
        if (key === 'orders') setOrders(Array.isArray(data) ? data : []);
        if (key === 'vendors') setVendors(Array.isArray(data) ? data : []);
        if (key === 'reviews') setReviews(Array.isArray(data) ? data : []);
        if (key === 'inquiries') setInquiries(Array.isArray(data) ? data : []);
        if (key === 'subscribers') setNewsletterSubs(Array.isArray(data) ? data : []);
        if (key === 'pages') setPages(Array.isArray(data) ? data : []);
        if (key === 'media') setMedia(Array.isArray(data) ? data : []);
        if (key === 'settings') setSiteSettings(data);
        if (key === 'homepage') {
          setHomepageContent(normalizeHomepageContent(data?.draft || data?.published));
          setHomepagePublishedAt(data?.publishedAt || data?.published?.publishedAt || null);
        }
        if (key === 'company') {
          const hasDraft = data?.draft && Object.keys(data.draft).length;
          setCompanyContent(normalizeCompanyContent(hasDraft ? data.draft : data?.published));
          setCompanyPublishedAt(data?.publishedAt || null);
        }
      });

      if (failedResources.length) {
        setLoadError(`${failedResources.length} section${failedResources.length === 1 ? '' : 's'} could not be refreshed: ${failedResources.join(', ')}.`);
      }
      if (loadedProtectedResourceCount > 0) {
        setAccessDenied(false);
      }
      if (loadedCount > 0) {
        setLastUpdatedAt(new Date().toISOString());
      }
      hasLoadedRef.current = true;
      setLoading(false);
      setRefreshing(false);

      try {
        const alRes = await authorizedFetch(`${API}/activity-log`, {}, 6000);
        if (alRes.ok) {
          const alData = await alRes.json();
          setActivityLog(Array.isArray(alData) ? alData : []);
        }
      } catch { /* non-critical */ }

      // Fetch notifications
      try {
        const notifsRes = await authorizedFetch(`${API}/notifications`, {}, 6000);
        if (notifsRes.ok) {
          const notifsData = await notifsRes.json();
          setNotifications(Array.isArray(notifsData) ? notifsData : []);
        }
      } catch { /* non-critical */ }

      try {
        const roleRes = await authorizedFetch(`${API}/admin-role`, {}, 8000);
        if (roleRes.ok) {
          const roleData = await roleRes.json();
          setAccessDenied(false);
          setUserRole(roleData.role || 'editor');
          if (roleData.role === 'owner') {
            const teamRes = await authorizedFetch(`${API}/admin-roles`, {}, 6000);
            if (teamRes.ok) {
              const tmData = await teamRes.json();
              setTeamMembers(Array.isArray(tmData) ? tmData : []);
            }
          }
        } else if (roleRes.status === 403) {
          const accessIsConsistentlyDenied = loadedProtectedResourceCount === 0 && deniedResourceCount === protectedResourceCount;
          if (accessIsConsistentlyDenied) {
            setAccessDenied(true);
            setLoadError('This account is signed in, but it has not been assigned an administration role. Ask the site owner to add it under Settings → Team.');
          } else {
            setAccessDenied(false);
          }
        }
      } catch { /* role fetch optional */ }
    } catch (err) {
      console.error('Admin fetchData error:', err);
      setLoadError('The dashboard could not connect to the administration service. Your existing data is still shown where available.');
    } finally {
      hasLoadedRef.current = true;
      setLoading(false);
      setRefreshing(false);
    }
  }, [session, authorizedFetch, onProductsChange]);

  useEffect(() => { if (session) fetchData(); }, [session, fetchData]);

  // Poll notifications every 30s
  useEffect(() => {
    if (!session) return;
    const poll = setInterval(async () => {
      try {
        const res = await authorizedFetch(`${API}/notifications`, {}, 8000);
        if (res.ok) {
          const data = await res.json();
          setNotifications(Array.isArray(data) ? data : []);
        }
      } catch { /* silent */ }
    }, 30000);
    return () => clearInterval(poll);
  }, [session, authorizedFetch]);

  // ─── Actions ────────────────────────────────────────────────
  const handleLogout = async () => { await cloudflareAuth.signOut(); window.location.href = '/'; };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Delete this product permanently?')) return;
    try {
      const res = await authorizedFetch(`${API}/products/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (res.ok) { toast.success('Product deleted'); fetchData(); }
    } catch { toast.error('Failed to delete product'); }
  };

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());
    // Extract rooms and the catalogue search tags.
    const rooms = fd.getAll('rooms').map(r => String(r));
    const tagsRaw = String(data.searchTags || '');
    const tags = tagsRaw.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    const gallery = productGallery.map((item: any, index: number) => ({ ...item, position: index + 1 }));
    const sku = String(data.internalSku || editingProduct?.internalSku || editingProduct?.sku || '').trim();
    const availability = String(data.availability || 'Available').trim();
    const productName = String(data.name || '').trim();
    const productData: any = {
      ...data,
      sku,
      internalSku: sku,
      barcodeFormat: editingProduct?.barcodeFormat || 'CODE128',
      barcodeType: editingProduct?.barcodeType || 'Internal Code 128 (not retail GTIN)',
      material: String(data.materialFinish || ''),
      materialFinish: String(data.materialFinish || ''),
      costPrice: Number(data.costPrice) || 0,
      price: Number(data.price),
      currency: 'ZAR',
      availability,
      inStock: !/unavailable|out of stock|discontinued/i.test(availability),
      manageStock: editingProduct?.manageStock ?? false,
      stock: editingProduct?.stock ?? null,
      pricingSupplierNotes: String(data.pricingSupplierNotes || ''),
      notes: String(data.pricingSupplierNotes || ''),
      searchTags: tagsRaw,
      gallery,
      galleryImageFiles: gallery.map((item: any) => item.fileName).filter(Boolean),
      imageCount: gallery.length,
      mainImage: gallery[0]?.url || editingProduct?.mainImage || '',
      image: gallery[0]?.url || editingProduct?.image || '',
      rooms,
      tags,
      slug: editingProduct?.slug || `${productName.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${sku.toLowerCase()}`,
      sourceWorkbook: editingProduct?.sourceWorkbook || 'Admin dashboard',
    };
    try {
      const url = editingProduct ? `${API}/products/${editingProduct.id}` : `${API}/products`;
      const res = await authorizedFetch(url, { method: editingProduct ? 'PUT' : 'POST', headers: authHeaders(), body: JSON.stringify(productData) });
      if (res.ok) { toast.success(editingProduct ? 'Product updated' : 'Product created'); setProductModal(false); setEditingProduct(null); setProductGallery([]); fetchData(); }
    } catch { toast.error('Failed to save product'); }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm('Delete this review permanently?')) return;
    try {
      const res = await authorizedFetch(`${API}/reviews/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (res.ok) { toast.success('Review deleted'); fetchData(); }
    } catch { toast.error('Failed to delete review'); }
  };

  const handleDeleteSubscriber = async (id: string) => {
    if (!confirm('Remove this subscriber?')) return;
    try {
      const res = await authorizedFetch(`${API}/newsletter-subs/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (res.ok) { toast.success('Subscriber removed'); fetchData(); }
    } catch { toast.error('Failed to remove subscriber'); }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!confirm('Delete this inquiry permanently?')) return;
    try {
      const res = await authorizedFetch(`${API}/inquiries/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (res.ok) { toast.success('Inquiry deleted'); fetchData(); }
    } catch { toast.error('Failed to delete inquiry'); }
  };

  const handleUpdateInquiryStatus = async (id: string, status: string) => {
    try {
      const res = await authorizedFetch(`${API}/inquiries/${id}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ status }) });
      if (res.ok) { toast.success(`Inquiry marked as ${status}`); fetchData(); }
    } catch { toast.error('Failed to update inquiry'); }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await authorizedFetch(`${API}/orders/${orderId}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ status }) });
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
      const res = await authorizedFetch(`${API}/vendors/${id}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify(updates) });
      if (res.ok) { toast.success(updates.status ? `Vendor ${updates.status}` : 'Vendor profile updated'); fetchData(); }
      else { const data = await res.json(); toast.error(data.error || 'Failed to update vendor'); }
    } catch { toast.error('Failed to update vendor'); }
  };

  const handleDeleteVendor = async (id: string) => {
    if (!confirm('Remove this vendor application permanently?')) return;
    try {
      const res = await authorizedFetch(`${API}/vendors/${id}`, { method: 'DELETE', headers: authHeaders() });
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
      const res = await authorizedFetch(url, { method: editingPage ? 'PUT' : 'POST', headers: authHeaders(), body: JSON.stringify(data) });
      if (res.ok) { toast.success(editingPage ? 'Page updated' : 'Page created'); setPageModal(false); setEditingPage(null); fetchData(); }
    } catch { toast.error('Failed to save page'); }
  };

  const handleDeletePage = async (id: string) => {
    if (!confirm('Delete this page permanently?')) return;
    try {
      const res = await authorizedFetch(`${API}/pages/${id}`, { method: 'DELETE', headers: authHeaders() });
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
          const res = await authorizedFetch(`${API}/media/upload`, {
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
      const res = await authorizedFetch(`${API}/media/${id}`, { method: 'DELETE', headers: authHeaders() });
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
      const res = await authorizedFetch(`${API}/site-settings`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) });
      if (res.ok) { toast.success('Settings saved'); fetchData(); }
    } catch { toast.error('Failed to save settings'); }
  };

  const handleSaveHomepage = async (content: any, publish = false) => {
    try {
      const draftRes = await authorizedFetch(`${API}/homepage-content`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(content),
      });
      if (!draftRes.ok) {
        const error = await draftRes.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to save homepage draft');
      }

      if (publish) {
        const publishRes = await authorizedFetch(`${API}/homepage-content/publish`, { method: 'POST', headers: authHeaders() });
        if (!publishRes.ok) {
          const error = await publishRes.json().catch(() => ({}));
          throw new Error(error.error || 'Failed to publish homepage');
        }
        toast.success('Homepage published');
      } else {
        toast.success('Homepage draft saved');
      }

      await fetchData();
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Failed to save homepage');
      return false;
    }
  };

  const handleSaveCompany = async (content: any, publish = false) => {
    try {
      const draftRes = await authorizedFetch(`${API}/company-content`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(content) });
      if (!draftRes.ok) {
        const error = await draftRes.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to save company profile');
      }
      if (publish) {
        const publishRes = await authorizedFetch(`${API}/company-content/publish`, { method: 'POST', headers: authHeaders() });
        if (!publishRes.ok) {
          const error = await publishRes.json().catch(() => ({}));
          throw new Error(error.error || 'Failed to publish company profile');
        }
        toast.success('Company profile published');
      } else {
        toast.success('Company profile draft saved');
      }
      await fetchData();
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Failed to save company profile');
      return false;
    }
  };

  const handleQuickLinkProduct = async (productId: string, vendorId: string) => {
    try {
      const res = await authorizedFetch(`${API}/products/${productId}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ vendorId }) });
      if (res.ok) { toast.success('Product linked to vendor'); fetchData(); }
    } catch { toast.error('Failed to link product'); }
  };

  const handleBulkLinkProducts = async (productIds: string[], vendorId: string) => {
    setQuickLinkLoading(true);
    let linked = 0;
    try {
      await Promise.all(productIds.map(async (pid) => {
        const res = await authorizedFetch(`${API}/products/${pid}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ vendorId }) });
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
      const res = await authorizedFetch(`${API}/products/${productId}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ vendorId: '' }) });
      if (res.ok) { toast.success('Product unlinked'); fetchData(); }
    } catch { toast.error('Failed to unlink product'); }
  };

  const handleBulkUnlinkProducts = async (productIds: string[]) => {
    setBulkUnlinkLoading(true);
    let unlinked = 0;
    try {
      await Promise.all(productIds.map(async (pid) => {
        const res = await authorizedFetch(`${API}/products/${pid}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ vendorId: '' }) });
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
      const res = await authorizedFetch(`${API}/products/bulk`, {
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
      {
        'Original ID': 'BI-001',
        'Internal SKU': 'BID-CHA-001',
        'Barcode (Code 128)': 'BID-CHA-001',
        Category: 'Chairs',
        'Website Product Name': 'Example Accent Chair',
        'Product Description': 'A handcrafted accent chair.',
        Color: 'Walnut / Cream',
        'Material / Finish': 'Solid timber, woven upholstery',
        'Search Tags': 'chair, accent, walnut, cream',
        'Est. Cost (ZAR)': 5000,
        'Est. Selling (ZAR)': 8500,
        Availability: 'Made to order',
        'Original Image Filename': 'example-chair.jpg',
        'Pricing / Supplier Notes': 'Confirm lead time before ordering.',
        'Previous Website Category': 'Seating',
        'Main Image': 'BID-CHA-001_01.jpg',
        'Gallery Images': 'BID-CHA-001_01.jpg, BID-CHA-001_02.jpg',
        'Image Count': 2,
      },
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    ws['!cols'] = [12, 18, 20, 15, 30, 42, 20, 30, 35, 18, 20, 18, 28, 35, 24, 28, 45, 12].map(wch => ({ wch }));
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
      await authorizedFetch(`${API}/notifications/${id}/read`, { method: 'PATCH', headers: authHeaders() });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch { /* silent */ }
  };

  const handleMarkAllRead = async () => {
    try {
      await authorizedFetch(`${API}/notifications/read-all`, { method: 'POST', headers: authHeaders() });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch { /* silent */ }
  };

  const handleDismissNotification = async (id: string) => {
    try {
      await authorizedFetch(`${API}/notifications/${id}`, { method: 'DELETE', headers: authHeaders() });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch { /* silent */ }
  };

  const handleClearAllNotifications = async () => {
    if (!confirm('Clear all notifications?')) return;
    try {
      await authorizedFetch(`${API}/notifications`, { method: 'DELETE', headers: authHeaders() });
      setNotifications([]);
      toast.success('Notifications cleared');
    } catch { toast.error('Failed to clear notifications'); }
  };

  // ─── Team Management ──────────────────────────────────────
  const handleInviteTeamMember = async () => {
    if (!inviteEmail.trim()) return;
    try {
      const res = await authorizedFetch(`${API}/admin-roles`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }) });
      const data = await res.json();
      if (res.ok) { toast.success(`${inviteEmail} added as ${inviteRole}`); setInviteEmail(''); fetchData(); }
      else { toast.error(data.error || 'Failed to add team member'); }
    } catch { toast.error('Failed to invite team member'); }
  };

  const handleRemoveTeamMember = async (userId: string, email: string) => {
    if (!confirm(`Remove ${email} from the admin team?`)) return;
    try {
      const res = await authorizedFetch(`${API}/admin-roles/${userId}`, { method: 'DELETE', headers: authHeaders() });
      if (res.ok) { toast.success(`${email} removed`); fetchData(); }
      else { const d = await res.json(); toast.error(d.error); }
    } catch { toast.error('Failed to remove team member'); }
  };

  const handleUpdateTeamRole = async (userId: string, email: string, role: string) => {
    try {
      const res = await authorizedFetch(`${API}/admin-roles`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ email, role }) });
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

  const nonRevenueStatuses = new Set(['pending', 'pending_payment', 'cancelled', 'failed', 'refunded']);
  const paidOrders = _orders.filter((order: any) => !nonRevenueStatuses.has(String(order.status || '').toLowerCase()));
  const totalRevenue = paidOrders.reduce((sum: number, order: any) => sum + (Number(order.total) || 0), 0);
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  const paidOrdersLast30Days = paidOrders.filter((order: any) => {
    const createdAt = new Date(order.createdAt).getTime();
    return Number.isFinite(createdAt) && createdAt >= thirtyDaysAgo;
  });
  const revenueLast30Days = paidOrdersLast30Days.reduce((sum: number, order: any) => sum + (Number(order.total) || 0), 0);
  const ordersLast30Days = paidOrdersLast30Days.length;
  const averageOrderValue = paidOrders.length ? totalRevenue / paidOrders.length : 0;
  const itemsSold = paidOrders.reduce((sum: number, order: any) => sum + (order.items || []).reduce((itemSum: number, item: any) => itemSum + (Number(item.quantity) || 1), 0), 0);
  const uniqueCustomers = new Set(_orders.map((order: any) => order.customerInfo?.email?.trim().toLowerCase()).filter(Boolean)).size;
  const avgRating = _reviews.length ? (_reviews.reduce((sum: number, review: any) => sum + (Number(review.rating) || 0), 0) / _reviews.length) : 0;
  const pendingVendors = _vendors.filter((v: any) => v.status === 'pending').length;

  const revenueByMonth = (() => {
    const months: Record<string, { label: string; revenue: number }> = {};
    paidOrders.forEach((order: any) => {
      const date = new Date(order.createdAt);
      if (!Number.isFinite(date.getTime())) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!months[key]) months[key] = { label: date.toLocaleDateString('en-ZA', { month: 'short', year: '2-digit' }), revenue: 0 };
      months[key].revenue += Number(order.total) || 0;
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([, value]) => ({ month: value.label, Revenue: value.revenue }));
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
    paidOrders.forEach((o: any) => {
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
    if (id === 'inquiries') return _inquiries.filter((item: any) => !item.status || item.status === 'new').length || undefined;
    if (id === 'subscribers') return newsletterSubs.length || undefined;
    if (id === 'vendors') return pendingVendors || undefined;
    if (id === 'reviews') return _reviews.length || undefined;
    return undefined;
  };

  if (authChecking) {
    return (
      <div className="fixed inset-0 z-[60] flex min-h-screen items-center justify-center bg-[#f0f0f1]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
            <img src={logo} alt="B-Interiors" className="h-full w-full object-contain" />
          </div>
          <div className="mx-auto h-1 w-36 overflow-hidden rounded-full bg-neutral-200">
            <motion.div className="h-full w-1/2 bg-[#2271b1]" animate={{ x: ['-100%', '200%'] }} transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }} />
          </div>
          <p className="mt-3 text-xs text-neutral-500">Opening administration…</p>
        </div>
      </div>
    );
  }

  if (authError && !session) {
    return (
      <div className="fixed inset-0 z-[60] flex min-h-screen items-center justify-center bg-[#f0f0f1] px-5">
        <div className="w-full max-w-md border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <AlertTriangle className="mx-auto mb-4 h-8 w-8 text-amber-600" />
          <h1 className="text-xl text-neutral-900" style={{ fontFamily: 'var(--font-playfair)' }}>Session check interrupted</h1>
          <p className="mt-2 text-sm leading-relaxed text-neutral-500">{authError}</p>
          <button onClick={() => window.location.reload()} className="mt-6 rounded-sm bg-[#2271b1] px-4 py-2 text-xs font-semibold text-white hover:bg-[#135e96]">Try again</button>
        </div>
      </div>
    );
  }

  if (!session) return null;

  // ─── Context Store ──────────────────────────────────────────
  const store: AdminStore = {
    products, orders, vendors, reviews, inquiries, newsletterSubs, pages, media,
    siteSettings, homepageContent, homepagePublishedAt, companyContent, companyPublishedAt, activityLog, teamMembers,
    session, userRole, canEdit, canDelete, isOwner,
    searchQuery, setSearchQuery, setActiveTab, refreshing, loadError, lastUpdatedAt,
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
    handleSaveSettings, handleSaveHomepage, handleSaveCompany,
    handleQuickLinkProduct, handleBulkLinkProducts,
    handleUnlinkProduct, handleBulkUnlinkProducts,
    handleInviteTeamMember, handleRemoveTeamMember, handleUpdateTeamRole,
    handleImportFile, handleBulkImport, downloadImportTemplate,
    exportProductsToExcel, exportOrdersToExcel,
    totalRevenue, avgRating, pendingVendors,
    revenueByMonth, ordersByStatus, productsByCategory, topProducts, lowStockProducts,
    paidOrders, revenueLast30Days, ordersLast30Days, averageOrderValue, itemsSold, uniqueCustomers,
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
              <p className="text-[9px] text-neutral-500 tracking-wider uppercase">Commerce & Content</p>
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
                <div className="min-w-0 flex-1"><h1 className="text-xs font-bold tracking-[0.15em] uppercase">B-Interiors</h1><p className="text-[9px] text-neutral-500 tracking-wider uppercase">Commerce & Content</p></div>
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
        <header className="h-12 bg-[#1d2327] border-b border-black/50 text-white flex items-center gap-3 px-3 md:px-4 flex-shrink-0 z-10 shadow-sm">
          <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden p-1.5 hover:bg-white/10 rounded-sm"><PanelLeft className="w-5 h-5 text-neutral-300" /></button>
          <div className="flex min-w-0 items-center gap-2 text-sm text-neutral-400">
            <a href="/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors text-xs flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Visit Site</span><ExternalLink className="hidden h-3 w-3 sm:block" /></a>
            <ChevronRight className="hidden w-3 h-3 sm:block" />
            <span className="truncate text-xs font-medium capitalize text-white">{activeTab.replace('-', ' ')}</span>
            <span className={`hidden sm:inline-flex ml-1 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${userRole === 'owner' ? 'bg-[#2271b1] text-white' : userRole === 'admin' ? 'bg-blue-500/20 text-blue-200' : 'bg-white/10 text-neutral-300'}`}>{userRole}</span>
          </div>
          {canEdit && <button onClick={() => { setEditingProduct(null); setProductGallery([]); setProductModal(true); }} className="hidden sm:flex items-center gap-1.5 border-l border-white/10 pl-3 text-xs text-neutral-300 hover:text-white"><Plus className="h-3.5 w-3.5" /> New product</button>}
          <div className="flex-1" />
          <div className="hidden md:flex items-center gap-1.5 bg-white/10 border border-white/10 rounded-sm px-3 py-1.5 w-64">
            <Search className="w-3.5 h-3.5 text-neutral-400" />
            <input type="text" placeholder={`Search ${activeTab}…`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent text-xs outline-none flex-1 text-white placeholder:text-neutral-500" />
          </div>
          <div className="relative">
            <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="relative p-2 hover:bg-white/10 rounded-sm transition-colors">
              <Bell className="w-4 h-4 text-neutral-300" />
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
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <div className="w-7 h-7 bg-[#2271b1] rounded-full flex items-center justify-center text-white text-[10px] font-bold">
              {session?.user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <button onClick={handleLogout} className="hidden text-xs text-neutral-300 hover:text-white transition-colors font-medium sm:block">Sign Out</button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto p-4 md:p-6">
            {loadError && !loading && !accessDenied && (
              <div className="mb-5 flex flex-col gap-3 border-l-4 border-amber-500 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                  <div><p className="text-xs font-semibold text-neutral-900">Some administration data is unavailable</p><p className="mt-0.5 text-[11px] text-neutral-500">{loadError}</p></div>
                </div>
                <button onClick={fetchData} disabled={refreshing} className="flex items-center gap-1.5 self-start rounded-sm border border-[#2271b1] px-3 py-1.5 text-[11px] font-semibold text-[#2271b1] hover:bg-[#f0f6fc] disabled:opacity-50 sm:self-auto">
                  <Activity className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Retry
                </button>
              </div>
            )}
            {loading ? (
              <div className="space-y-5 py-2" aria-label="Loading administration data">
                <div className="h-8 w-52 animate-pulse rounded bg-neutral-200" />
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                  {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-28 animate-pulse border border-neutral-200 bg-white" />)}
                </div>
                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="h-80 animate-pulse border border-neutral-200 bg-white lg:col-span-2" />
                  <div className="h-80 animate-pulse border border-neutral-200 bg-white" />
                </div>
              </div>
            ) : accessDenied ? (
              <div className="mx-auto mt-12 max-w-xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-700"><Shield className="h-5 w-5" /></div>
                <h2 className="text-2xl text-neutral-900" style={{ fontFamily: 'var(--font-playfair)' }}>Administration access required</h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-neutral-500">You are still signed in as <strong className="text-neutral-700">{session?.user?.email}</strong>, but this account is not assigned to the admin team. The site owner can add it from Settings → Team.</p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button onClick={fetchData} disabled={refreshing} className="inline-flex items-center gap-2 rounded-sm bg-[#2271b1] px-4 py-2 text-xs font-semibold text-white hover:bg-[#135e96] disabled:opacity-50"><Activity className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Check again</button>
                  <button onClick={handleLogout} className="rounded-sm border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50">Use another account</button>
                </div>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {activeTab === 'dashboard' && <DashboardTab />}
                {activeTab === 'products' && <ProductsTab />}
                {activeTab === 'orders' && <OrdersTab />}
                {activeTab === 'customers' && <CustomersTab />}
                {activeTab === 'inquiries' && <CustomersTab view="inquiries" />}
                {activeTab === 'subscribers' && <CustomersTab view="subscribers" />}
                {activeTab === 'homepage' && <HomepageTab />}
                {activeTab === 'company' && <CompanyTab />}
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
              const res = await authorizedFetch(url, { method, headers: authHeaders(), body: JSON.stringify(pageData) });
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
