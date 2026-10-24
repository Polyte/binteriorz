import React from 'react';
import { motion } from 'motion/react';
import { Package, Plus, FileSpreadsheet, Upload, Edit, Trash2, Play } from 'lucide-react';
import { useAdmin } from './AdminContext';

export const ProductsTab = () => {
  const {
    products, vendors, searchQuery, canDelete,
    setEditingProduct, setProductGallery, setProductModal,
    handleDeleteProduct, exportProductsToExcel,
    importFileRef, handleImportFile,
  } = useAdmin();

  return (
    <motion.div key="prods" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-serif text-neutral-900">Products</h2>
          <p className="text-xs text-neutral-500 mt-0.5">{products.length} items in catalogue</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => exportProductsToExcel(products)} className="flex items-center gap-1.5 px-3 py-2 border border-neutral-200 bg-white rounded-md text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
            <FileSpreadsheet className="w-3.5 h-3.5" /> Export
          </button>
          <button onClick={() => importFileRef.current?.click()} className="flex items-center gap-1.5 px-3 py-2 border border-neutral-200 bg-white rounded-md text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
            <Upload className="w-3.5 h-3.5" /> Import
          </button>
          <input ref={importFileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImportFile} />
          <button onClick={() => { setEditingProduct(null); setProductGallery([]); setProductModal(true); }} className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 text-white rounded-md text-xs font-medium hover:bg-neutral-800 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Product
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-neutral-500">Product</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-neutral-500">SKU / Barcode</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-neutral-500">Category</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-neutral-500">Color & Finish</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-neutral-500 text-right">Cost</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-neutral-500 text-right">Selling</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-neutral-500">Availability</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-neutral-500 text-center">Images</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-neutral-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {products.filter(p => !searchQuery || [p.name, p.sku, p.internalSku, p.barcode, p.category].some((value) => value?.toLowerCase().includes(searchQuery.toLowerCase()))).map((product: any) => (
                <tr key={product.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 flex-shrink-0">
                        {product.gallery?.length > 0 && product.gallery[0].type === 'video' ? (
                          <div className="w-10 h-10 bg-neutral-200 rounded-md flex items-center justify-center"><Play className="w-4 h-4 text-neutral-500" /></div>
                        ) : (
                          <img src={product.gallery?.[0]?.url || product.image || product.image_url} className="w-10 h-10 object-cover rounded-md shadow-sm" alt="" />
                        )}
                        {product.gallery?.length > 1 && (
                          <span className="absolute -bottom-1 -right-1 bg-neutral-900 text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{product.gallery.length}</span>
                        )}
                      </div>
                      <div className="truncate max-w-[200px]">
                        <span className="block text-sm font-medium text-neutral-900">{product.name}</span>
                        <span className="text-[10px] text-neutral-400">{product.originalId || product.id}</span>
                        {product.vendorId && (() => {
                          const v = vendors.find((vn: any) => vn.id === product.vendorId);
                          return v ? <p className="text-[10px] text-neutral-400 truncate">by {v.businessName}</p> : null;
                        })()}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="whitespace-nowrap font-mono text-[11px] font-semibold text-neutral-700">{product.internalSku || product.sku || '—'}</p>
                    <p className="mt-0.5 whitespace-nowrap font-mono text-[9px] text-neutral-400">{product.barcode || 'No barcode'}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-500">{product.category}</td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-neutral-600">{product.color || '—'}</p>
                    <p className="mt-0.5 max-w-[170px] truncate text-[10px] text-neutral-400">{product.materialFinish || product.material || '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-neutral-500">R {(Number(product.costPrice) || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-neutral-900">R {(Number(product.price) || 0).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`whitespace-nowrap rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${product.inStock === false ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{product.availability || (product.inStock === false ? 'Unavailable' : 'Available')}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-xs font-semibold text-neutral-600">{product.imageCount ?? product.gallery?.length ?? 0}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => { setEditingProduct(product); setProductGallery(product.gallery || (product.image ? [{ url: product.image, type: 'image', fileName: 'main' }] : [])); setProductModal(true); }} className="p-1.5 hover:bg-neutral-100 rounded text-neutral-400 hover:text-neutral-900 transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                      {canDelete && <button onClick={() => handleDeleteProduct(product.id)} className="p-1.5 hover:bg-red-50 rounded text-neutral-400 hover:text-red-600 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length === 0 && (
          <div className="py-16 text-center">
            <Package className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
            <p className="text-neutral-400 text-sm">No products yet. Add your first product.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
