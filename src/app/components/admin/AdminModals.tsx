import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Image, Film, Upload, Plus, Link2, Loader2, GripVertical, Star,
  Trash2, Package, Mail, CheckCircle2, Unlink
} from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { toast } from 'sonner';
import { useAdmin, ROOM_OPTIONS } from './AdminContext';

const API = `/api`;
const GALLERY_ITEM_TYPE = 'GALLERY_ITEM';

// ─── Draggable Gallery Item ───────────────────────────────────
const DraggableGalleryItem = ({ item, index, onReorder, onRemove, onSetCover }: {
  item: any; index: number;
  onReorder: (from: number, to: number) => void;
  onRemove: (idx: number) => void;
  onSetCover: (idx: number) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag({
    type: GALLERY_ITEM_TYPE,
    item: { index },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });
  const [{ isOver }, drop] = useDrop({
    accept: GALLERY_ITEM_TYPE,
    hover: (dragged: { index: number }) => {
      if (dragged.index !== index) {
        onReorder(dragged.index, index);
        dragged.index = index;
      }
    },
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  });
  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`relative group aspect-square rounded-lg overflow-hidden border-2 bg-neutral-100 cursor-grab active:cursor-grabbing transition-all ${
        isDragging ? 'opacity-30 scale-95 border-blue-400' : isOver ? 'border-blue-300 scale-[1.02]' : 'border-neutral-200'
      }`}
    >
      {item.type === 'video' ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-900 text-white">
          <Film className="w-5 h-5 mb-1 opacity-60" />
          <span className="text-[8px] uppercase tracking-wider opacity-50">Video</span>
        </div>
      ) : (
        <img src={item.url} alt="" className="w-full h-full object-cover" />
      )}
      {index === 0 && (
        <span className="absolute top-1 left-1 bg-neutral-900 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Cover</span>
      )}
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="w-3.5 h-3.5 text-white drop-shadow-md" />
      </div>
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
        {index > 0 && (
          <button type="button" onClick={() => onSetCover(index)} className="p-1.5 bg-white rounded-full shadow hover:bg-neutral-100 transition-colors" title="Set as cover">
            <Star className="w-3 h-3 text-neutral-700" />
          </button>
        )}
        <button type="button" onClick={() => onRemove(index)} className="p-1.5 bg-white rounded-full shadow hover:bg-red-50 transition-colors" title="Remove">
          <Trash2 className="w-3 h-3 text-red-600" />
        </button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// ALL ADMIN MODALS
// ═══════════════════════════════════════════════════════════════
export const AdminModals = ({
  productModal, editingProduct, productGallery,
  pageModal, editingPage,
  mediaUploadModal,
  selectedOrder,
  vendorModal, editingVendor,
  importModal, importPreview, importLoading,
  bulkUnlinkConfirm,
  // Setters
  setProductModal, setEditingProduct, setProductGallery,
  setPageModal, setEditingPage,
  setMediaUploadModal,
  setSelectedOrder,
  setVendorModal, setEditingVendor,
  setImportModal, setImportPreview,
  // Handlers
  handleSaveProduct,
  handleSavePage,
  handleMediaUpload,
  handleBulkImport,
  downloadImportTemplate,
}: any) => {
  const store = useAdmin();
  const {
    products, orders, vendors, session, canDelete,
    quickLinkOpen, setQuickLinkOpen, quickLinkSearch, setQuickLinkSearch,
    quickLinkSelected, setQuickLinkSelected, quickLinkLoading,
    bulkUnlinkMode, setBulkUnlinkMode,
    bulkUnlinkSelected, setBulkUnlinkSelected, bulkUnlinkLoading,
    setBulkUnlinkConfirm,
    handleUpdateVendor, handleDeleteVendor, handleSaveVendorProfile,
    handleUpdateOrderStatus, handleBulkLinkProducts, handleUnlinkProduct,
    handleBulkUnlinkProducts,
  } = store;

  // Product gallery local state for this modal
  const [galleryUrlInput, setGalleryUrlInput] = useState('');
  const [galleryUploading, setGalleryUploading] = useState(false);
  const galleryFileRef = useRef<HTMLInputElement>(null);

  const handleGalleryFileUpload = async (files: FileList) => {
    setGalleryUploading(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      if (!isVideo && !isImage) { toast.error(`${file.name}: Only images and videos are supported`); continue; }
      const reader = new FileReader();
      await new Promise<void>((resolve) => {
        reader.onload = async () => {
          const base64 = (reader.result as string).split(',')[1];
          try {
            const res = await fetch(`${API}/media/upload`, {
              method: 'POST', headers: store.authHeaders(),
              body: JSON.stringify({ fileName: file.name, fileType: file.type, fileSize: file.size, base64Data: base64 }),
            });
            if (res.ok) {
              const mediaItem = await res.json();
              setProductGallery((prev: any[]) => [...prev, { url: mediaItem.url, type: isVideo ? 'video' : 'image', fileName: file.name, mediaId: mediaItem.id }]);
              toast.success(`${file.name} uploaded`);
            } else { const err = await res.json(); toast.error(err.error || `Upload failed for ${file.name}`); }
          } catch { toast.error(`Failed to upload ${file.name}`); }
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }
    setGalleryUploading(false);
  };

  const handleGalleryAddUrl = () => {
    if (!galleryUrlInput.trim()) return;
    const url = galleryUrlInput.trim();
    const isVideo = /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url) || url.includes('youtube') || url.includes('vimeo');
    setProductGallery((prev: any[]) => [...prev, { url, type: isVideo ? 'video' : 'image', fileName: url.split('/').pop() || 'external' }]);
    setGalleryUrlInput('');
    toast.success('Media added to gallery');
  };

  const handleGalleryRemove = (index: number) => {
    setProductGallery((prev: any[]) => prev.filter((_: any, i: number) => i !== index));
  };

  const handleGalleryReorder = (from: number, to: number) => {
    setProductGallery((prev: any[]) => {
      const arr = [...prev];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      {/* ═══ PRODUCT MODAL ═══ */}
      <AnimatePresence>
        {productModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setProductModal(false); setProductGallery([]); }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-white shadow-2xl rounded-xl overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="p-5 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <div>
                  <h3 className="text-lg font-serif text-neutral-900">{editingProduct ? 'Edit Product' : 'New Product'}</h3>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">Product Management</p>
                </div>
                <button onClick={() => { setProductModal(false); setProductGallery([]); }} className="p-1.5 hover:bg-neutral-100 rounded-md transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleSaveProduct} className="p-5 space-y-5">
                {/* Workbook-aligned product fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mb-1 block">Original ID</label>
                    <input name="originalId" defaultValue={editingProduct?.originalId} placeholder="BI-001" className="w-full bg-neutral-50 border border-neutral-200 rounded-md py-2.5 px-3 text-sm font-mono outline-none focus:border-neutral-900 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mb-1 block">Internal SKU</label>
                    <input name="internalSku" defaultValue={editingProduct?.internalSku || editingProduct?.sku} required placeholder="BID-CHA-001" className="w-full bg-neutral-50 border border-neutral-200 rounded-md py-2.5 px-3 text-sm font-mono outline-none focus:border-neutral-900 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mb-1 block">Barcode (Code 128)</label>
                    <input name="barcode" defaultValue={editingProduct?.barcode} placeholder="BID-CHA-001" className="w-full bg-neutral-50 border border-neutral-200 rounded-md py-2.5 px-3 text-sm font-mono outline-none focus:border-neutral-900 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mb-1 block">Category</label>
                    <input name="category" list="product-categories" defaultValue={editingProduct?.category} required placeholder="Chairs" className="w-full bg-neutral-50 border border-neutral-200 rounded-md py-2.5 px-3 text-sm outline-none focus:border-neutral-900 transition-colors" />
                    <datalist id="product-categories">
                      {[...new Set(products.map((product: any) => product.category).filter(Boolean))].sort().map((category: any) => <option key={category} value={category} />)}
                    </datalist>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mb-1 block">Website Product Name</label>
                    <input name="name" defaultValue={editingProduct?.name} required className="w-full bg-neutral-50 border border-neutral-200 rounded-md py-2.5 px-3 text-sm outline-none focus:border-neutral-900 transition-colors" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mb-1 block">Product Description</label>
                    <textarea name="description" defaultValue={editingProduct?.description} rows={3} className="w-full bg-neutral-50 border border-neutral-200 rounded-md py-2.5 px-3 text-sm outline-none focus:border-neutral-900 transition-colors resize-y" placeholder="Describe the product..." />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mb-1 block">Color</label>
                    <input name="color" defaultValue={editingProduct?.color} className="w-full bg-neutral-50 border border-neutral-200 rounded-md py-2.5 px-3 text-sm outline-none focus:border-neutral-900 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mb-1 block">Material / Finish</label>
                    <input name="materialFinish" defaultValue={editingProduct?.materialFinish || editingProduct?.material} className="w-full bg-neutral-50 border border-neutral-200 rounded-md py-2.5 px-3 text-sm outline-none focus:border-neutral-900 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mb-1 block">Estimated Cost (R)</label>
                    <input name="costPrice" type="number" min="0" step="0.01" defaultValue={editingProduct?.costPrice} className="w-full bg-neutral-50 border border-neutral-200 rounded-md py-2.5 px-3 text-sm outline-none focus:border-neutral-900 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mb-1 block">Estimated Selling (R)</label>
                    <input name="price" type="number" min="0" step="0.01" defaultValue={editingProduct?.price} required className="w-full bg-neutral-50 border border-neutral-200 rounded-md py-2.5 px-3 text-sm outline-none focus:border-neutral-900 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mb-1 block">Availability</label>
                    <input name="availability" defaultValue={editingProduct?.availability || 'Available'} placeholder="Available / Made to order" className="w-full bg-neutral-50 border border-neutral-200 rounded-md py-2.5 px-3 text-sm outline-none focus:border-neutral-900 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mb-1 block">Previous Website Category</label>
                    <input name="previousWebsiteCategory" defaultValue={editingProduct?.previousWebsiteCategory} className="w-full bg-neutral-50 border border-neutral-200 rounded-md py-2.5 px-3 text-sm outline-none focus:border-neutral-900 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mb-1 block">Original Image Filename</label>
                    <input name="originalImageFilename" defaultValue={editingProduct?.originalImageFilename} className="w-full bg-neutral-50 border border-neutral-200 rounded-md py-2.5 px-3 text-sm font-mono outline-none focus:border-neutral-900 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mb-1 block">Vendor / Artisan</label>
                    <select name="vendorId" defaultValue={editingProduct?.vendorId || ''} className="w-full bg-neutral-50 border border-neutral-200 rounded-md py-2.5 px-3 text-sm outline-none focus:border-neutral-900 transition-colors">
                      <option value="">-- No Vendor --</option>
                      {vendors.filter((v: any) => v.status === 'approved').map((v: any) => (
                        <option key={v.id} value={v.id}>{v.businessName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mb-1 block">Pricing / Supplier Notes</label>
                    <textarea name="pricingSupplierNotes" defaultValue={editingProduct?.pricingSupplierNotes || editingProduct?.notes} rows={2} className="w-full bg-neutral-50 border border-neutral-200 rounded-md py-2.5 px-3 text-sm outline-none focus:border-neutral-900 transition-colors resize-y" />
                  </div>
                </div>

                {/* ─── Rooms (Multi-select checkboxes) ─── */}
                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                  <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200">
                    <h4 className="text-[11px] uppercase tracking-[0.12em] font-bold text-neutral-700">Room Placement</h4>
                    <p className="text-[9px] text-neutral-400 mt-0.5">Select which rooms this product belongs to for Shop by Room filtering</p>
                  </div>
                  <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {ROOM_OPTIONS.map(room => (
                      <label key={room.slug} className="flex items-center gap-2 cursor-pointer py-1">
                        <input
                          type="checkbox"
                          name="rooms"
                          value={room.slug}
                          defaultChecked={(editingProduct?.rooms || []).includes(room.slug)}
                          className="w-3.5 h-3.5 accent-neutral-900 rounded"
                        />
                        <span className="text-xs text-neutral-700">{room.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* ─── Search tags (comma-separated) ─── */}
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mb-1 block">Search Tags</label>
                  <input
                    name="searchTags"
                    defaultValue={editingProduct?.searchTags || (editingProduct?.tags || []).join(', ')}
                    placeholder="luxury, handcrafted, velvet, modern..."
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-md py-2.5 px-3 text-sm outline-none focus:border-neutral-900 transition-colors"
                  />
                  <p className="text-[9px] text-neutral-400 mt-1">Comma-separated. Used for search and filtering.</p>
                </div>

                {/* ─── Media Gallery Section ─── */}
                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                  <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Image className="w-4 h-4 text-neutral-400" />
                      <h4 className="text-[11px] uppercase tracking-[0.12em] font-bold text-neutral-700">Product Gallery</h4>
                      <span className="text-[10px] text-neutral-400 font-medium">({productGallery.length} items)</span>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    {productGallery.length > 0 && (
                      <div>
                        <p className="text-[9px] text-neutral-400 uppercase tracking-widest font-semibold mb-2 flex items-center gap-1.5">
                          <GripVertical className="w-3 h-3" /> Drag to reorder
                        </p>
                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                          {productGallery.map((item: any, idx: number) => (
                            <DraggableGalleryItem key={`${item.url}-${idx}`} item={item} index={idx} onReorder={handleGalleryReorder} onRemove={handleGalleryRemove} onSetCover={(i) => handleGalleryReorder(i, 0)} />
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button type="button" disabled={galleryUploading} onClick={() => galleryFileRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-neutral-200 rounded-lg hover:border-neutral-400 hover:bg-neutral-50 transition-all text-xs font-medium text-neutral-600 disabled:opacity-50">
                        {galleryUploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4" /> Upload Images & Videos</>}
                      </button>
                      <input ref={galleryFileRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e) => { if (e.target.files?.length) handleGalleryFileUpload(e.target.files); e.target.value = ''; }} />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-md px-3 py-2">
                        <Link2 className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                        <input type="text" value={galleryUrlInput} onChange={(e) => setGalleryUrlInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleGalleryAddUrl(); } }} placeholder="Paste image or video URL..." className="flex-1 bg-transparent text-xs outline-none text-neutral-700 placeholder:text-neutral-400" />
                      </div>
                      <button type="button" onClick={handleGalleryAddUrl} disabled={!galleryUrlInput.trim()} className="px-3 py-2 bg-neutral-900 text-white rounded-md text-xs font-medium hover:bg-neutral-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    </div>
                    <p className="text-[10px] text-neutral-400 flex items-center gap-1.5">
                      <Image className="w-3 h-3" /> JPG, PNG, GIF, WebP
                      <span className="text-neutral-300 mx-1">|</span>
                      <Film className="w-3 h-3" /> MP4, WebM, MOV
                      <span className="text-neutral-300 mx-1">|</span>
                      First item is the cover image
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setProductModal(false); setProductGallery([]); }} className="flex-1 py-2.5 border border-neutral-200 text-neutral-900 text-xs font-semibold rounded-md hover:bg-neutral-50 transition-colors">Cancel</button>
                  <button type="submit" className="flex-[2] bg-neutral-900 text-white py-2.5 text-xs font-semibold rounded-md hover:bg-neutral-800 transition-colors">
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══ PAGE MODAL ═══ */}
      <AnimatePresence>
        {pageModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPageModal(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-white shadow-2xl rounded-xl overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="p-5 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <div>
                  <h3 className="text-lg font-serif text-neutral-900">{editingPage ? 'Edit Page' : 'New Page'}</h3>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">Content Management</p>
                </div>
                <button onClick={() => setPageModal(false)} className="p-1.5 hover:bg-neutral-100 rounded-md transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleSavePage} className="p-5 space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mb-1 block">Page Title</label>
                  <input name="title" defaultValue={editingPage?.title} required className="w-full bg-neutral-50 border border-neutral-200 rounded-md py-2.5 px-3 text-sm outline-none focus:border-neutral-900 transition-colors" placeholder="About Us" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mb-1 block">Slug</label>
                    <input name="slug" defaultValue={editingPage?.slug} required className="w-full bg-neutral-50 border border-neutral-200 rounded-md py-2.5 px-3 text-sm font-mono outline-none focus:border-neutral-900 transition-colors" placeholder="about-us" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mb-1 block">Status</label>
                    <select name="status" defaultValue={editingPage?.status || 'draft'} className="w-full bg-neutral-50 border border-neutral-200 rounded-md py-2.5 px-3 text-sm outline-none focus:border-neutral-900 transition-colors">
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mb-1 block">Template</label>
                  <select name="template" defaultValue={editingPage?.template || 'default'} className="w-full bg-neutral-50 border border-neutral-200 rounded-md py-2.5 px-3 text-sm outline-none focus:border-neutral-900 transition-colors">
                    <option value="default">Default</option>
                    <option value="full-width">Full Width</option>
                    <option value="sidebar">With Sidebar</option>
                    <option value="landing">Landing Page</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mb-1 block">Meta Description</label>
                  <input name="metaDescription" defaultValue={editingPage?.metaDescription} className="w-full bg-neutral-50 border border-neutral-200 rounded-md py-2.5 px-3 text-sm outline-none focus:border-neutral-900 transition-colors" placeholder="SEO description..." />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mb-1 block">Content</label>
                  <textarea name="content" defaultValue={editingPage?.content} rows={12} className="w-full bg-neutral-50 border border-neutral-200 rounded-md py-2.5 px-3 text-sm outline-none focus:border-neutral-900 transition-colors font-mono resize-y" placeholder="Write your page content here (HTML supported)..." />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setPageModal(false)} className="flex-1 py-2.5 border border-neutral-200 text-neutral-900 text-xs font-semibold rounded-md hover:bg-neutral-50 transition-colors">Cancel</button>
                  <button type="submit" className="flex-[2] bg-neutral-900 text-white py-2.5 text-xs font-semibold rounded-md hover:bg-neutral-800 transition-colors">
                    {editingPage ? 'Update Page' : 'Publish Page'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══ MEDIA UPLOAD MODAL ═══ */}
      <AnimatePresence>
        {mediaUploadModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMediaUploadModal(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-white shadow-2xl rounded-xl overflow-hidden">
              <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-serif text-neutral-900">Upload Media</h3>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">Images, videos, PDFs & documents</p>
                </div>
                <button onClick={() => setMediaUploadModal(false)} className="p-1.5 hover:bg-neutral-100 rounded-md transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-5">
                <label className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-neutral-200 rounded-lg cursor-pointer hover:border-neutral-400 transition-colors bg-neutral-50">
                  <Upload className="w-10 h-10 text-neutral-300 mb-3" />
                  <p className="text-sm font-medium text-neutral-600">Click to select files</p>
                  <p className="text-[10px] text-neutral-400 mt-1">or drag and drop</p>
                  <input type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx" className="hidden" onChange={(e) => { if (e.target.files?.length) handleMediaUpload(e.target.files); }} />
                </label>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══ ORDER DETAIL MODAL ═══ */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedOrder(null)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-white shadow-2xl rounded-xl overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="p-5 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <div>
                  <h3 className="text-lg font-serif text-neutral-900">Order {selectedOrder.orderId}</h3>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">
                    {new Date(selectedOrder.createdAt).toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${
                    selectedOrder.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                    selectedOrder.status === 'shipped' ? 'bg-blue-50 text-blue-700' :
                    selectedOrder.status === 'processing' ? 'bg-amber-50 text-amber-700' :
                    'bg-neutral-100 text-neutral-600'
                  }`}>{selectedOrder.status}</span>
                  <button onClick={() => setSelectedOrder(null)} className="p-1.5 hover:bg-neutral-100 rounded-md transition-colors"><X className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="p-5 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 mb-3">Customer</h4>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {selectedOrder.customerInfo?.firstName?.[0]}{selectedOrder.customerInfo?.lastName?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">{selectedOrder.customerInfo?.firstName} {selectedOrder.customerInfo?.lastName}</p>
                        <p className="text-[11px] text-neutral-500">{selectedOrder.customerInfo?.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 mb-3">Shipping Address</h4>
                    <p className="text-sm text-neutral-700 leading-relaxed">
                      {selectedOrder.customerInfo?.address || 'No address provided'}<br />
                      {selectedOrder.customerInfo?.city && <>{selectedOrder.customerInfo.city}, </>}
                      {selectedOrder.customerInfo?.postalCode}
                    </p>
                  </div>
                </div>
                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                  <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200">
                    <h4 className="text-[11px] uppercase tracking-[0.12em] font-bold text-neutral-700">Items ({selectedOrder.items?.length || 0})</h4>
                  </div>
                  <div className="divide-y divide-neutral-100">
                    {selectedOrder.items?.map((item: any, idx: number) => (
                      <div key={idx} className="px-4 py-3 flex items-center gap-4">
                        <div className="w-14 h-14 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                          {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-neutral-300" /></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900 truncate">{item.name}</p>
                          <div className="flex items-center gap-3 mt-0.5 text-[10px] text-neutral-400">
                            {item.material && <span>{item.material}</span>}
                            {item.color && <span>{item.color}</span>}
                            <span>Qty: {item.quantity}</span>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-neutral-900 flex-shrink-0">R {((item.price || 0) * (item.quantity || 1)).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-neutral-900 text-white rounded-lg p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-neutral-400">Subtotal</span>
                    <span className="text-sm">R {selectedOrder.total?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-neutral-400">Delivery</span>
                    <span className="text-xs text-emerald-400 font-semibold">Complimentary</span>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex items-center justify-between">
                    <span className="text-sm font-semibold">Total</span>
                    <span className="text-xl font-serif">R {selectedOrder.total?.toLocaleString()}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 mb-2">Payment</h4>
                    <p className="text-xs text-neutral-700">{selectedOrder.pfPaymentId ? `PayFast: ${String(selectedOrder.pfPaymentId).slice(0, 20)}` : 'PayFast (pending)'}</p>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 mb-2">Update Status</h4>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => { handleUpdateOrderStatus(selectedOrder.orderId, e.target.value); setSelectedOrder({ ...selectedOrder, status: e.target.value }); }}
                      className="w-full text-xs border border-neutral-200 rounded-md px-2.5 py-2 bg-white outline-none cursor-pointer focus:border-neutral-900 transition-colors"
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══ VENDOR DETAIL MODAL ═══ */}
      <AnimatePresence>
        {vendorModal && editingVendor && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setVendorModal(false); setEditingVendor(null); setQuickLinkOpen(false); setBulkUnlinkMode(false); setBulkUnlinkSelected(new Set()); setBulkUnlinkConfirm(false); }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-white shadow-2xl rounded-xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-5 border-b border-neutral-100 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-neutral-900 text-white rounded-lg flex items-center justify-center text-lg font-serif">
                    {editingVendor.businessName?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-serif text-neutral-900">{editingVendor.businessName}</h3>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold">Vendor Profile &bull; {editingVendor.status}</p>
                  </div>
                </div>
                <button onClick={() => { setVendorModal(false); setEditingVendor(null); }} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <form id="vendor-profile-form" onSubmit={handleSaveVendorProfile} className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Status Quick Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Status:</span>
                  {(['pending', 'approved', 'rejected', 'suspended'] as const).map(s => (
                    <button key={s} type="button" onClick={() => { handleUpdateVendor(editingVendor.id, { status: s }); setEditingVendor({ ...editingVendor, status: s }); }}
                      className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border transition-colors ${editingVendor.status === s ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400'}`}>
                      {s}
                    </button>
                  ))}
                </div>
                {/* Profile Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { name: 'businessName', label: 'Business Name', defaultValue: editingVendor.businessName },
                    { name: 'email', label: 'Email', defaultValue: editingVendor.email, type: 'email' },
                    { name: 'contactPhone', label: 'Phone', defaultValue: editingVendor.contactPhone || '', placeholder: '+27 ...' },
                    { name: 'website', label: 'Website', defaultValue: editingVendor.website || '', placeholder: 'https://...' },
                  ].map(f => (
                    <div key={f.name}>
                      <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 mb-1 block">{f.label}</label>
                      <input name={f.name} type={f.type || 'text'} defaultValue={f.defaultValue} placeholder={f.placeholder} className="w-full bg-neutral-50 border border-neutral-200 rounded-md py-2.5 px-3 text-sm outline-none focus:border-neutral-900 transition-colors" />
                    </div>
                  ))}
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 mb-1 block">Category</label>
                    <select name="category" defaultValue={editingVendor.category} className="w-full bg-neutral-50 border border-neutral-200 rounded-md py-2.5 px-3 text-sm outline-none focus:border-neutral-900 transition-colors">
                      {['Furniture', 'Lighting', 'Textiles', 'Ceramics', 'Art', 'Decor', 'Rugs', 'Outdoor', 'Kitchen', 'Bath', 'Other'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 mb-1 block">Location</label>
                    <input name="location" defaultValue={editingVendor.location || ''} placeholder="City, Country" className="w-full bg-neutral-50 border border-neutral-200 rounded-md py-2.5 px-3 text-sm outline-none focus:border-neutral-900 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 mb-1 block">Commission Rate (%)</label>
                    <input name="commissionRate" type="number" min="0" max="100" step="0.5" defaultValue={editingVendor.commissionRate || ''} placeholder="15" className="w-full bg-neutral-50 border border-neutral-200 rounded-md py-2.5 px-3 text-sm outline-none focus:border-neutral-900 transition-colors" />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer py-2.5">
                      <input name="featured" type="checkbox" defaultChecked={editingVendor.featured} className="w-4 h-4 accent-neutral-900 rounded" />
                      <span className="text-sm text-neutral-700 font-medium">Featured Artisan</span>
                      <Star className="w-3.5 h-3.5 text-amber-500" />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 mb-1 block">Brand Description</label>
                  <textarea name="description" defaultValue={editingVendor.description || ''} rows={3} className="w-full bg-neutral-50 border border-neutral-200 rounded-md py-2.5 px-3 text-sm outline-none focus:border-neutral-900 transition-colors resize-y" placeholder="Tell us about this vendor..." />
                </div>
                <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-4">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-amber-700 mb-1.5 flex items-center gap-1.5">Internal Admin Notes</label>
                  <textarea name="adminNotes" defaultValue={editingVendor.adminNotes || ''} rows={3} className="w-full bg-white border border-amber-200 rounded-md py-2.5 px-3 text-sm outline-none focus:border-amber-500 transition-colors resize-y" placeholder="Private notes visible only to admins..." />
                </div>
              </form>
              <div className="p-4 border-t border-neutral-100 flex items-center gap-2 flex-shrink-0">
                {canDelete && (
                  <button type="button" onClick={() => { handleDeleteVendor(editingVendor.id); setVendorModal(false); setEditingVendor(null); }} className="px-3 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-md transition-colors flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                )}
                <div className="flex-1" />
                <button type="button" onClick={() => { setVendorModal(false); setEditingVendor(null); }} className="px-4 py-2.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors">Cancel</button>
                <button type="submit" form="vendor-profile-form" className="px-5 py-2.5 bg-neutral-900 text-white text-xs font-semibold rounded-md hover:bg-neutral-800 transition-colors flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Save Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══ BULK UNLINK CONFIRMATION ═══ */}
      <AnimatePresence>
        {bulkUnlinkConfirm && editingVendor && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setBulkUnlinkConfirm(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 12 }} className="relative w-full max-w-sm bg-white shadow-2xl rounded-xl overflow-hidden">
              <div className="pt-6 pb-2 flex justify-center">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center"><Unlink className="w-5 h-5 text-red-600" /></div>
              </div>
              <div className="px-6 pb-4 text-center">
                <h3 className="text-sm font-bold text-neutral-900 mb-1">Confirm Bulk Unlink</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  You are about to unlink <span className="font-bold text-neutral-900">{bulkUnlinkSelected.size} product{bulkUnlinkSelected.size !== 1 ? 's' : ''}</span> from <span className="font-bold text-neutral-900">{editingVendor.businessName}</span>.
                </p>
              </div>
              <div className="px-6 pb-6 flex gap-2.5">
                <button type="button" onClick={() => setBulkUnlinkConfirm(false)} className="flex-1 py-2.5 text-xs font-semibold text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">Go Back</button>
                <button type="button" disabled={bulkUnlinkLoading} onClick={async () => { setBulkUnlinkConfirm(false); await handleBulkUnlinkProducts(Array.from(bulkUnlinkSelected)); }} className="flex-1 py-2.5 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50">
                  {bulkUnlinkLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Unlinking...</> : <><Unlink className="w-3.5 h-3.5" /> Unlink {bulkUnlinkSelected.size}</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══ BULK IMPORT MODAL ═══ */}
      <AnimatePresence>
        {importModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setImportModal(false); setImportPreview([]); }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-3xl bg-white shadow-2xl rounded-xl overflow-hidden max-h-[85vh] flex flex-col">
              <div className="p-5 border-b border-neutral-100 flex items-center justify-between flex-shrink-0">
                <div>
                  <h3 className="text-lg font-serif text-neutral-900">Import Products</h3>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">{importPreview.length} rows detected</p>
                </div>
                <button onClick={() => { setImportModal(false); setImportPreview([]); }} className="p-1.5 hover:bg-neutral-100 rounded-md transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <div className="flex-1 overflow-auto p-5">
                {importPreview.length > 0 && (
                  <div className="border border-neutral-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-neutral-50 border-b border-neutral-200">
                            <th className="py-2 px-3 text-left font-bold text-neutral-500 text-[10px] uppercase tracking-wider">#</th>
                            {Object.keys(importPreview[0]).slice(0, 7).map(col => (
                              <th key={col} className="py-2 px-3 text-left font-bold text-neutral-500 text-[10px] uppercase tracking-wider whitespace-nowrap">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {importPreview.slice(0, 20).map((row: any, idx: number) => (
                            <tr key={idx} className="hover:bg-neutral-50">
                              <td className="py-2 px-3 text-neutral-400">{idx + 1}</td>
                              {Object.values(row).slice(0, 7).map((val: any, ci: number) => (
                                <td key={ci} className="py-2 px-3 text-neutral-700 max-w-[200px] truncate">{String(val)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {importPreview.length > 20 && (
                      <div className="py-2 px-4 bg-neutral-50 border-t border-neutral-200 text-[10px] text-neutral-400 text-center">
                        Showing first 20 of {importPreview.length} rows
                      </div>
                    )}
                  </div>
                )}
                <p className="text-[10px] text-neutral-400 mt-3">
                  Column mapping follows Product Master: Original ID, Internal SKU, Barcode, Category, Website Product Name, Description, Color, Material / Finish, Search Tags, Cost, Selling Price, Availability, image filenames, supplier notes, previous category, and image count.
                  <button onClick={downloadImportTemplate} className="ml-2 text-neutral-900 underline hover:no-underline font-medium">Download template</button>
                </p>
              </div>
              <div className="p-5 border-t border-neutral-100 flex gap-3 flex-shrink-0">
                <button onClick={() => { setImportModal(false); setImportPreview([]); }} className="flex-1 py-2.5 border border-neutral-200 text-neutral-900 text-xs font-semibold rounded-md hover:bg-neutral-50 transition-colors">Cancel</button>
                <button onClick={handleBulkImport} disabled={importLoading || importPreview.length === 0} className="flex-[2] bg-neutral-900 text-white py-2.5 text-xs font-semibold rounded-md hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {importLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Importing...</> : <><Upload className="w-3.5 h-3.5" /> Import {importPreview.length} Products</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DndProvider>
  );
};
