import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Check, ChevronRight, Eye, EyeOff, FileEdit, Globe2,
  LayoutTemplate, Loader2, MonitorUp, Save,
} from 'lucide-react';
import { useAdmin } from './AdminContext';
import { ImageField, MediaPickerModal, inputClass, labelClass } from './MediaPicker';
import {
  HomepageContent,
  HomepageImage,
  normalizeHomepageContent,
} from '../../content/homepage';

type SectionKey = keyof HomepageContent['sections'];

const sectionMeta: Array<{ key: SectionKey; label: string; description: string }> = [
  { key: 'hero', label: 'Hero carousel', description: 'Slides, videos and fallback images' },
  { key: 'catalogue', label: 'Product catalogue', description: 'Live product showcase heading' },
  { key: 'bespoke', label: 'Bespoke journey', description: 'Customer process introduction' },
  { key: 'categories', label: 'Curated categories', description: 'Product category collection' },
  { key: 'featured', label: 'Featured story', description: 'Editorial imagery and story copy' },
  { key: 'rooms', label: 'Shop by room', description: 'Room cards and featured images' },
  { key: 'moodGallery', label: 'Mood gallery', description: 'Six-image editorial gallery' },
  { key: 'trust', label: 'Trust pillars', description: 'Brand value section heading' },
  { key: 'services', label: 'Services', description: 'Services introduction and image' },
  { key: 'artisan', label: 'Artisan guild', description: 'Partner call-to-action content' },
  { key: 'newsletter', label: 'Newsletter', description: 'Signup call-to-action and background' },
];

export const HomepageTab = () => {
  const { homepageContent, homepagePublishedAt, media, handleSaveHomepage } = useAdmin();
  const [content, setContent] = useState<HomepageContent>(() => normalizeHomepageContent(homepageContent));
  const [activeSection, setActiveSection] = useState<SectionKey>('hero');
  const [saving, setSaving] = useState<'draft' | 'publish' | null>(null);
  const [dirty, setDirty] = useState(false);
  const [mediaPicker, setMediaPicker] = useState<((image: HomepageImage) => void) | null>(null);

  useEffect(() => {
    setContent(normalizeHomepageContent(homepageContent));
    setDirty(false);
  }, [homepageContent]);

  const section = content.sections[activeSection] as any;

  const replaceSection = (key: SectionKey, next: any) => {
    setContent((current) => ({ ...current, sections: { ...current.sections, [key]: next } }));
    setDirty(true);
  };

  const patchSection = (patch: Record<string, unknown>) => replaceSection(activeSection, { ...section, ...patch });

  const save = async (publish: boolean) => {
    setSaving(publish ? 'publish' : 'draft');
    const ok = await handleSaveHomepage(content, publish);
    if (ok) setDirty(false);
    setSaving(null);
  };

  const browseFor = (onSelect: (image: HomepageImage) => void) => setMediaPicker(() => onSelect);

  const renderCommonFields = () => (
    <>
      <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 p-4">
        <div>
          <p className="text-sm font-semibold text-neutral-900">Show this section</p>
          <p className="mt-0.5 text-[11px] text-neutral-500">Hidden sections remain saved and can be restored later.</p>
        </div>
        <button
          type="button"
          onClick={() => patchSection({ enabled: !section.enabled })}
          aria-label={section.enabled ? 'Hide section' : 'Show section'}
          className={`relative h-6 w-11 rounded-full transition-colors ${section.enabled ? 'bg-emerald-500' : 'bg-neutral-300'}`}
        >
          <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${section.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Eyebrow / section label</label>
          <input value={section.eyebrow || ''} onChange={(e) => patchSection({ eyebrow: e.target.value })} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Section title</label>
          <input value={section.title || ''} onChange={(e) => patchSection({ title: e.target.value })} className={inputClass} />
        </div>
      </div>
    </>
  );

  const renderEditor = () => {
    if (activeSection === 'hero') {
      return (
        <div className="space-y-5">
          {renderCommonFields()}
          <div className="space-y-4">
            {content.sections.hero.slides.map((slide, index) => (
              <div key={slide.id} className="rounded-lg border border-neutral-200 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div><p className="text-sm font-semibold text-neutral-900">Slide {index + 1}</p><p className="text-[10px] text-neutral-400">{slide.video ? 'Video with image fallback' : 'Featured image'}</p></div>
                  <button type="button" onClick={() => {
                    const slides = [...content.sections.hero.slides];
                    slides[index] = { ...slide, enabled: !slide.enabled };
                    replaceSection('hero', { ...content.sections.hero, slides });
                  }} className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${slide.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`}>
                    {slide.enabled ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}{slide.enabled ? 'Visible' : 'Hidden'}
                  </button>
                </div>
                <div className="grid gap-4 lg:grid-cols-[1fr_1.25fr]">
                  <ImageField label="Fallback / featured image" value={slide.image} onBrowse={() => browseFor((image) => {
                    const slides = [...content.sections.hero.slides]; slides[index] = { ...slide, image }; replaceSection('hero', { ...content.sections.hero, slides });
                  })} onChange={(image) => { const slides = [...content.sections.hero.slides]; slides[index] = { ...slide, image }; replaceSection('hero', { ...content.sections.hero, slides }); }} />
                  <div className="space-y-3">
                    {[['Title', 'title'], ['Subtitle', 'subtitle'], ['Tag', 'tag'], ['YouTube embed URL (optional)', 'video']].map(([label, field]) => (
                      <div key={field}><label className={labelClass}>{label}</label><input value={(slide as any)[field] || ''} onChange={(e) => { const slides = [...content.sections.hero.slides]; slides[index] = { ...slide, [field]: e.target.value }; replaceSection('hero', { ...content.sections.hero, slides }); }} className={inputClass} /></div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeSection === 'featured') {
      const featured = content.sections.featured;
      return <div className="space-y-5">{renderCommonFields()}<div><label className={labelClass}>Story copy</label><textarea value={featured.description} onChange={(e) => patchSection({ description: e.target.value })} rows={4} className={`${inputClass} resize-y`} /></div><div className="grid gap-4 lg:grid-cols-2"><ImageField label="Primary featured image" value={featured.image} onChange={(image) => patchSection({ image })} onBrowse={() => browseFor((image) => patchSection({ image }))} /><ImageField label="Detail image" value={featured.detailImage} onChange={(detailImage) => patchSection({ detailImage })} onBrowse={() => browseFor((detailImage) => patchSection({ detailImage }))} /></div></div>;
    }

    if (activeSection === 'rooms') {
      const rooms = content.sections.rooms;
      return <div className="space-y-5">{renderCommonFields()}<div><label className={labelClass}>Introduction</label><textarea value={rooms.description} onChange={(e) => patchSection({ description: e.target.value })} rows={3} className={`${inputClass} resize-y`} /></div><div className="grid gap-4 xl:grid-cols-2">{rooms.items.map((room, index) => <div key={room.slug} className="rounded-lg border border-neutral-200 p-4"><ImageField label={`${room.name} featured image`} value={room.image} onBrowse={() => browseFor((image) => { const items = [...rooms.items]; items[index] = { ...room, image }; patchSection({ items }); })} onChange={(image) => { const items = [...rooms.items]; items[index] = { ...room, image }; patchSection({ items }); }} /><div className="mt-3 grid gap-3 sm:grid-cols-2"><div><label className={labelClass}>Name</label><input value={room.name} onChange={(e) => { const items = [...rooms.items]; items[index] = { ...room, name: e.target.value }; patchSection({ items }); }} className={inputClass} /></div><div><label className={labelClass}>Room slug</label><input value={room.slug} onChange={(e) => { const items = [...rooms.items]; items[index] = { ...room, slug: e.target.value }; patchSection({ items }); }} className={inputClass} /></div><div className="sm:col-span-2"><label className={labelClass}>Products label</label><input value={room.pieces} onChange={(e) => { const items = [...rooms.items]; items[index] = { ...room, pieces: e.target.value }; patchSection({ items }); }} className={inputClass} /></div></div></div>)}</div></div>;
    }

    if (activeSection === 'moodGallery') {
      const gallery = content.sections.moodGallery;
      return <div className="space-y-5">{renderCommonFields()}<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{gallery.images.map((galleryImage, index) => <ImageField key={index} label={`Gallery image ${index + 1}`} value={galleryImage} onBrowse={() => browseFor((image) => { const images = [...gallery.images]; images[index] = image; patchSection({ images }); })} onChange={(image) => { const images = [...gallery.images]; images[index] = image; patchSection({ images }); }} />)}</div></div>;
    }

    if (['services', 'artisan', 'newsletter'].includes(activeSection)) {
      const visualSection = section as HomepageContent['sections']['services'];
      return <div className="space-y-5">{renderCommonFields()}<div><label className={labelClass}>Description</label><textarea value={visualSection.description || ''} onChange={(e) => patchSection({ description: e.target.value })} rows={4} className={`${inputClass} resize-y`} /></div><div className="max-w-xl"><ImageField label="Featured image" value={visualSection.image} onChange={(image) => patchSection({ image })} onBrowse={() => browseFor((image) => patchSection({ image }))} /></div></div>;
    }

    return <div className="space-y-5">{renderCommonFields()}<div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-xs leading-relaxed text-blue-700">This section uses live site data for its cards. Its visibility and heading can be managed here; individual records are managed from their own content type in the sidebar.</div></div>;
  };

  return (
    <motion.div key="homepage" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><h2 className="text-2xl font-serif text-neutral-900">Homepage</h2><p className="mt-0.5 text-xs text-neutral-500">Manage homepage sections, copy and featured images.</p></div>
        <div className="flex flex-wrap items-center gap-2">
          {dirty && <span className="mr-1 flex items-center gap-1 text-[10px] font-medium text-amber-600"><FileEdit className="h-3 w-3" /> Unsaved changes</span>}
          <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50"><Globe2 className="h-3.5 w-3.5" /> Preview</a>
          <button onClick={() => save(false)} disabled={!!saving} className="flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50">{saving === 'draft' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save draft</button>
          <button onClick={() => save(true)} disabled={!!saving} className="flex items-center gap-1.5 rounded-md bg-neutral-900 px-3 py-2 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-50">{saving === 'publish' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MonitorUp className="h-3.5 w-3.5" />} Publish</button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-[11px] text-neutral-500">
        <span className="flex items-center gap-1.5 font-semibold text-neutral-700"><Check className="h-3.5 w-3.5 text-emerald-500" /> Draft autosync is off</span>
        <span className="hidden h-3 w-px bg-neutral-200 sm:block" />
        <span>{homepagePublishedAt ? `Published ${new Date(homepagePublishedAt).toLocaleString()}` : 'Using the built-in homepage defaults'}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-lg border border-neutral-200 bg-white lg:self-start">
          <div className="border-b border-neutral-100 px-4 py-3"><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-600"><LayoutTemplate className="h-3.5 w-3.5" /> Homepage sections</p></div>
          <div className="divide-y divide-neutral-100">{sectionMeta.map((item) => {
            const enabled = content.sections[item.key].enabled;
            return <button key={item.key} type="button" onClick={() => setActiveSection(item.key)} className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${activeSection === item.key ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-50'}`}><span className={`h-2 w-2 flex-shrink-0 rounded-full ${enabled ? 'bg-emerald-500' : 'bg-neutral-300'}`} /><span className="min-w-0 flex-1"><span className="block text-xs font-semibold">{item.label}</span><span className={`mt-0.5 block truncate text-[10px] ${activeSection === item.key ? 'text-neutral-400' : 'text-neutral-400'}`}>{item.description}</span></span><ChevronRight className="h-3.5 w-3.5 opacity-40" /></button>;
          })}</div>
        </aside>

        <section className="rounded-lg border border-neutral-200 bg-white">
          <div className="border-b border-neutral-100 px-5 py-4"><h3 className="text-base font-semibold text-neutral-900">{sectionMeta.find((item) => item.key === activeSection)?.label}</h3><p className="mt-0.5 text-[11px] text-neutral-400">Changes become public only after you publish.</p></div>
          <div className="p-5">{renderEditor()}</div>
        </section>
      </div>

      {mediaPicker && <MediaPickerModal media={media} onSelect={mediaPicker} onClose={() => setMediaPicker(null)} />}
    </motion.div>
  );
};
