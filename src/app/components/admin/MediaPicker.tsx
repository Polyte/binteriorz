import React, { useMemo, useState } from 'react';
import { Image as ImageIcon, Images, X } from 'lucide-react';
import type { HomepageImage } from '../../content/homepage';

export const inputClass = 'w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 outline-none transition-colors focus:border-neutral-900';
export const labelClass = 'mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-neutral-500';

// Uploads are stored as { name, contentType }; older records used { fileName, fileType }.
const mediaName = (item: any): string => item.name || item.fileName || '';
const mediaType = (item: any): string => item.contentType || item.fileType || '';

export const ImageField = ({
  label,
  value,
  onChange,
  onBrowse,
  compact = false,
}: {
  label: string;
  value?: HomepageImage;
  onChange: (value: HomepageImage) => void;
  onBrowse: () => void;
  compact?: boolean;
}) => (
  <div className="space-y-2">
    <label className={labelClass}>{label}</label>
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
      <div className={`${compact ? 'aspect-[4/3]' : 'aspect-[16/9]'} bg-neutral-100`}>
        {value?.url ? (
          <img src={value.url} alt={value.alt || label} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-300"><ImageIcon className="h-8 w-8" /></div>
        )}
      </div>
      <div className="space-y-2 p-3">
        <button type="button" onClick={onBrowse} className="flex w-full items-center justify-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100">
          <Images className="h-3.5 w-3.5" /> Choose from Media Library
        </button>
        <input value={value?.url || ''} onChange={(event) => onChange({ url: event.target.value, alt: value?.alt || '', storagePath: undefined })} placeholder="…or paste an image URL" className={inputClass} />
        <input value={value?.alt || ''} onChange={(event) => onChange({ url: value?.url || '', ...value, alt: event.target.value })} placeholder="Describe the image (for accessibility)" className={inputClass} />
      </div>
    </div>
  </div>
);

export const MediaPickerModal = ({
  media,
  onSelect,
  onClose,
}: {
  media: any[];
  onSelect: (image: HomepageImage) => void;
  onClose: () => void;
}) => {
  const [search, setSearch] = useState('');
  const images = useMemo(
    () => media.filter((item) => mediaType(item).startsWith('image/') && (!search || mediaName(item).toLowerCase().includes(search.toLowerCase()))),
    [media, search],
  );

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="flex max-h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex flex-wrap items-center gap-3 border-b border-neutral-200 p-4">
          <div className="min-w-[200px] flex-1"><h3 className="text-lg font-semibold text-neutral-900">Choose an image</h3><p className="text-xs text-neutral-400">Upload new images in Media Library, then pick them here.</p></div>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search media..." className={`${inputClass} max-w-xs`} />
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900"><X className="h-5 w-5" /></button>
        </div>
        <div className="overflow-y-auto p-4">
          {images.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {images.map((item) => (
                <button key={item.id} type="button" onClick={() => { onSelect({ url: item.url, storagePath: item.storagePath, alt: mediaName(item) }); onClose(); }} className="group overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 text-left hover:border-neutral-900">
                  <div className="aspect-square overflow-hidden"><img src={item.url} alt={mediaName(item)} className="h-full w-full object-cover transition-transform group-hover:scale-105" /></div>
                  <p className="truncate p-2 text-[10px] font-medium text-neutral-600">{mediaName(item)}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center"><ImageIcon className="mx-auto mb-3 h-10 w-10 text-neutral-200" /><p className="text-sm text-neutral-400">No matching images in the Media Library.</p></div>
          )}
        </div>
      </div>
    </div>
  );
};
