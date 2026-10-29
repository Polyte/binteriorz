import React, { createContext, useContext } from 'react';

export interface AdminStore {
  // Data
  products: any[];
  orders: any[];
  vendors: any[];
  reviews: any[];
  inquiries: any[];
  newsletterSubs: any[];
  pages: any[];
  media: any[];
  siteSettings: any;
  homepageContent: any;
  homepagePublishedAt: string | null;
  companyContent: any;
  companyPublishedAt: string | null;
  activityLog: any[];
  teamMembers: any[];

  // Auth & Role
  session: any;
  userRole: string;
  canEdit: boolean;
  canDelete: boolean;
  isOwner: boolean;

  // UI State
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  setActiveTab: (tab: string) => void;
  refreshing: boolean;
  loadError: string | null;
  lastUpdatedAt: string | null;

  // Modal openers
  setProductModal: (v: boolean) => void;
  setEditingProduct: (p: any) => void;
  setProductGallery: (g: any[]) => void;
  setPageModal: (v: boolean) => void;
  setEditingPage: (p: any) => void;
  setMediaUploadModal: (v: boolean) => void;
  setSelectedOrder: (o: any) => void;
  setVendorModal: (v: boolean) => void;
  setEditingVendor: (v: any) => void;
  setImportModal: (v: boolean) => void;
  setPageBuilderOpen: (v: boolean) => void;

  // Vendor modal sub-state
  vendorStatusFilter: string;
  setVendorStatusFilter: (v: string) => void;
  quickLinkOpen: boolean;
  setQuickLinkOpen: (v: boolean) => void;
  quickLinkSearch: string;
  setQuickLinkSearch: (v: string) => void;
  quickLinkSelected: Set<string>;
  setQuickLinkSelected: React.Dispatch<React.SetStateAction<Set<string>>>;
  quickLinkLoading: boolean;
  bulkUnlinkMode: boolean;
  setBulkUnlinkMode: (v: boolean) => void;
  bulkUnlinkSelected: Set<string>;
  setBulkUnlinkSelected: React.Dispatch<React.SetStateAction<Set<string>>>;
  bulkUnlinkLoading: boolean;
  bulkUnlinkConfirm: boolean;
  setBulkUnlinkConfirm: (v: boolean) => void;

  // Activity filters
  activityRoleFilter: string;
  setActivityRoleFilter: (v: string) => void;
  activityActionFilter: string;
  setActivityActionFilter: (v: string) => void;

  // Team invite
  inviteEmail: string;
  setInviteEmail: (v: string) => void;
  inviteRole: string;
  setInviteRole: (v: string) => void;

  // Import
  importFileRef: React.RefObject<HTMLInputElement | null>;
  importPreview: any[];
  importLoading: boolean;

  // Actions
  authHeaders: () => Record<string, string>;
  fetchData: () => void;
  handleDeleteProduct: (id: string) => void;
  handleDeleteReview: (id: string) => void;
  handleDeleteSubscriber: (id: string) => void;
  handleDeleteInquiry: (id: string) => void;
  handleUpdateInquiryStatus: (id: string, status: string) => void;
  handleUpdateOrderStatus: (orderId: string, status: string) => void;
  handleDeletePage: (id: string) => void;
  handleDeleteMedia: (id: string) => void;
  handleUpdateVendor: (id: string, updates: any) => void;
  handleDeleteVendor: (id: string) => void;
  handleSaveVendorProfile: (e: React.FormEvent<HTMLFormElement>) => void;
  handleSaveSettings: (e: React.FormEvent<HTMLFormElement>) => void;
  handleSaveHomepage: (content: any, publish?: boolean) => Promise<boolean>;
  handleSaveCompany: (content: any, publish?: boolean) => Promise<boolean>;
  handleQuickLinkProduct: (productId: string, vendorId: string) => void;
  handleBulkLinkProducts: (productIds: string[], vendorId: string) => void;
  handleUnlinkProduct: (productId: string) => void;
  handleBulkUnlinkProducts: (productIds: string[]) => void;
  handleInviteTeamMember: () => void;
  handleRemoveTeamMember: (userId: string, email: string) => void;
  handleUpdateTeamRole: (userId: string, email: string, role: string) => void;
  handleImportFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBulkImport: () => void;
  downloadImportTemplate: () => void;
  exportProductsToExcel: (products: any[]) => void;
  exportOrdersToExcel: () => void;

  // Derived analytics
  totalRevenue: number;
  avgRating: number;
  pendingVendors: number;
  revenueByMonth: any[];
  ordersByStatus: any[];
  productsByCategory: any[];
  topProducts: any[];
  lowStockProducts: any[];
  paidOrders: any[];
  revenueLast30Days: number;
  ordersLast30Days: number;
  averageOrderValue: number;
  itemsSold: number;
  uniqueCustomers: number;
}

const AdminContext = createContext<AdminStore | null>(null);

export const AdminProvider = AdminContext.Provider;

export function useAdmin(): AdminStore {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}

// Shared helpers
export const CHART_COLORS = ['#171717', '#525252', '#a3a3a3', '#d4d4d4', '#e5e5e5'];
export const PIE_COLORS = ['#171717', '#404040', '#737373', '#a3a3a3', '#d4d4d4'];

export const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-neutral-900 text-white px-4 py-3 rounded-lg shadow-2xl text-xs">
      <p className="font-bold mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-neutral-300">
          {p.name}: <span className="text-white font-bold">{typeof p.value === 'number' && p.name.includes('Revenue') ? `R ${p.value.toLocaleString()}` : p.value}</span>
        </p>
      ))}
    </div>
  );
};

export const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

export const ROOM_OPTIONS = [
  { slug: 'living-room', label: 'Living Room' },
  { slug: 'bedroom', label: 'Bedroom' },
  { slug: 'dining-room', label: 'Dining Room' },
  { slug: 'home-office', label: 'Home Office' },
  { slug: 'outdoor', label: 'Outdoor' },
  { slug: 'bathroom', label: 'Bathroom' },
  { slug: 'kitchen', label: 'Kitchen' },
  { slug: 'entryway', label: 'Entryway' },
];
