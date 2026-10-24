import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  X, Save, Undo2, Redo2, Settings2, Grip, Trash2, Copy, ChevronUp,
  ChevronDown, Plus, Type, Image, LayoutGrid, Columns2, Columns3, Quote,
  PlayCircle, SeparatorHorizontal, MousePointerClick, BarChart3, HelpCircle,
  FileText, Heading1, Upload, Loader2, ChevronLeft, Smartphone, Monitor, Tablet,
  PanelLeftClose, PanelLeft, ImagePlus, List, Star, ShoppingBag, MapPin,
  ExternalLink, BookTemplate, Bookmark, Palette, Hash, Code2, Maximize2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAdmin } from './AdminContext';

const API = `/api`;

// ─── Block Types ─────────────────────────────────────────────
const BLOCK_TYPES = [
  { type: 'hero', label: 'Hero Banner', icon: Image, category: 'Layout', desc: 'Full-width hero with heading, subtext & CTA' },
  { type: 'heading', label: 'Heading', icon: Heading1, category: 'Text', desc: 'Section heading with optional subtitle' },
  { type: 'text', label: 'Rich Text', icon: Type, category: 'Text', desc: 'Paragraph text with formatting' },
  { type: 'image', label: 'Image', icon: Image, category: 'Media', desc: 'Single image with optional caption' },
  { type: 'image-text', label: 'Image + Text', icon: Columns2, category: 'Layout', desc: 'Side-by-side image and text block' },
  { type: 'gallery', label: 'Gallery Grid', icon: LayoutGrid, category: 'Media', desc: 'Multi-image masonry or grid layout' },
  { type: 'video', label: 'Video Embed', icon: PlayCircle, category: 'Media', desc: 'YouTube, Vimeo, or direct video URL' },
  { type: 'cta', label: 'Call to Action', icon: MousePointerClick, category: 'Layout', desc: 'Prominent CTA with button' },
  { type: 'columns', label: 'Columns', icon: Columns3, category: 'Layout', desc: '2 or 3 column text layout' },
  { type: 'testimonial', label: 'Testimonial', icon: Quote, category: 'Content', desc: 'Customer quote with attribution' },
  { type: 'divider', label: 'Spacer / Divider', icon: SeparatorHorizontal, category: 'Layout', desc: 'Visual separator or whitespace' },
  { type: 'stats', label: 'Stats Bar', icon: BarChart3, category: 'Content', desc: 'Key figures in a row' },
  { type: 'faq', label: 'FAQ Accordion', icon: HelpCircle, category: 'Content', desc: 'Expandable question/answer pairs' },
  { type: 'product-grid', label: 'Product Showcase', icon: ShoppingBag, category: 'Content', desc: 'Display featured products' },
  { type: 'map', label: 'Map / Location', icon: MapPin, category: 'Content', desc: 'Embedded Google Map' },
  { type: 'list', label: 'Feature List', icon: List, category: 'Content', desc: 'Bullet or icon list' },
];

const CATEGORIES = ['Layout', 'Text', 'Media', 'Content'];

// ─── Default block data ──────────────────────────────────────
const getDefaultBlockData = (type: string): any => {
  switch (type) {
    case 'hero': return { heading: 'Your Headline Here', subheading: 'A compelling subtitle that captures attention', image: '', ctaText: 'Explore', ctaLink: '/', overlay: 0.4, height: 'lg', alignment: 'center' };
    case 'heading': return { text: 'Section Heading', level: 'h2', alignment: 'center', subtitle: '' };
    case 'text': return { content: 'Write your content here. This block supports rich text with paragraphs, bold text, and more.', alignment: 'left', maxWidth: 'prose' };
    case 'image': return { url: '', alt: '', caption: '', rounded: true, shadow: true, fullWidth: false };
    case 'image-text': return { image: '', heading: 'Feature Heading', text: 'Describe this feature or tell your story here.', imagePosition: 'left', ctaText: '', ctaLink: '' };
    case 'gallery': return { images: [{ url: '', alt: '' }, { url: '', alt: '' }, { url: '', alt: '' }], columns: 3, gap: 'md', rounded: true };
    case 'video': return { url: '', poster: '', caption: '', autoplay: false };
    case 'cta': return { heading: 'Ready to Get Started?', subheading: 'Join thousands of satisfied customers', buttonText: 'Get Started', buttonLink: '/', style: 'dark', fullWidth: true };
    case 'columns': return { count: 2, columns: [{ heading: 'Column One', text: 'Description text...' }, { heading: 'Column Two', text: 'Description text...' }] };
    case 'testimonial': return { quote: '"This was an incredible experience. The quality exceeded all our expectations."', author: 'Jane Smith', role: 'Interior Designer', avatar: '', rating: 5 };
    case 'divider': return { type: 'line', spacing: 'md', color: 'neutral' };
    case 'stats': return { stats: [{ value: '500+', label: 'Projects Completed' }, { value: '99%', label: 'Client Satisfaction' }, { value: '15+', label: 'Years Experience' }], style: 'minimal' };
    case 'faq': return { items: [{ question: 'What is your return policy?', answer: 'We offer a 30-day return policy on all items.' }, { question: 'Do you offer free shipping?', answer: 'Free shipping on orders over R5,000.' }] };
    case 'product-grid': return { productIds: [], count: 4, style: 'grid' };
    case 'map': return { embedUrl: '', address: '', height: 400 };
    case 'list': return { items: ['Feature one', 'Feature two', 'Feature three'], style: 'check', columns: 1 };
    default: return {};
  }
};

// ─── DND Type ────────────────────────────────────────────────
const BLOCK_DND = 'PAGE_BUILDER_BLOCK';

// ─── Draggable Block ─────────────────────────────────────────
const DraggableBlock = ({ block, index, isSelected, onSelect, onReorder, onDuplicate, onDelete, onMoveUp, onMoveDown, totalBlocks }: {
  block: any; index: number; isSelected: boolean;
  onSelect: () => void; onReorder: (from: number, to: number) => void;
  onDuplicate: () => void; onDelete: () => void;
  onMoveUp: () => void; onMoveDown: () => void; totalBlocks: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag, preview] = useDrag({
    type: BLOCK_DND,
    item: { index },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });
  const [{ isOver }, drop] = useDrop({
    accept: BLOCK_DND,
    hover: (dragged: { index: number }) => {
      if (dragged.index !== index) {
        onReorder(dragged.index, index);
        dragged.index = index;
      }
    },
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  });

  preview(drop(ref));

  const blockType = BLOCK_TYPES.find(bt => bt.type === block.type);
  const Icon = blockType?.icon || FileText;

  return (
    <div
      ref={ref}
      onClick={onSelect}
      className={`group relative rounded-lg border-2 transition-all duration-200 cursor-pointer ${
        isDragging ? 'opacity-30 scale-[0.98]' :
        isSelected ? 'border-neutral-900 shadow-lg ring-2 ring-neutral-900/10' :
        isOver ? 'border-blue-300 bg-blue-50/30' :
        'border-neutral-200 hover:border-neutral-400'
      }`}
    >
      {/* Block toolbar */}
      <div className={`flex items-center gap-1.5 px-3 py-2 border-b transition-colors ${isSelected ? 'border-neutral-200 bg-neutral-50' : 'border-transparent bg-white'}`}>
        <div ref={(node) => { drag(node); }} className="cursor-grab active:cursor-grabbing p-0.5 hover:bg-neutral-200 rounded transition-colors">
          <Grip className="w-3.5 h-3.5 text-neutral-400" />
        </div>
        <Icon className="w-3.5 h-3.5 text-neutral-400" />
        <span className="text-[10px] uppercase tracking-[0.12em] font-bold text-neutral-500 flex-1 truncate">{blockType?.label || block.type}</span>
        {block.settings?.bgColor && <span className="w-3 h-3 rounded-full border border-neutral-300 flex-shrink-0" style={{ backgroundColor: block.settings.bgColor }} title="Background color" />}
        {block.settings?.anchor && <span className="text-[8px] font-mono text-neutral-300" title={`#${block.settings.anchor}`}>#</span>}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {index > 0 && (
            <button onClick={(e) => { e.stopPropagation(); onMoveUp(); }} className="p-1 hover:bg-neutral-200 rounded transition-colors" title="Move up">
              <ChevronUp className="w-3 h-3 text-neutral-500" />
            </button>
          )}
          {index < totalBlocks - 1 && (
            <button onClick={(e) => { e.stopPropagation(); onMoveDown(); }} className="p-1 hover:bg-neutral-200 rounded transition-colors" title="Move down">
              <ChevronDown className="w-3 h-3 text-neutral-500" />
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); onDuplicate(); }} className="p-1 hover:bg-neutral-200 rounded transition-colors" title="Duplicate">
            <Copy className="w-3 h-3 text-neutral-500" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 hover:bg-red-100 rounded transition-colors" title="Delete">
            <Trash2 className="w-3 h-3 text-red-500" />
          </button>
        </div>
      </div>
      {/* Block preview */}
      <div className="p-4 relative overflow-hidden" style={{ backgroundColor: block.settings?.bgColor || undefined }}>
        {block.settings?.bgImage && (
          <>
            <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${block.settings.bgImage})` }} />
            <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${(block.settings.bgOverlay || 0) * 0.5})` }} />
          </>
        )}
        <div className="relative z-10">
          <BlockPreview block={block} />
        </div>
      </div>
    </div>
  );
};

// ─── Block Preview (Canvas) ──────────────────────────────────
const BlockPreview = ({ block }: { block: any }) => {
  const { data } = block;
  switch (block.type) {
    case 'hero':
      return (
        <div className={`relative rounded-lg overflow-hidden ${data.height === 'sm' ? 'h-32' : data.height === 'lg' ? 'h-48' : 'h-40'} bg-neutral-100`}>
          {data.image && <img src={data.image} alt="" className="absolute inset-0 w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-black" style={{ opacity: data.overlay || 0.4 }} />
          <div className={`relative z-10 h-full flex flex-col items-${data.alignment || 'center'} justify-center p-6 text-${data.alignment || 'center'}`}>
            <h3 className="text-white text-lg font-serif font-bold leading-tight">{data.heading || 'Hero Heading'}</h3>
            {data.subheading && <p className="text-white/70 text-xs mt-1">{data.subheading}</p>}
            {data.ctaText && <span className="mt-3 inline-block px-3 py-1 bg-white text-neutral-900 text-[10px] font-bold uppercase tracking-wider rounded">{data.ctaText}</span>}
          </div>
        </div>
      );
    case 'heading':
      return (
        <div className={`text-${data.alignment || 'center'}`}>
          {data.level === 'h1' ? <h1 className="text-xl font-serif font-bold text-neutral-900">{data.text}</h1> :
           data.level === 'h3' ? <h3 className="text-base font-serif font-bold text-neutral-900">{data.text}</h3> :
           <h2 className="text-lg font-serif font-bold text-neutral-900">{data.text}</h2>}
          {data.subtitle && <p className="text-xs text-neutral-400 mt-1">{data.subtitle}</p>}
        </div>
      );
    case 'text':
      return (
        <div className={`text-${data.alignment || 'left'} ${data.maxWidth === 'prose' ? 'max-w-prose mx-auto' : ''}`}>
          <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap line-clamp-4">{data.content}</p>
        </div>
      );
    case 'image':
      return (
        <div className="flex justify-center">
          {data.url ? (
            <div className={`${data.fullWidth ? 'w-full' : 'max-w-sm'}`}>
              <img src={data.url} alt={data.alt || ''} className={`w-full h-auto ${data.rounded ? 'rounded-lg' : ''} ${data.shadow ? 'shadow-md' : ''}`} />
              {data.caption && <p className="text-[10px] text-neutral-400 text-center mt-2">{data.caption}</p>}
            </div>
          ) : (
            <div className="w-full h-32 bg-neutral-100 rounded-lg flex items-center justify-center border-2 border-dashed border-neutral-200">
              <div className="text-center">
                <ImagePlus className="w-6 h-6 text-neutral-300 mx-auto mb-1" />
                <p className="text-[10px] text-neutral-400">No image set</p>
              </div>
            </div>
          )}
        </div>
      );
    case 'image-text':
      return (
        <div className={`flex gap-4 ${data.imagePosition === 'right' ? 'flex-row-reverse' : ''} items-center`}>
          <div className="w-1/2">
            {data.image ? <img src={data.image} alt="" className="w-full h-24 object-cover rounded-lg" /> :
              <div className="w-full h-24 bg-neutral-100 rounded-lg flex items-center justify-center border-2 border-dashed border-neutral-200"><ImagePlus className="w-5 h-5 text-neutral-300" /></div>}
          </div>
          <div className="w-1/2">
            <h4 className="text-sm font-bold text-neutral-900">{data.heading}</h4>
            <p className="text-[11px] text-neutral-500 mt-1 line-clamp-3">{data.text}</p>
            {data.ctaText && <span className="text-[10px] text-neutral-900 font-bold mt-2 inline-block underline">{data.ctaText}</span>}
          </div>
        </div>
      );
    case 'gallery':
      return (
        <div className={`grid grid-cols-${data.columns || 3} ${data.gap === 'sm' ? 'gap-1' : data.gap === 'lg' ? 'gap-3' : 'gap-2'}`}>
          {(data.images || []).slice(0, 6).map((img: any, i: number) => (
            <div key={i} className={`aspect-square bg-neutral-100 ${data.rounded ? 'rounded-lg' : ''} overflow-hidden`}>
              {img.url ? <img src={img.url} alt={img.alt || ''} className="w-full h-full object-cover" /> :
                <div className="w-full h-full flex items-center justify-center"><ImagePlus className="w-4 h-4 text-neutral-300" /></div>}
            </div>
          ))}
        </div>
      );
    case 'video':
      return (
        <div className="aspect-video bg-neutral-900 rounded-lg flex items-center justify-center">
          {data.url ? (
            <div className="text-center">
              <PlayCircle className="w-10 h-10 text-white/60 mx-auto" />
              <p className="text-[10px] text-white/40 mt-1 truncate max-w-[200px]">{data.url}</p>
            </div>
          ) : (
            <div className="text-center">
              <PlayCircle className="w-8 h-8 text-white/30 mx-auto" />
              <p className="text-[10px] text-white/30 mt-1">No video URL set</p>
            </div>
          )}
        </div>
      );
    case 'cta':
      return (
        <div className={`${data.style === 'dark' ? 'bg-neutral-900 text-white' : data.style === 'light' ? 'bg-neutral-50 text-neutral-900' : 'bg-gradient-to-r from-neutral-900 to-neutral-700 text-white'} ${data.fullWidth ? '' : 'max-w-lg mx-auto'} rounded-lg p-6 text-center`}>
          <h4 className="font-serif text-base font-bold">{data.heading}</h4>
          {data.subheading && <p className={`text-[11px] mt-1 ${data.style === 'light' ? 'text-neutral-500' : 'text-white/60'}`}>{data.subheading}</p>}
          {data.buttonText && <span className={`mt-3 inline-block px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded ${data.style === 'dark' ? 'bg-white text-neutral-900' : 'bg-neutral-900 text-white'}`}>{data.buttonText}</span>}
        </div>
      );
    case 'columns':
      return (
        <div className={`grid ${data.count === 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
          {(data.columns || []).map((col: any, i: number) => (
            <div key={i} className="bg-neutral-50 rounded-lg p-3">
              <h5 className="text-xs font-bold text-neutral-900">{col.heading}</h5>
              <p className="text-[10px] text-neutral-500 mt-1 line-clamp-2">{col.text}</p>
            </div>
          ))}
        </div>
      );
    case 'testimonial':
      return (
        <div className="text-center max-w-md mx-auto">
          <Quote className="w-6 h-6 text-neutral-200 mx-auto mb-2" />
          <p className="text-sm text-neutral-700 italic leading-relaxed line-clamp-3">{data.quote}</p>
          <div className="mt-3 flex items-center justify-center gap-2">
            {data.avatar ? <img src={data.avatar} alt="" className="w-8 h-8 rounded-full object-cover" /> :
              <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-[10px] font-bold text-neutral-500">{(data.author || '?')[0]}</div>}
            <div className="text-left">
              <p className="text-xs font-bold text-neutral-900">{data.author}</p>
              {data.role && <p className="text-[10px] text-neutral-400">{data.role}</p>}
            </div>
          </div>
          {data.rating && (
            <div className="flex justify-center gap-0.5 mt-2">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-3 h-3 ${i < data.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'}`} />)}
            </div>
          )}
        </div>
      );
    case 'divider':
      return (
        <div className={`${data.spacing === 'sm' ? 'py-2' : data.spacing === 'lg' ? 'py-8' : 'py-4'}`}>
          {data.type === 'line' ? <hr className="border-neutral-200" /> :
           data.type === 'dots' ? <div className="flex justify-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-neutral-300" /><span className="w-1.5 h-1.5 rounded-full bg-neutral-300" /><span className="w-1.5 h-1.5 rounded-full bg-neutral-300" /></div> :
           <div />}
        </div>
      );
    case 'stats':
      return (
        <div className="flex justify-around py-4">
          {(data.stats || []).map((stat: any, i: number) => (
            <div key={i} className="text-center">
              <p className="text-lg font-serif font-bold text-neutral-900">{stat.value}</p>
              <p className="text-[10px] text-neutral-400 uppercase tracking-wider mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      );
    case 'faq':
      return (
        <div className="space-y-2 max-w-lg mx-auto">
          {(data.items || []).map((item: any, i: number) => (
            <div key={i} className="border border-neutral-200 rounded-lg px-3 py-2.5">
              <p className="text-xs font-bold text-neutral-900 flex items-center gap-2"><HelpCircle className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />{item.question}</p>
              <p className="text-[10px] text-neutral-500 mt-1 pl-5.5 line-clamp-2">{item.answer}</p>
            </div>
          ))}
        </div>
      );
    case 'product-grid':
      return (
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: data.count || 4 }).map((_, i) => (
            <div key={i} className="aspect-square bg-neutral-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-neutral-300" />
            </div>
          ))}
        </div>
      );
    case 'map':
      return (
        <div className="bg-neutral-100 rounded-lg h-24 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-6 h-6 text-neutral-300 mx-auto" />
            <p className="text-[10px] text-neutral-400 mt-1">{data.address || 'Map embed'}</p>
          </div>
        </div>
      );
    case 'list':
      return (
        <div className={`${data.columns === 2 ? 'grid grid-cols-2 gap-x-4' : ''}`}>
          {(data.items || []).map((item: string, i: number) => (
            <div key={i} className="flex items-center gap-2 py-1">
              {data.style === 'check' ? <span className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-[10px] flex-shrink-0">&#10003;</span> :
               data.style === 'number' ? <span className="text-[10px] font-bold text-neutral-400 w-4">{i + 1}.</span> :
               <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 flex-shrink-0" />}
              <span className="text-xs text-neutral-700">{item}</span>
            </div>
          ))}
        </div>
      );
    default:
      return <p className="text-xs text-neutral-400 italic">Unknown block type: {block.type}</p>;
  }
};

// ─── Block Property Editor ───────────────────────────────────
const BlockEditor = ({ block, onChange }: { block: any; onChange: (data: any) => void }) => {
  const { data } = block;
  const update = (key: string, value: any) => onChange({ ...data, [key]: value });
  const { media, authHeaders } = useAdmin();
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (file: File, key: string) => {
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const res = await fetch(`${API}/media/upload`, {
          method: 'POST', headers: authHeaders(),
          body: JSON.stringify({ fileName: file.name, fileType: file.type, fileSize: file.size, base64Data: base64 }),
        });
        if (res.ok) {
          const mediaItem = await res.json();
          update(key, mediaItem.url);
          toast.success('Image uploaded');
        } else { toast.error('Upload failed'); }
      } catch { toast.error('Upload failed'); }
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const InputField = ({ label, value, onChange: onCh, type = 'text', placeholder = '', rows }: any) => (
    <div>
      <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 mb-1 block">{label}</label>
      {rows ? (
        <textarea value={value || ''} onChange={(e) => onCh(e.target.value)} rows={rows} placeholder={placeholder}
          className="w-full bg-neutral-50 border border-neutral-200 rounded-md px-3 py-2 text-xs outline-none focus:border-neutral-900 transition-colors resize-y" />
      ) : (
        <input type={type} value={value || ''} onChange={(e) => onCh(type === 'number' ? Number(e.target.value) : e.target.value)} placeholder={placeholder}
          className="w-full bg-neutral-50 border border-neutral-200 rounded-md px-3 py-2 text-xs outline-none focus:border-neutral-900 transition-colors" />
      )}
    </div>
  );

  const SelectField = ({ label, value, onChange: onCh, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) => (
    <div>
      <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 mb-1 block">{label}</label>
      <select value={value} onChange={(e) => onCh(e.target.value)}
        className="w-full bg-neutral-50 border border-neutral-200 rounded-md px-3 py-2 text-xs outline-none focus:border-neutral-900 transition-colors">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );

  const ImageField = ({ label, value, fieldKey }: { label: string; value: string; fieldKey: string }) => {
    const fileRef = useRef<HTMLInputElement>(null);
    return (
      <div>
        <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 mb-1 block">{label}</label>
        {value ? (
          <div className="relative group">
            <img src={value} alt="" className="w-full h-24 object-cover rounded-lg border border-neutral-200" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
              <button type="button" onClick={() => update(fieldKey, '')} className="p-1.5 bg-white rounded-full"><Trash2 className="w-3 h-3 text-red-600" /></button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <button type="button" disabled={uploading} onClick={() => fileRef.current?.click()}
              className="flex-1 py-3 border-2 border-dashed border-neutral-200 rounded-lg hover:border-neutral-400 transition-colors text-xs text-neutral-500 flex items-center justify-center gap-1.5 disabled:opacity-50">
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />} Upload
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0], fieldKey); e.target.value = ''; }} />
          </div>
        )}
        <input type="text" value={value || ''} onChange={(e) => update(fieldKey, e.target.value)} placeholder="or paste URL..."
          className="w-full mt-1.5 bg-neutral-50 border border-neutral-200 rounded-md px-3 py-1.5 text-[10px] outline-none focus:border-neutral-900 transition-colors font-mono" />
      </div>
    );
  };

  switch (block.type) {
    case 'hero':
      return (
        <div className="space-y-3">
          <InputField label="Heading" value={data.heading} onChange={(v: string) => update('heading', v)} />
          <InputField label="Subheading" value={data.subheading} onChange={(v: string) => update('subheading', v)} />
          <ImageField label="Background Image" value={data.image} fieldKey="image" />
          <div className="grid grid-cols-2 gap-3">
            <InputField label="CTA Text" value={data.ctaText} onChange={(v: string) => update('ctaText', v)} />
            <InputField label="CTA Link" value={data.ctaLink} onChange={(v: string) => update('ctaLink', v)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Height" value={data.height || 'lg'} onChange={(v) => update('height', v)} options={[{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }]} />
            <SelectField label="Alignment" value={data.alignment || 'center'} onChange={(v) => update('alignment', v)} options={[{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }]} />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 mb-1 block">Overlay Opacity: {Math.round((data.overlay || 0.4) * 100)}%</label>
            <input type="range" min="0" max="1" step="0.05" value={data.overlay || 0.4} onChange={(e) => update('overlay', Number(e.target.value))} className="w-full accent-neutral-900" />
          </div>
        </div>
      );
    case 'heading':
      return (
        <div className="space-y-3">
          <InputField label="Heading Text" value={data.text} onChange={(v: string) => update('text', v)} />
          <InputField label="Subtitle" value={data.subtitle} onChange={(v: string) => update('subtitle', v)} placeholder="Optional subtitle text" />
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Level" value={data.level || 'h2'} onChange={(v) => update('level', v)} options={[{ value: 'h1', label: 'H1 — Page Title' }, { value: 'h2', label: 'H2 — Section' }, { value: 'h3', label: 'H3 — Subsection' }]} />
            <SelectField label="Alignment" value={data.alignment || 'center'} onChange={(v) => update('alignment', v)} options={[{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }]} />
          </div>
        </div>
      );
    case 'text':
      return (
        <div className="space-y-3">
          <InputField label="Content" value={data.content} onChange={(v: string) => update('content', v)} rows={6} />
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Alignment" value={data.alignment || 'left'} onChange={(v) => update('alignment', v)} options={[{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }]} />
            <SelectField label="Max Width" value={data.maxWidth || 'prose'} onChange={(v) => update('maxWidth', v)} options={[{ value: 'prose', label: 'Prose (readable)' }, { value: 'full', label: 'Full Width' }, { value: 'narrow', label: 'Narrow' }]} />
          </div>
        </div>
      );
    case 'image':
      return (
        <div className="space-y-3">
          <ImageField label="Image" value={data.url} fieldKey="url" />
          <InputField label="Alt Text" value={data.alt} onChange={(v: string) => update('alt', v)} placeholder="Describe the image for accessibility" />
          <InputField label="Caption" value={data.caption} onChange={(v: string) => update('caption', v)} placeholder="Optional caption" />
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-700">
              <input type="checkbox" checked={data.rounded !== false} onChange={(e) => update('rounded', e.target.checked)} className="accent-neutral-900 w-3.5 h-3.5" /> Rounded
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-700">
              <input type="checkbox" checked={data.shadow !== false} onChange={(e) => update('shadow', e.target.checked)} className="accent-neutral-900 w-3.5 h-3.5" /> Shadow
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-700">
              <input type="checkbox" checked={!!data.fullWidth} onChange={(e) => update('fullWidth', e.target.checked)} className="accent-neutral-900 w-3.5 h-3.5" /> Full Width
            </label>
          </div>
        </div>
      );
    case 'image-text':
      return (
        <div className="space-y-3">
          <ImageField label="Image" value={data.image} fieldKey="image" />
          <InputField label="Heading" value={data.heading} onChange={(v: string) => update('heading', v)} />
          <InputField label="Text" value={data.text} onChange={(v: string) => update('text', v)} rows={3} />
          <SelectField label="Image Position" value={data.imagePosition || 'left'} onChange={(v) => update('imagePosition', v)} options={[{ value: 'left', label: 'Image Left' }, { value: 'right', label: 'Image Right' }]} />
          <div className="grid grid-cols-2 gap-3">
            <InputField label="CTA Text" value={data.ctaText} onChange={(v: string) => update('ctaText', v)} placeholder="Optional" />
            <InputField label="CTA Link" value={data.ctaLink} onChange={(v: string) => update('ctaLink', v)} placeholder="/" />
          </div>
        </div>
      );
    case 'gallery':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Columns" value={String(data.columns || 3)} onChange={(v) => update('columns', Number(v))} options={[{ value: '2', label: '2 Columns' }, { value: '3', label: '3 Columns' }, { value: '4', label: '4 Columns' }]} />
            <SelectField label="Gap" value={data.gap || 'md'} onChange={(v) => update('gap', v)} options={[{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }]} />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 mb-1.5 block">Images ({(data.images || []).length})</label>
            <div className="space-y-2">
              {(data.images || []).map((img: any, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={img.url || ''} onChange={(e) => { const imgs = [...(data.images || [])]; imgs[i] = { ...imgs[i], url: e.target.value }; update('images', imgs); }}
                    placeholder="Image URL..." className="flex-1 bg-neutral-50 border border-neutral-200 rounded-md px-2 py-1.5 text-[10px] outline-none focus:border-neutral-900 transition-colors font-mono" />
                  <button type="button" onClick={() => { const imgs = (data.images || []).filter((_: any, j: number) => j !== i); update('images', imgs); }} className="p-1 hover:bg-red-50 rounded"><Trash2 className="w-3 h-3 text-red-500" /></button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => update('images', [...(data.images || []), { url: '', alt: '' }])} className="mt-2 text-[10px] font-bold text-neutral-500 hover:text-neutral-900 flex items-center gap-1"><Plus className="w-3 h-3" /> Add Image</button>
          </div>
        </div>
      );
    case 'video':
      return (
        <div className="space-y-3">
          <InputField label="Video URL" value={data.url} onChange={(v: string) => update('url', v)} placeholder="https://youtube.com/watch?v=..." />
          <InputField label="Caption" value={data.caption} onChange={(v: string) => update('caption', v)} placeholder="Optional" />
        </div>
      );
    case 'cta':
      return (
        <div className="space-y-3">
          <InputField label="Heading" value={data.heading} onChange={(v: string) => update('heading', v)} />
          <InputField label="Subheading" value={data.subheading} onChange={(v: string) => update('subheading', v)} />
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Button Text" value={data.buttonText} onChange={(v: string) => update('buttonText', v)} />
            <InputField label="Button Link" value={data.buttonLink} onChange={(v: string) => update('buttonLink', v)} />
          </div>
          <SelectField label="Style" value={data.style || 'dark'} onChange={(v) => update('style', v)} options={[{ value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }, { value: 'gradient', label: 'Gradient' }]} />
        </div>
      );
    case 'columns':
      return (
        <div className="space-y-3">
          <SelectField label="Column Count" value={String(data.count || 2)} onChange={(v) => {
            const count = Number(v);
            const cols = [...(data.columns || [])];
            while (cols.length < count) cols.push({ heading: `Column ${cols.length + 1}`, text: 'Description text...' });
            update('count', count);
            update('columns', cols.slice(0, count));
            onChange({ ...data, count, columns: cols.slice(0, count) });
          }} options={[{ value: '2', label: '2 Columns' }, { value: '3', label: '3 Columns' }]} />
          {(data.columns || []).map((col: any, i: number) => (
            <div key={i} className="p-3 bg-neutral-50 rounded-lg space-y-2 border border-neutral-100">
              <p className="text-[9px] uppercase tracking-widest font-bold text-neutral-400">Column {i + 1}</p>
              <input value={col.heading || ''} onChange={(e) => { const cols = [...(data.columns || [])]; cols[i] = { ...cols[i], heading: e.target.value }; onChange({ ...data, columns: cols }); }}
                placeholder="Heading" className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 text-xs outline-none focus:border-neutral-900" />
              <textarea value={col.text || ''} onChange={(e) => { const cols = [...(data.columns || [])]; cols[i] = { ...cols[i], text: e.target.value }; onChange({ ...data, columns: cols }); }}
                rows={2} placeholder="Content..." className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 text-xs outline-none focus:border-neutral-900 resize-y" />
            </div>
          ))}
        </div>
      );
    case 'testimonial':
      return (
        <div className="space-y-3">
          <InputField label="Quote" value={data.quote} onChange={(v: string) => update('quote', v)} rows={3} />
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Author" value={data.author} onChange={(v: string) => update('author', v)} />
            <InputField label="Role / Title" value={data.role} onChange={(v: string) => update('role', v)} />
          </div>
          <SelectField label="Rating" value={String(data.rating || 5)} onChange={(v) => update('rating', Number(v))} options={[{ value: '0', label: 'No Rating' }, { value: '3', label: '3 Stars' }, { value: '4', label: '4 Stars' }, { value: '5', label: '5 Stars' }]} />
        </div>
      );
    case 'divider':
      return (
        <div className="space-y-3">
          <SelectField label="Style" value={data.type || 'line'} onChange={(v) => update('type', v)} options={[{ value: 'line', label: 'Line' }, { value: 'dots', label: 'Dots' }, { value: 'space', label: 'Blank Space' }]} />
          <SelectField label="Spacing" value={data.spacing || 'md'} onChange={(v) => update('spacing', v)} options={[{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }]} />
        </div>
      );
    case 'stats':
      return (
        <div className="space-y-3">
          <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 mb-1 block">Statistics</label>
          {(data.stats || []).map((stat: any, i: number) => (
            <div key={i} className="flex gap-2 items-center">
              <input value={stat.value || ''} onChange={(e) => { const s = [...(data.stats || [])]; s[i] = { ...s[i], value: e.target.value }; update('stats', s); }}
                placeholder="Value" className="w-24 bg-neutral-50 border border-neutral-200 rounded px-2 py-1.5 text-xs outline-none focus:border-neutral-900 font-bold" />
              <input value={stat.label || ''} onChange={(e) => { const s = [...(data.stats || [])]; s[i] = { ...s[i], label: e.target.value }; update('stats', s); }}
                placeholder="Label" className="flex-1 bg-neutral-50 border border-neutral-200 rounded px-2 py-1.5 text-xs outline-none focus:border-neutral-900" />
              <button type="button" onClick={() => update('stats', (data.stats || []).filter((_: any, j: number) => j !== i))} className="p-1 hover:bg-red-50 rounded"><Trash2 className="w-3 h-3 text-red-500" /></button>
            </div>
          ))}
          <button type="button" onClick={() => update('stats', [...(data.stats || []), { value: '0', label: 'New Stat' }])} className="text-[10px] font-bold text-neutral-500 hover:text-neutral-900 flex items-center gap-1"><Plus className="w-3 h-3" /> Add Stat</button>
        </div>
      );
    case 'faq':
      return (
        <div className="space-y-3">
          <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 mb-1 block">Questions & Answers</label>
          {(data.items || []).map((item: any, i: number) => (
            <div key={i} className="p-3 bg-neutral-50 rounded-lg space-y-2 border border-neutral-100">
              <div className="flex justify-between items-center">
                <p className="text-[9px] uppercase tracking-widest font-bold text-neutral-400">Q{i + 1}</p>
                <button type="button" onClick={() => update('items', (data.items || []).filter((_: any, j: number) => j !== i))} className="p-0.5 hover:bg-red-50 rounded"><Trash2 className="w-3 h-3 text-red-500" /></button>
              </div>
              <input value={item.question || ''} onChange={(e) => { const items = [...(data.items || [])]; items[i] = { ...items[i], question: e.target.value }; update('items', items); }}
                placeholder="Question" className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 text-xs outline-none focus:border-neutral-900 font-medium" />
              <textarea value={item.answer || ''} onChange={(e) => { const items = [...(data.items || [])]; items[i] = { ...items[i], answer: e.target.value }; update('items', items); }}
                rows={2} placeholder="Answer" className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 text-xs outline-none focus:border-neutral-900 resize-y" />
            </div>
          ))}
          <button type="button" onClick={() => update('items', [...(data.items || []), { question: '', answer: '' }])} className="text-[10px] font-bold text-neutral-500 hover:text-neutral-900 flex items-center gap-1"><Plus className="w-3 h-3" /> Add Question</button>
        </div>
      );
    case 'list':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Style" value={data.style || 'check'} onChange={(v) => update('style', v)} options={[{ value: 'check', label: 'Checkmarks' }, { value: 'bullet', label: 'Bullets' }, { value: 'number', label: 'Numbered' }]} />
            <SelectField label="Columns" value={String(data.columns || 1)} onChange={(v) => update('columns', Number(v))} options={[{ value: '1', label: '1 Column' }, { value: '2', label: '2 Columns' }]} />
          </div>
          <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 mb-1 block">Items</label>
          {(data.items || []).map((item: string, i: number) => (
            <div key={i} className="flex gap-2">
              <input value={item} onChange={(e) => { const items = [...(data.items || [])]; items[i] = e.target.value; update('items', items); }}
                className="flex-1 bg-neutral-50 border border-neutral-200 rounded px-2 py-1.5 text-xs outline-none focus:border-neutral-900" />
              <button type="button" onClick={() => update('items', (data.items || []).filter((_: any, j: number) => j !== i))} className="p-1 hover:bg-red-50 rounded"><Trash2 className="w-3 h-3 text-red-500" /></button>
            </div>
          ))}
          <button type="button" onClick={() => update('items', [...(data.items || []), ''])} className="text-[10px] font-bold text-neutral-500 hover:text-neutral-900 flex items-center gap-1"><Plus className="w-3 h-3" /> Add Item</button>
        </div>
      );
    case 'map':
      return (
        <div className="space-y-3">
          <InputField label="Google Maps Embed URL" value={data.embedUrl} onChange={(v: string) => update('embedUrl', v)} placeholder="https://maps.google.com/maps?..." />
          <InputField label="Address Label" value={data.address} onChange={(v: string) => update('address', v)} placeholder="123 Main St, City" />
          <InputField label="Height (px)" value={data.height} onChange={(v: string) => update('height', Number(v))} type="number" />
        </div>
      );
    case 'product-grid':
      return (
        <div className="space-y-3">
          <SelectField label="Products to Show" value={String(data.count || 4)} onChange={(v) => update('count', Number(v))} options={[{ value: '2', label: '2 Products' }, { value: '3', label: '3 Products' }, { value: '4', label: '4 Products' }, { value: '6', label: '6 Products' }, { value: '8', label: '8 Products' }]} />
          <SelectField label="Display Style" value={data.style || 'grid'} onChange={(v) => update('style', v)} options={[{ value: 'grid', label: 'Grid' }, { value: 'carousel', label: 'Carousel' }]} />
          <p className="text-[10px] text-neutral-400">Products will be pulled automatically from your catalog (newest or featured).</p>
        </div>
      );
    default:
      return <p className="text-xs text-neutral-400 italic">No editor available for this block type.</p>;
  }
};


// ─── Block Settings Editor (Style Panel) ─────────────────────
const BlockSettingsEditor = ({ settings, onChange }: { settings: any; onChange: (s: any) => void }) => {
  const s = settings || {};
  const update = (key: string, value: any) => onChange({ ...s, [key]: value });

  return (
    <div className="space-y-4">
      {/* Background */}
      <div>
        <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-neutral-400 mb-2 flex items-center gap-1.5"><Palette className="w-3 h-3" /> Background</p>
        <div className="space-y-2">
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 mb-1 block">Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={s.bgColor || '#ffffff'} onChange={(e) => update('bgColor', e.target.value === '#ffffff' ? '' : e.target.value)}
                className="w-8 h-8 rounded border border-neutral-200 cursor-pointer" />
              <input type="text" value={s.bgColor || ''} onChange={(e) => update('bgColor', e.target.value)} placeholder="transparent"
                className="flex-1 bg-neutral-50 border border-neutral-200 rounded-md px-2 py-1.5 text-[10px] outline-none focus:border-neutral-900 font-mono" />
              {s.bgColor && <button onClick={() => update('bgColor', '')} className="text-[9px] text-neutral-400 hover:text-red-500">Clear</button>}
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 mb-1 block">Background Image</label>
            <input type="text" value={s.bgImage || ''} onChange={(e) => update('bgImage', e.target.value)} placeholder="Image URL..."
              className="w-full bg-neutral-50 border border-neutral-200 rounded-md px-2 py-1.5 text-[10px] outline-none focus:border-neutral-900 font-mono" />
          </div>
          {s.bgImage && (
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 mb-1 block">Overlay Opacity: {Math.round((s.bgOverlay || 0) * 100)}%</label>
              <input type="range" min="0" max="1" step="0.05" value={s.bgOverlay || 0} onChange={(e) => update('bgOverlay', Number(e.target.value))} className="w-full accent-neutral-900" />
            </div>
          )}
        </div>
      </div>

      {/* Spacing */}
      <div>
        <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-neutral-400 mb-2 flex items-center gap-1.5"><Maximize2 className="w-3 h-3" /> Spacing</p>
        <div>
          <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 mb-1 block">Vertical Padding</label>
          <div className="grid grid-cols-5 gap-1">
            {[{ v: 'none', l: 'None' }, { v: 'sm', l: 'S' }, { v: 'md', l: 'M' }, { v: 'lg', l: 'L' }, { v: 'xl', l: 'XL' }].map(opt => (
              <button key={opt.v} onClick={() => update('paddingY', opt.v)}
                className={`py-1.5 rounded text-[10px] font-bold transition-colors ${(s.paddingY || 'md') === opt.v ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`}>
                {opt.l}
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-700 mt-3">
          <input type="checkbox" checked={!!s.fullBleed} onChange={(e) => update('fullBleed', e.target.checked)} className="accent-neutral-900 w-3.5 h-3.5" />
          Full-width (no container padding)
        </label>
      </div>

      {/* Anchor / ID */}
      <div>
        <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-neutral-400 mb-2 flex items-center gap-1.5"><Hash className="w-3 h-3" /> Anchor</p>
        <input type="text" value={s.anchor || ''} onChange={(e) => update('anchor', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="section-id"
          className="w-full bg-neutral-50 border border-neutral-200 rounded-md px-2 py-1.5 text-xs outline-none focus:border-neutral-900 font-mono" />
        <p className="text-[9px] text-neutral-400 mt-1">Used for anchor links: #section-id</p>
      </div>

      {/* Custom CSS Class */}
      <div>
        <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-neutral-400 mb-2 flex items-center gap-1.5"><Code2 className="w-3 h-3" /> Custom CSS Class</p>
        <input type="text" value={s.customClass || ''} onChange={(e) => update('customClass', e.target.value)} placeholder="my-custom-class"
          className="w-full bg-neutral-50 border border-neutral-200 rounded-md px-2 py-1.5 text-xs outline-none focus:border-neutral-900 font-mono" />
        <p className="text-[9px] text-neutral-400 mt-1">Add Tailwind or custom CSS classes to this block&apos;s wrapper.</p>
      </div>
    </div>
  );
};

// ─── Starter Templates ───────────────────────────────────────
const STARTER_TEMPLATES = [
  {
    name: 'Landing Page',
    description: 'Full hero, features, CTA, and FAQ',
    icon: FileText,
    color: 'bg-gradient-to-br from-neutral-900 to-neutral-700',
    blocks: [
      { type: 'hero', data: { heading: 'Welcome to Our World', subheading: 'Discover curated luxury for your space', image: '', ctaText: 'Explore Collection', ctaLink: '/shop', overlay: 0.45, height: 'lg', alignment: 'center' }, settings: { paddingY: 'none' } },
      { type: 'heading', data: { text: 'Why Choose Us', level: 'h2', alignment: 'center', subtitle: 'Three reasons our clients love working with us' }, settings: { paddingY: 'lg' } },
      { type: 'columns', data: { count: 3, columns: [{ heading: 'Expert Curation', text: 'Every piece is hand-selected by our design team for quality and aesthetic excellence.' }, { heading: 'White-Glove Service', text: 'From consultation to installation, we handle every detail with care.' }, { heading: 'Timeless Quality', text: 'We source only the finest materials that stand the test of time.' }] }, settings: { paddingY: 'md' } },
      { type: 'cta', data: { heading: 'Ready to Transform Your Space?', subheading: 'Book a free consultation with our design experts', buttonText: 'Get Started', buttonLink: '/contact', style: 'dark', fullWidth: true }, settings: { paddingY: 'lg' } },
      { type: 'faq', data: { items: [{ question: 'Do you offer design consultations?', answer: 'Yes, we offer complimentary 30-minute consultations either in-store or virtually.' }, { question: 'What is your delivery timeline?', answer: 'Standard delivery takes 5-7 business days. Express options are available for select items.' }, { question: 'Can I return items?', answer: 'We accept returns within 30 days of delivery for items in original condition.' }] }, settings: { paddingY: 'lg' } },
    ],
  },
  {
    name: 'About Page',
    description: 'Story, stats, team, and testimonial',
    icon: Quote,
    color: 'bg-gradient-to-br from-blue-900 to-blue-700',
    blocks: [
      { type: 'hero', data: { heading: 'Our Story', subheading: 'Founded on a passion for exceptional design', image: '', ctaText: '', ctaLink: '', overlay: 0.5, height: 'md', alignment: 'center' }, settings: { paddingY: 'none' } },
      { type: 'image-text', data: { image: '', heading: 'A Legacy of Design Excellence', text: 'Since our founding, we have been dedicated to bringing the finest interior pieces to discerning clients who appreciate quality craftsmanship and timeless design.', imagePosition: 'left', ctaText: 'Our Process', ctaLink: '#process' }, settings: { paddingY: 'lg' } },
      { type: 'stats', data: { stats: [{ value: '500+', label: 'Projects Completed' }, { value: '99%', label: 'Client Satisfaction' }, { value: '15+', label: 'Years Experience' }, { value: '50+', label: 'Artisan Partners' }], style: 'minimal' }, settings: { paddingY: 'lg', bgColor: '#fafafa' } },
      { type: 'testimonial', data: { quote: '"Working with B-Interiors transformed our home beyond what we imagined. Their attention to detail and design sensibility is unmatched."', author: 'Sarah Johnson', role: 'Homeowner, Sandton', avatar: '', rating: 5 }, settings: { paddingY: 'lg' } },
    ],
  },
  {
    name: 'Portfolio',
    description: 'Gallery showcase with project highlights',
    icon: LayoutGrid,
    color: 'bg-gradient-to-br from-emerald-900 to-emerald-700',
    blocks: [
      { type: 'heading', data: { text: 'Our Portfolio', level: 'h1', alignment: 'center', subtitle: 'A selection of our finest interior projects' }, settings: { paddingY: 'xl' } },
      { type: 'gallery', data: { images: [{ url: '', alt: 'Project 1' }, { url: '', alt: 'Project 2' }, { url: '', alt: 'Project 3' }, { url: '', alt: 'Project 4' }, { url: '', alt: 'Project 5' }, { url: '', alt: 'Project 6' }], columns: 3, gap: 'md', rounded: true }, settings: { paddingY: 'md' } },
      { type: 'cta', data: { heading: 'Have a Project in Mind?', subheading: 'Let us bring your vision to life', buttonText: 'Start a Conversation', buttonLink: '/contact', style: 'gradient', fullWidth: true }, settings: { paddingY: 'lg' } },
    ],
  },
  {
    name: 'Contact / Info',
    description: 'Heading, text, map, and CTA',
    icon: MapPin,
    color: 'bg-gradient-to-br from-amber-800 to-amber-600',
    blocks: [
      { type: 'heading', data: { text: 'Get In Touch', level: 'h1', alignment: 'center', subtitle: 'We would love to hear from you' }, settings: { paddingY: 'xl' } },
      { type: 'columns', data: { count: 2, columns: [{ heading: 'Visit Our Showroom', text: '123 Design Avenue\nAlberton, Gauteng\nSouth Africa\n\nMon-Fri: 9am - 6pm\nSat: 10am - 4pm' }, { heading: 'Contact Details', text: 'Phone: +27 11 000 0000\nEmail: hello@b-interiors.co.za\nWhatsApp: +27 60 000 0000\n\nWe respond within 24 hours.' }] }, settings: { paddingY: 'md' } },
      { type: 'map', data: { embedUrl: '', address: '123 Design Avenue, Alberton', height: 350 }, settings: { paddingY: 'md' } },
    ],
  },
  {
    name: 'Blank',
    description: 'Start from scratch',
    icon: Plus,
    color: 'bg-neutral-200',
    blocks: [],
  },
];

// ═══════════════════════════════════════════════════════════════
// PAGE BUILDER (Main Component)
// ═══════════════════════════════════════════════════════════════
interface PageBuilderProps {
  page?: any;
  onSave: (pageData: any) => Promise<void>;
  onClose: () => void;
}

export const PageBuilder = ({ page, onSave, onClose }: PageBuilderProps) => {
  // Page meta
  const [title, setTitle] = useState(page?.title || '');
  const [slug, setSlug] = useState(page?.slug || '');
  const [status, setStatus] = useState(page?.status || 'draft');
  const [template, setTemplate] = useState(page?.template || 'default');
  const [metaDescription, setMetaDescription] = useState(page?.metaDescription || '');

  // Blocks
  const [blocks, setBlocks] = useState<any[]>(() => {
    if (page?.blocks && Array.isArray(page.blocks)) return page.blocks;
    // Try parsing content as JSON blocks (backward compat)
    if (page?.content) {
      try {
        const parsed = JSON.parse(page.content);
        if (Array.isArray(parsed)) return parsed;
      } catch { /* not JSON, ignore */ }
    }
    return [];
  });
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showBlockPanel, setShowBlockPanel] = useState(true);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [blockSearch, setBlockSearch] = useState('');
  const [rightPanelTab, setRightPanelTab] = useState<'content' | 'settings'>('content');
  const [templateModal, setTemplateModal] = useState(false);
  const [saveTemplateModal, setSaveTemplateModal] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDesc, setTemplateDesc] = useState('');
  const [templateCategory, setTemplateCategory] = useState('general');
  const { authHeaders } = useAdmin();

  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    setLoadingTemplates(true);
    try {
      const res = await fetch(`${API}/page-templates`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setTemplates(Array.isArray(data) ? data : []);
      }
    } catch { /* silent */ }
    finally { setLoadingTemplates(false); }
  }, [authHeaders]);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const saveAsTemplate = async () => {
    if (!templateName.trim()) { toast.error('Template name is required'); return; }
    try {
      const res = await fetch(`${API}/page-templates`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ name: templateName, description: templateDesc, category: templateCategory, blocks }),
      });
      if (res.ok) {
        toast.success('Template saved');
        setSaveTemplateModal(false);
        setTemplateName(''); setTemplateDesc('');
        fetchTemplates();
      } else { toast.error('Failed to save template'); }
    } catch { toast.error('Failed to save template'); }
  };

  const loadTemplate = (tpl: any) => {
    if (blocks.length > 0 && !confirm('Loading a template will replace all current blocks. Continue?')) return;
    const loadedBlocks = (tpl.blocks || []).map((b: any) => ({ ...b, id: Math.random().toString(36).substr(2, 10) }));
    updateBlocks(loadedBlocks);
    setTemplateModal(false);
    toast.success(`Template "${tpl.name}" loaded`);
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm('Delete this template permanently?')) return;
    try {
      const res = await fetch(`${API}/page-templates/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (res.ok) { toast.success('Template deleted'); fetchTemplates(); }
    } catch { toast.error('Failed to delete template'); }
  };

  // Undo/Redo
  const [history, setHistory] = useState<any[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const pushHistory = useCallback((newBlocks: any[]) => {
    setHistory(prev => {
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed, newBlocks].slice(-30);
    });
    setHistoryIndex(prev => Math.min(prev + 1, 29));
  }, [historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setBlocks(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setBlocks(history[historyIndex + 1]);
    }
  };

  const updateBlocks = (newBlocks: any[]) => {
    setBlocks(newBlocks);
    pushHistory(newBlocks);
  };

  // Auto-slug from title
  useEffect(() => {
    if (!page && title && !slug) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  }, [title, page, slug]);

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  // ─── Block Actions ─────────────────────────────────────────
  const addBlock = (type: string) => {
    const newBlock = {
      id: Math.random().toString(36).substr(2, 10),
      type,
      data: getDefaultBlockData(type),
      settings: { bgColor: '', bgImage: '', bgOverlay: 0, customClass: '', paddingY: 'md', anchor: '', fullBleed: false },
    };
    const idx = selectedBlockId ? blocks.findIndex(b => b.id === selectedBlockId) + 1 : blocks.length;
    const updated = [...blocks];
    updated.splice(idx, 0, newBlock);
    updateBlocks(updated);
    setSelectedBlockId(newBlock.id);
  };

  const duplicateBlock = (id: string) => {
    const idx = blocks.findIndex(b => b.id === id);
    if (idx === -1) return;
    const clone = { ...blocks[idx], id: Math.random().toString(36).substr(2, 10), data: { ...blocks[idx].data }, settings: { ...(blocks[idx].settings || {}) } };
    const updated = [...blocks];
    updated.splice(idx + 1, 0, clone);
    updateBlocks(updated);
    setSelectedBlockId(clone.id);
  };

  const deleteBlock = (id: string) => {
    const updated = blocks.filter(b => b.id !== id);
    updateBlocks(updated);
    if (selectedBlockId === id) setSelectedBlockId(null);
  };

  const reorderBlock = (from: number, to: number) => {
    const updated = [...blocks];
    const [item] = updated.splice(from, 1);
    updated.splice(to, 0, item);
    setBlocks(updated);
  };

  const moveBlockUp = (id: string) => {
    const idx = blocks.findIndex(b => b.id === id);
    if (idx <= 0) return;
    reorderBlock(idx, idx - 1);
    pushHistory(blocks);
  };

  const moveBlockDown = (id: string) => {
    const idx = blocks.findIndex(b => b.id === id);
    if (idx === -1 || idx >= blocks.length - 1) return;
    reorderBlock(idx, idx + 1);
    pushHistory(blocks);
  };

  const updateBlockData = (id: string, newData: any) => {
    const updated = blocks.map(b => b.id === id ? { ...b, data: newData } : b);
    setBlocks(updated);
  };

  const updateBlockSettings = (id: string, newSettings: any) => {
    const updated = blocks.map(b => b.id === id ? { ...b, settings: { ...(b.settings || {}), ...newSettings } } : b);
    setBlocks(updated);
  };

  // ─── Save ──────────────────────────────────────────────────
  const handleSave = async () => {
    if (!title.trim()) { toast.error('Page title is required'); return; }
    if (!slug.trim()) { toast.error('Page slug is required'); return; }
    setSaving(true);
    try {
      await onSave({
        title, slug, status, template, metaDescription, blocks,
        content: JSON.stringify(blocks), // backwards compat
      });
    } catch (err) {
      toast.error('Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  const filteredBlockTypes = BLOCK_TYPES.filter(bt =>
    !blockSearch || bt.label.toLowerCase().includes(blockSearch.toLowerCase()) || bt.category.toLowerCase().includes(blockSearch.toLowerCase())
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-[#f0f0f1] flex flex-col"
      >
        {/* ─── Top Bar ─── */}
        <header className="h-12 bg-white border-b border-neutral-200 flex items-center gap-2 px-3 flex-shrink-0 z-30">
          <button onClick={onClose} className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 transition-colors mr-2">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <div className="h-6 w-px bg-neutral-200" />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Page title..."
            className="text-sm font-medium text-neutral-900 bg-transparent outline-none border-none flex-1 min-w-0 px-2"
          />
          <div className="flex items-center gap-1.5">
            {/* Undo/Redo */}
            <button onClick={undo} disabled={historyIndex <= 0} className="p-1.5 hover:bg-neutral-100 rounded disabled:opacity-30 transition-colors" title="Undo">
              <Undo2 className="w-3.5 h-3.5 text-neutral-500" />
            </button>
            <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-1.5 hover:bg-neutral-100 rounded disabled:opacity-30 transition-colors" title="Redo">
              <Redo2 className="w-3.5 h-3.5 text-neutral-500" />
            </button>
            <div className="h-6 w-px bg-neutral-200 mx-1" />
            {/* Preview size */}
            <button onClick={() => setPreviewMode('desktop')} className={`p-1.5 rounded transition-colors ${previewMode === 'desktop' ? 'bg-neutral-200 text-neutral-900' : 'hover:bg-neutral-100 text-neutral-400'}`} title="Desktop">
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setPreviewMode('tablet')} className={`p-1.5 rounded transition-colors ${previewMode === 'tablet' ? 'bg-neutral-200 text-neutral-900' : 'hover:bg-neutral-100 text-neutral-400'}`} title="Tablet">
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setPreviewMode('mobile')} className={`p-1.5 rounded transition-colors ${previewMode === 'mobile' ? 'bg-neutral-200 text-neutral-900' : 'hover:bg-neutral-100 text-neutral-400'}`} title="Mobile">
              <Smartphone className="w-3.5 h-3.5" />
            </button>
            <div className="h-6 w-px bg-neutral-200 mx-1" />
            {/* Settings */}
            <button onClick={() => setShowSettings(!showSettings)} className={`p-1.5 rounded transition-colors ${showSettings ? 'bg-neutral-200 text-neutral-900' : 'hover:bg-neutral-100 text-neutral-500'}`} title="Page Settings">
              <Settings2 className="w-3.5 h-3.5" />
            </button>
            {/* Templates */}
            <button onClick={() => { setTemplateModal(true); fetchTemplates(); }} className="p-1.5 rounded hover:bg-neutral-100 text-neutral-500 transition-colors" title="Templates">
              <BookTemplate className="w-3.5 h-3.5" />
            </button>
            {/* Save as Template */}
            <button onClick={() => setSaveTemplateModal(true)} className="p-1.5 rounded hover:bg-neutral-100 text-neutral-500 transition-colors" title="Save as Template" disabled={blocks.length === 0}>
              <Bookmark className="w-3.5 h-3.5" />
            </button>
            <div className="h-6 w-px bg-neutral-200 mx-1" />
            {/* Preview */}
            {status === 'published' && slug && (
              <button onClick={() => window.open(`/p/${slug}`, '_blank')} className="p-1.5 rounded hover:bg-neutral-100 text-neutral-500 transition-colors" title="Preview Live Page">
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
            {/* Status */}
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="text-[10px] border border-neutral-200 rounded px-2 py-1 bg-white outline-none">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            {/* Save */}
            <button onClick={handleSave} disabled={saving} className="px-4 py-1.5 bg-neutral-900 text-white rounded-md text-xs font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center gap-1.5">
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </header>

        {/* ─── Page Settings Panel ─── */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-white border-b border-neutral-200 overflow-hidden z-20"
            >
              <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 mb-1 block">Slug</label>
                  <div className="flex items-center bg-neutral-50 border border-neutral-200 rounded-md overflow-hidden">
                    <span className="text-[10px] text-neutral-400 pl-2">/</span>
                    <input value={slug} onChange={(e) => setSlug(e.target.value)} className="flex-1 bg-transparent px-1.5 py-1.5 text-xs font-mono outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 mb-1 block">Template</label>
                  <select value={template} onChange={(e) => setTemplate(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 rounded-md px-2 py-1.5 text-xs outline-none focus:border-neutral-900">
                    <option value="default">Default</option>
                    <option value="full-width">Full Width</option>
                    <option value="sidebar">With Sidebar</option>
                    <option value="landing">Landing Page</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 mb-1 block">Meta Description</label>
                  <input value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} placeholder="SEO description..." className="w-full bg-neutral-50 border border-neutral-200 rounded-md px-2 py-1.5 text-xs outline-none focus:border-neutral-900" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Main Content ─── */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Block Library */}
          <AnimatePresence>
            {showBlockPanel && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 240, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white border-r border-neutral-200 flex flex-col overflow-hidden flex-shrink-0"
              >
                <div className="p-3 border-b border-neutral-100">
                  <div className="flex items-center gap-2 bg-neutral-50 rounded-md px-2.5 py-1.5">
                    <Type className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                    <input
                      value={blockSearch}
                      onChange={(e) => setBlockSearch(e.target.value)}
                      placeholder="Search blocks..."
                      className="bg-transparent text-xs outline-none flex-1 text-neutral-700 placeholder:text-neutral-400"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-3">
                  {CATEGORIES.map(cat => {
                    const catBlocks = filteredBlockTypes.filter(bt => bt.category === cat);
                    if (catBlocks.length === 0) return null;
                    return (
                      <div key={cat}>
                        <p className="px-2 mb-1 text-[9px] uppercase tracking-[0.2em] font-bold text-neutral-400">{cat}</p>
                        <div className="space-y-0.5">
                          {catBlocks.map(bt => (
                            <button
                              key={bt.type}
                              onClick={() => addBlock(bt.type)}
                              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-neutral-50 transition-colors group text-left"
                            >
                              <div className="p-1.5 bg-neutral-100 rounded group-hover:bg-neutral-200 transition-colors">
                                <bt.icon className="w-3.5 h-3.5 text-neutral-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-medium text-neutral-700 leading-tight">{bt.label}</p>
                                <p className="text-[9px] text-neutral-400 leading-tight truncate">{bt.desc}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Center: Canvas */}
          <div className="flex-1 overflow-y-auto bg-[#e5e5e5] relative">
            <div className="sticky top-0 z-10 bg-[#e5e5e5] border-b border-neutral-300/50 px-4 py-1.5 flex items-center justify-between">
              <button onClick={() => setShowBlockPanel(!showBlockPanel)} className="p-1 hover:bg-neutral-300/50 rounded transition-colors" title="Toggle block panel">
                {showBlockPanel ? <PanelLeftClose className="w-4 h-4 text-neutral-500" /> : <PanelLeft className="w-4 h-4 text-neutral-500" />}
              </button>
              <p className="text-[10px] text-neutral-400 font-medium">{blocks.length} block{blocks.length !== 1 ? 's' : ''}</p>
            </div>
            <div className={`mx-auto py-6 px-4 transition-all duration-300 ${
              previewMode === 'mobile' ? 'max-w-[375px]' :
              previewMode === 'tablet' ? 'max-w-[768px]' :
              'max-w-[960px]'
            }`}>
              <div className="bg-white rounded-xl shadow-lg min-h-[400px] p-6 space-y-3">
                {blocks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mb-4">
                      <FileText className="w-7 h-7 text-neutral-300" />
                    </div>
                    <h3 className="text-sm font-medium text-neutral-500">Start building your page</h3>
                    <p className="text-[11px] text-neutral-400 mt-1 max-w-xs">
                      Click any block from the left panel to add it here, or use the button below.
                    </p>
                    <button
                      onClick={() => addBlock('hero')}
                      className="mt-4 px-4 py-2 bg-neutral-900 text-white rounded-md text-xs font-medium hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Hero Block
                    </button>
                  </div>
                ) : (
                  blocks.map((block, index) => (
                    <DraggableBlock
                      key={block.id}
                      block={block}
                      index={index}
                      isSelected={selectedBlockId === block.id}
                      onSelect={() => setSelectedBlockId(block.id)}
                      onReorder={reorderBlock}
                      onDuplicate={() => duplicateBlock(block.id)}
                      onDelete={() => deleteBlock(block.id)}
                      onMoveUp={() => moveBlockUp(block.id)}
                      onMoveDown={() => moveBlockDown(block.id)}
                      totalBlocks={blocks.length}
                    />
                  ))
                )}
                {/* Add Block Between */}
                {blocks.length > 0 && (
                  <div className="flex justify-center pt-2">
                    <button
                      onClick={() => { setSelectedBlockId(null); setShowBlockPanel(true); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-dashed border-neutral-200 rounded-lg hover:border-neutral-400 hover:bg-neutral-50 transition-all text-xs text-neutral-400 hover:text-neutral-600"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Block
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Block Editor */}
          <AnimatePresence>
            {selectedBlock && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white border-l border-neutral-200 flex flex-col overflow-hidden flex-shrink-0"
              >
                <div className="p-3 border-b border-neutral-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {(() => { const Icon = BLOCK_TYPES.find(bt => bt.type === selectedBlock.type)?.icon || FileText; return <Icon className="w-4 h-4 text-neutral-400" />; })()}
                    <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                      {BLOCK_TYPES.find(bt => bt.type === selectedBlock.type)?.label || selectedBlock.type}
                    </h4>
                  </div>
                  <button onClick={() => setSelectedBlockId(null)} className="p-1 hover:bg-neutral-100 rounded transition-colors">
                    <X className="w-3.5 h-3.5 text-neutral-400" />
                  </button>
                </div>
                {/* Tabs: Content | Style */}
                <div className="flex border-b border-neutral-100">
                  <button onClick={() => setRightPanelTab('content')} className={`flex-1 py-2 text-[10px] uppercase tracking-[0.12em] font-bold transition-colors ${rightPanelTab === 'content' ? 'text-neutral-900 border-b-2 border-neutral-900' : 'text-neutral-400 hover:text-neutral-600'}`}>
                    Content
                  </button>
                  <button onClick={() => setRightPanelTab('settings')} className={`flex-1 py-2 text-[10px] uppercase tracking-[0.12em] font-bold transition-colors flex items-center justify-center gap-1 ${rightPanelTab === 'settings' ? 'text-neutral-900 border-b-2 border-neutral-900' : 'text-neutral-400 hover:text-neutral-600'}`}>
                    <Palette className="w-3 h-3" /> Style
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-3">
                  {rightPanelTab === 'content' ? (
                    <BlockEditor
                      block={selectedBlock}
                      onChange={(newData) => updateBlockData(selectedBlock.id, newData)}
                    />
                  ) : (
                    <BlockSettingsEditor
                      settings={selectedBlock.settings || {}}
                      onChange={(newSettings) => updateBlockSettings(selectedBlock.id, newSettings)}
                    />
                  )}
                </div>
                <div className="p-3 border-t border-neutral-100 flex gap-2">
                  <button onClick={() => duplicateBlock(selectedBlock.id)} className="flex-1 py-1.5 border border-neutral-200 rounded text-xs font-medium text-neutral-600 hover:bg-neutral-50 transition-colors flex items-center justify-center gap-1">
                    <Copy className="w-3 h-3" /> Duplicate
                  </button>
                  <button onClick={() => deleteBlock(selectedBlock.id)} className="flex-1 py-1.5 border border-red-200 rounded text-xs font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-1">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>

        {/* ═══ TEMPLATE PICKER MODAL ═══ */}
        <AnimatePresence>
          {templateModal && (
            <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setTemplateModal(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-white shadow-2xl rounded-xl overflow-hidden max-h-[80vh]">
                <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white z-10">
                  <div>
                    <h3 className="text-base font-serif text-neutral-900">Page Templates</h3>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold mt-0.5">Choose a starting point for your page</p>
                  </div>
                  <button onClick={() => setTemplateModal(false)} className="p-1.5 hover:bg-neutral-100 rounded-md transition-colors"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-5 overflow-y-auto max-h-[calc(80vh-80px)]">
                  {/* Built-in starter templates */}
                  <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-neutral-400 mb-3">Starter Templates</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                    {STARTER_TEMPLATES.map(tpl => (
                      <button
                        key={tpl.name}
                        onClick={() => loadTemplate(tpl)}
                        className="group text-left border border-neutral-200 rounded-lg p-3 hover:border-neutral-400 hover:shadow-md transition-all"
                      >
                        <div className={`w-full h-16 rounded-md mb-2 flex items-center justify-center ${tpl.color}`}>
                          <tpl.icon className="w-5 h-5 text-white/80" />
                        </div>
                        <p className="text-xs font-bold text-neutral-900 group-hover:text-neutral-700">{tpl.name}</p>
                        <p className="text-[9px] text-neutral-400 mt-0.5 line-clamp-2">{tpl.description}</p>
                      </button>
                    ))}
                  </div>
                  {/* Saved templates */}
                  <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-neutral-400 mb-3">Your Saved Templates</p>
                  {loadingTemplates ? (
                    <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-neutral-300" /></div>
                  ) : templates.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-neutral-200 rounded-lg">
                      <Bookmark className="w-6 h-6 text-neutral-200 mx-auto mb-2" />
                      <p className="text-xs text-neutral-400">No saved templates yet.</p>
                      <p className="text-[10px] text-neutral-300 mt-1">Use the bookmark icon to save the current layout.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {templates.map(tpl => (
                        <div key={tpl.id} className="group relative border border-neutral-200 rounded-lg p-3 hover:border-neutral-400 hover:shadow-md transition-all">
                          <button onClick={() => loadTemplate(tpl)} className="text-left w-full">
                            <div className="w-full h-16 rounded-md mb-2 bg-neutral-100 flex items-center justify-center">
                              <span className="text-[10px] text-neutral-400 font-bold">{(tpl.blocks || []).length} blocks</span>
                            </div>
                            <p className="text-xs font-bold text-neutral-900">{tpl.name}</p>
                            {tpl.description && <p className="text-[9px] text-neutral-400 mt-0.5 line-clamp-2">{tpl.description}</p>}
                            <p className="text-[8px] text-neutral-300 mt-1">{tpl.category || 'general'}</p>
                          </button>
                          <button onClick={() => deleteTemplate(tpl.id)} className="absolute top-2 right-2 p-1 rounded bg-white shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50">
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ═══ SAVE AS TEMPLATE MODAL ═══ */}
        <AnimatePresence>
          {saveTemplateModal && (
            <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSaveTemplateModal(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-white shadow-2xl rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-serif text-neutral-900">Save as Template</h3>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold mt-0.5">Reuse this layout on future pages</p>
                  </div>
                  <button onClick={() => setSaveTemplateModal(false)} className="p-1.5 hover:bg-neutral-100 rounded-md transition-colors"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-5 space-y-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 mb-1 block">Template Name</label>
                    <input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="e.g. Landing Page Hero"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-md px-3 py-2 text-sm outline-none focus:border-neutral-900 transition-colors" autoFocus />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 mb-1 block">Description</label>
                    <input value={templateDesc} onChange={(e) => setTemplateDesc(e.target.value)} placeholder="Optional description..."
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-md px-3 py-2 text-xs outline-none focus:border-neutral-900 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 mb-1 block">Category</label>
                    <select value={templateCategory} onChange={(e) => setTemplateCategory(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-md px-3 py-2 text-xs outline-none focus:border-neutral-900 transition-colors">
                      <option value="general">General</option>
                      <option value="landing">Landing Page</option>
                      <option value="about">About / Info</option>
                      <option value="marketing">Marketing</option>
                      <option value="portfolio">Portfolio</option>
                    </select>
                  </div>
                  <p className="text-[10px] text-neutral-400">This will save the current {blocks.length} block{blocks.length !== 1 ? 's' : ''} as a reusable template.</p>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setSaveTemplateModal(false)} className="flex-1 py-2 border border-neutral-200 text-neutral-900 text-xs font-semibold rounded-md hover:bg-neutral-50 transition-colors">Cancel</button>
                    <button onClick={saveAsTemplate} className="flex-[2] bg-neutral-900 text-white py-2 text-xs font-semibold rounded-md hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1.5">
                      <Bookmark className="w-3 h-3" /> Save Template
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </DndProvider>
  );
};
