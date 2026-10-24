import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Image, Upload, RefreshCw, Copy, Trash2, FileText, Film } from 'lucide-react';
import { toast } from 'sonner';
import { useAdmin, formatBytes } from './AdminContext';

const API = `/api`;

export const MediaTab = () => {
  const {
    media, searchQuery, canDelete,
    setMediaUploadModal, handleDeleteMedia, authHeaders,
  } = useAdmin();
  const [localMedia, setLocalMedia] = useState<any[] | null>(null);
  const displayMedia = localMedia || media;

  return (
    <motion.div key="media" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-serif text-neutral-900">Media Library</h2>
          <p className="text-xs text-neutral-500 mt-0.5">{displayMedia.length} files uploaded</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                const res = await fetch(`${API}/media/refresh-urls`, { method: 'POST', headers: authHeaders() });
                if (res.ok) { const d = await res.json(); setLocalMedia(d); toast.success('URLs refreshed'); }
              } catch { toast.error('Failed to refresh'); }
            }}
            className="flex items-center gap-1.5 px-3 py-2 border border-neutral-200 bg-white rounded-md text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh URLs
          </button>
          <button onClick={() => setMediaUploadModal(true)} className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 text-white rounded-md text-xs font-medium hover:bg-neutral-800 transition-colors">
            <Upload className="w-3.5 h-3.5" /> Upload Files
          </button>
        </div>
      </div>

      {displayMedia.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {displayMedia.filter(m => !searchQuery || m.fileName?.toLowerCase().includes(searchQuery.toLowerCase())).map((item: any) => (
            <div key={item.id} className="group bg-white rounded-lg border border-neutral-200 overflow-hidden hover:shadow-md transition-all">
              <div className="aspect-square bg-neutral-100 relative overflow-hidden">
                {item.fileType?.startsWith('image/') ? (
                  <img src={item.url} alt={item.fileName} className="w-full h-full object-cover" />
                ) : item.fileType?.startsWith('video/') ? (
                  <div className="w-full h-full bg-neutral-900 flex flex-col items-center justify-center text-white">
                    <Film className="w-8 h-8 opacity-50 mb-1" />
                    <span className="text-[9px] uppercase tracking-wider opacity-40">Video</span>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="w-8 h-8 text-neutral-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => { navigator.clipboard.writeText(item.url); toast.success('URL copied'); }}
                    className="p-2 bg-white rounded-full shadow-lg hover:bg-neutral-100 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 text-neutral-700" />
                  </button>
                  {canDelete && <button
                    onClick={() => handleDeleteMedia(item.id)}
                    className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                  </button>}
                </div>
              </div>
              <div className="p-2">
                <p className="text-[10px] font-medium text-neutral-700 truncate">{item.fileName}</p>
                <p className="text-[9px] text-neutral-400">{formatBytes(item.fileSize)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border-2 border-dashed border-neutral-200 py-20 text-center">
          <Image className="w-12 h-12 text-neutral-200 mx-auto mb-4" />
          <p className="text-neutral-400 text-sm mb-2">No media files yet</p>
          <button onClick={() => setMediaUploadModal(true)} className="text-xs font-medium text-neutral-900 underline hover:no-underline">
            Upload your first file
          </button>
        </div>
      )}
    </motion.div>
  );
};
