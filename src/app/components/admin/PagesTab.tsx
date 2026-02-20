import React from 'react';
import { motion } from 'motion/react';
import { FileText, Plus, Edit, Trash2, Blocks } from 'lucide-react';
import { useAdmin, timeAgo } from './AdminContext';

export const PagesTab = () => {
  const {
    pages, searchQuery, canDelete,
    setEditingPage, setPageBuilderOpen, handleDeletePage,
  } = useAdmin();

  const openBuilder = (page?: any) => {
    setEditingPage(page || null);
    setPageBuilderOpen(true);
  };

  return (
    <motion.div key="pages" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-serif text-neutral-900">Pages</h2>
          <p className="text-xs text-neutral-500 mt-0.5">{pages.length} pages total</p>
        </div>
        <button onClick={() => openBuilder()} className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 text-white rounded-md text-xs font-medium hover:bg-neutral-800 transition-colors">
          <Plus className="w-3.5 h-3.5" /> New Page
        </button>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-neutral-500">Title</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-neutral-500">Slug</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-neutral-500">Status</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-neutral-500">Blocks</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-neutral-500">Modified</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-neutral-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {pages.filter(pg => !searchQuery || pg.title?.toLowerCase().includes(searchQuery.toLowerCase()) || pg.slug?.toLowerCase().includes(searchQuery.toLowerCase())).map((page: any) => {
                const blockCount = Array.isArray(page.blocks) ? page.blocks.length : 0;
                return (
                  <tr key={page.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-neutral-300" />
                        <span className="text-sm font-medium text-neutral-900">{page.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-400 font-mono">/{page.slug}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${page.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`}>
                        {page.status || 'draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {blockCount > 0 ? (
                        <span className="text-xs text-neutral-500 flex items-center gap-1">
                          <Blocks className="w-3 h-3 text-neutral-300" /> {blockCount}
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-300">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-400">{page.updatedAt ? timeAgo(page.updatedAt) : '--'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openBuilder(page)} className="p-1.5 hover:bg-neutral-100 rounded text-neutral-400 hover:text-neutral-900 transition-colors" title="Edit in Page Builder">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {canDelete && <button onClick={() => handleDeletePage(page.id)} className="p-1.5 hover:bg-red-50 rounded text-neutral-400 hover:text-red-600 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {pages.length === 0 && (
          <div className="py-16 text-center">
            <FileText className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
            <p className="text-neutral-400 text-sm">No pages yet</p>
            <p className="text-neutral-300 text-xs mt-1">Create your first page with the visual builder.</p>
            <button onClick={() => openBuilder()} className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-white rounded-md text-xs font-medium hover:bg-neutral-800 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Create Page
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
