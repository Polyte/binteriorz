import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowDown, ArrowUp, Check, ChevronRight, Contact, FileEdit, Globe2,
  LayoutTemplate, Loader2, MonitorUp, Plus, Save, Trash2,
} from 'lucide-react';
import { useAdmin } from './AdminContext';
import { ImageField, MediaPickerModal, inputClass, labelClass } from './MediaPicker';
import { CompanyCard, CompanyContent, CompanyImage, normalizeCompanyContent } from '../../content/company';

type SectionKey = keyof CompanyContent['sections'];
type PanelKey = SectionKey | 'contact';

const panels: Array<{ key: PanelKey; label: string; description: string; page: string }> = [
  { key: 'contact', label: 'Contact & social', description: 'WhatsApp, email, Instagram, TikTok…', page: 'Site-wide' },
  { key: 'hero', label: 'Header & tagline', description: 'Name, strapline and banner image', page: 'About' },
  { key: 'about', label: 'Who we are', description: 'Introduction and two images', page: 'About' },
  { key: 'promise', label: 'Design promise', description: 'Numbered promise points', page: 'About' },
  { key: 'clients', label: 'Who we work with', description: 'Client types', page: 'About + Services' },
  { key: 'whyUs', label: 'Why choose us', description: 'Reasons clients choose you', page: 'About' },
  { key: 'portfolio', label: 'Project portfolio', description: 'Project photos and captions', page: 'About' },
  { key: 'vision', label: 'Vision & mission', description: 'Two statements over an image', page: 'About' },
  { key: 'values', label: 'Values', description: 'Value cards', page: 'About' },
  { key: 'services', label: 'Services', description: 'Service cards with images', page: 'Services' },
  { key: 'experience', label: 'The experience', description: 'Step-by-step process', page: 'Services' },
  { key: 'cta', label: 'Call to action', description: 'Closing banner on both pages', page: 'About + Services' },
];

const textareaClass = `${inputClass} resize-y`;

const move = <T,>(list: T[], index: number, delta: number) => {
  const next = [...list];
  const target = index + delta;
  if (target < 0 || target >= next.length) return next;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
};

const RowControls = ({ index, count, onMove, onRemove }: { index: number; count: number; onMove: (delta: number) => void; onRemove: () => void }) => (
  <div className="flex flex-shrink-0 items-center gap-1">
    <button type="button" onClick={() => onMove(-1)} disabled={index === 0} aria-label="Move up" className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-30"><ArrowUp className="h-3.5 w-3.5" /></button>
    <button type="button" onClick={() => onMove(1)} disabled={index === count - 1} aria-label="Move down" className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-30"><ArrowDown className="h-3.5 w-3.5" /></button>
    <button type="button" onClick={onRemove} aria-label="Remove" className="rounded p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
  </div>
);

const TextList = ({ label, items, onChange, addLabel, rows = 2 }: { label: string; items: string[]; onChange: (items: string[]) => void; addLabel: string; rows?: number }) => (
  <div>
    <label className={labelClass}>{label}</label>
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-start gap-2">
          <span className="mt-2 w-6 flex-shrink-0 text-right text-[11px] tabular-nums text-neutral-400">{index + 1}.</span>
          <textarea value={item} rows={rows} onChange={(e) => onChange(items.map((value, i) => (i === index ? e.target.value : value)))} className={textareaClass} />
          <RowControls index={index} count={items.length} onMove={(delta) => onChange(move(items, index, delta))} onRemove={() => onChange(items.filter((_, i) => i !== index))} />
        </div>
      ))}
    </div>
    <button type="button" onClick={() => onChange([...items, ''])} className="mt-3 flex items-center gap-1.5 rounded-md border border-dashed border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-600 hover:border-neutral-900 hover:text-neutral-900"><Plus className="h-3.5 w-3.5" /> {addLabel}</button>
  </div>
);

const CardList = ({ label, items, onChange, withImage, addLabel, browseFor }: { label: string; items: CompanyCard[]; onChange: (items: CompanyCard[]) => void; withImage: boolean; addLabel: string; browseFor: (onSelect: (image: CompanyImage) => void) => void }) => {
  const update = (index: number, patch: Partial<CompanyCard>) => onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className={`grid gap-4 ${withImage ? 'xl:grid-cols-2' : 'md:grid-cols-2'}`}>
        {items.map((item, index) => (
          <div key={item.id} className="rounded-lg border border-neutral-200 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-neutral-900">{String(index + 1).padStart(2, '0')} · {item.title || 'Untitled'}</span>
              <RowControls index={index} count={items.length} onMove={(delta) => onChange(move(items, index, delta))} onRemove={() => onChange(items.filter((_, i) => i !== index))} />
            </div>
            <div className={withImage ? 'grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]' : ''}>
              {withImage && <ImageField compact label="Image" value={item.image} onChange={(image) => update(index, { image })} onBrowse={() => browseFor((image) => update(index, { image }))} />}
              <div className="space-y-3">
                <div><label className={labelClass}>Title</label><input value={item.title} onChange={(e) => update(index, { title: e.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>Description</label><textarea value={item.text} rows={withImage ? 5 : 3} onChange={(e) => update(index, { text: e.target.value })} className={textareaClass} /></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => onChange([...items, { id: crypto.randomUUID(), title: '', text: '', ...(withImage ? { image: { url: '', alt: '' } } : {}) }])} className="mt-3 flex items-center gap-1.5 rounded-md border border-dashed border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-600 hover:border-neutral-900 hover:text-neutral-900"><Plus className="h-3.5 w-3.5" /> {addLabel}</button>
    </div>
  );
};

const contactFields: Array<{ key: keyof CompanyContent['contact']; label: string; placeholder: string; hint?: string }> = [
  { key: 'whatsapp', label: 'WhatsApp number', placeholder: '082 123 4567', hint: 'Turns on the floating WhatsApp button.' },
  { key: 'phone', label: 'Phone', placeholder: '011 123 4567' },
  { key: 'email', label: 'Email', placeholder: 'hello@yourdomain.co.za' },
  { key: 'address', label: 'Studio address', placeholder: 'Street, suburb, city' },
  { key: 'instagram', label: 'Instagram', placeholder: '@handle or full link' },
  { key: 'tiktok', label: 'TikTok', placeholder: '@handle or full link' },
  { key: 'facebook', label: 'Facebook', placeholder: 'Page name or full link' },
];

export const CompanyTab = () => {
  const { companyContent, companyPublishedAt, media, handleSaveCompany } = useAdmin();
  const [content, setContent] = useState<CompanyContent>(() => normalizeCompanyContent(companyContent));
  const [active, setActive] = useState<PanelKey>('contact');
  const [saving, setSaving] = useState<'draft' | 'publish' | null>(null);
  const [dirty, setDirty] = useState(false);
  const [mediaPicker, setMediaPicker] = useState<((image: CompanyImage) => void) | null>(null);

  useEffect(() => {
    setContent(normalizeCompanyContent(companyContent));
    setDirty(false);
  }, [companyContent]);

  const save = async (publish: boolean) => {
    setSaving(publish ? 'publish' : 'draft');
    const ok = await handleSaveCompany({ ...content, updatedAt: new Date().toISOString() }, publish);
    if (ok) setDirty(false);
    setSaving(null);
  };

  const browseFor = (onSelect: (image: CompanyImage) => void) => setMediaPicker(() => onSelect);
  const patchContact = (patch: Partial<CompanyContent['contact']>) => { setContent((c) => ({ ...c, contact: { ...c.contact, ...patch } })); setDirty(true); };

  const renderSection = (key: SectionKey) => {
    const section = content.sections[key] as any;
    const patch = (next: Record<string, unknown>) => { setContent((c) => ({ ...c, sections: { ...c.sections, [key]: { ...c.sections[key], ...next } } })); setDirty(true); };
    const field = (name: string, label: string, rows = 0) => (
      <div key={name}>
        <label className={labelClass}>{label}</label>
        {rows ? <textarea value={section[name] || ''} rows={rows} onChange={(e) => patch({ [name]: e.target.value })} className={textareaClass} /> : <input value={section[name] || ''} onChange={(e) => patch({ [name]: e.target.value })} className={inputClass} />}
      </div>
    );
    const image = (name: string, label: string) => <ImageField label={label} value={section[name]} onChange={(img) => patch({ [name]: img })} onBrowse={() => browseFor((img) => patch({ [name]: img }))} />;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <div><p className="text-sm font-semibold text-neutral-900">Show this section</p><p className="mt-0.5 text-[11px] text-neutral-500">Hidden sections keep their content and can be shown again later.</p></div>
          <button type="button" onClick={() => patch({ enabled: !section.enabled })} aria-label={section.enabled ? 'Hide section' : 'Show section'} className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${section.enabled ? 'bg-emerald-500' : 'bg-neutral-300'}`}>
            <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${section.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">{field('eyebrow', 'Small label above the heading')}{field('title', 'Heading')}</div>

        {key === 'hero' && <div className="grid gap-6 lg:grid-cols-2"><div className="space-y-4">{field('tagline', 'Tagline', 3)}{field('intro', 'Extra introduction (optional)', 3)}</div>{image('image', 'Banner image')}</div>}
        {key === 'about' && <><TextList label="Paragraphs" items={section.paragraphs} rows={4} addLabel="Add paragraph" onChange={(paragraphs) => patch({ paragraphs })} /><div className="grid gap-6 lg:grid-cols-2">{image('image', 'Main image')}{image('secondaryImage', 'Overlapping detail image')}</div></>}
        {key === 'promise' && <><div className="grid gap-6 lg:grid-cols-2"><div className="space-y-4">{field('intro', 'Introduction', 3)}</div>{image('image', 'Image')}</div><TextList label="Promise points" items={section.points} addLabel="Add point" onChange={(points) => patch({ points })} /></>}
        {key === 'services' && <>{field('intro', 'Introduction', 3)}<CardList label="Services" items={section.items} withImage addLabel="Add service" browseFor={browseFor} onChange={(items) => patch({ items })} /></>}
        {key === 'experience' && <><div className="grid gap-6 lg:grid-cols-2"><div className="space-y-4">{field('intro', 'Introduction', 6)}</div>{image('image', 'Image')}</div><TextList label="Steps" items={section.steps} rows={1} addLabel="Add step" onChange={(steps) => patch({ steps })} /></>}
        {(key === 'clients' || key === 'whyUs') && <TextList label="List items" items={section.items} rows={1} addLabel="Add item" onChange={(items) => patch({ items })} />}
        {key === 'portfolio' && <>{field('intro', 'Introduction', 3)}<CardList label="Projects" items={section.items} withImage addLabel="Add project" browseFor={browseFor} onChange={(items) => patch({ items })} /></>}
        {key === 'vision' && <div className="grid gap-6 lg:grid-cols-2"><div className="space-y-4">{field('vision', 'Vision', 4)}{field('mission', 'Mission', 4)}</div>{image('image', 'Background image')}</div>}
        {key === 'values' && <CardList label="Values" items={section.items} withImage={false} addLabel="Add value" browseFor={browseFor} onChange={(items) => patch({ items })} />}
        {key === 'cta' && <div className="grid gap-6 lg:grid-cols-2"><div className="space-y-4">{field('text', 'Message', 5)}</div>{image('image', 'Background image')}</div>}
      </div>
    );
  };

  const activePanel = panels.find((panel) => panel.key === active)!;

  return (
    <motion.div key="company" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><h2 className="text-2xl font-serif text-neutral-900">Company Profile</h2><p className="mt-0.5 text-xs text-neutral-500">Edit the About and Services pages, plus contact details used across the site.</p></div>
        <div className="flex flex-wrap items-center gap-2">
          {dirty && <span className="mr-1 flex items-center gap-1 text-[10px] font-medium text-amber-600"><FileEdit className="h-3 w-3" /> Unsaved changes</span>}
          <a href="/about" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50"><Globe2 className="h-3.5 w-3.5" /> About</a>
          <a href="/services" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50"><Globe2 className="h-3.5 w-3.5" /> Services</a>
          <button onClick={() => save(false)} disabled={!!saving} className="flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50">{saving === 'draft' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save draft</button>
          <button onClick={() => save(true)} disabled={!!saving} className="flex items-center gap-1.5 rounded-md bg-neutral-900 px-3 py-2 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-50">{saving === 'publish' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MonitorUp className="h-3.5 w-3.5" />} Publish</button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-[11px] text-neutral-500">
        <span className="flex items-center gap-1.5 font-semibold text-neutral-700"><Check className="h-3.5 w-3.5 text-emerald-500" /> {companyPublishedAt ? `Published ${new Date(companyPublishedAt).toLocaleString()}` : 'Showing the built-in company profile'}</span>
        <span className="hidden h-3 w-px bg-neutral-200 sm:block" />
        <span>Save draft keeps your edits private. Publish makes them live.</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-lg border border-neutral-200 bg-white lg:sticky lg:top-4 lg:self-start">
          <div className="border-b border-neutral-100 px-4 py-3"><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-600"><LayoutTemplate className="h-3.5 w-3.5" /> Sections</p></div>
          <div className="flex gap-1 overflow-x-auto p-2 lg:block lg:divide-y lg:divide-neutral-100 lg:p-0">
            {panels.map((panel) => {
              const enabled = panel.key === 'contact' ? true : content.sections[panel.key].enabled;
              const selected = active === panel.key;
              return (
                <button key={panel.key} type="button" onClick={() => setActive(panel.key)} className={`flex flex-shrink-0 items-center gap-3 rounded-md px-3 py-2 text-left transition-colors lg:w-full lg:rounded-none lg:px-4 lg:py-3 ${selected ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-50'}`}>
                  {panel.key === 'contact' ? <Contact className="h-3.5 w-3.5 flex-shrink-0" /> : <span className={`h-2 w-2 flex-shrink-0 rounded-full ${enabled ? 'bg-emerald-500' : 'bg-neutral-300'}`} />}
                  <span className="min-w-0 flex-1">
                    <span className="block whitespace-nowrap text-xs font-semibold">{panel.label}</span>
                    <span className="mt-0.5 hidden truncate text-[10px] text-neutral-400 lg:block">{panel.page} · {panel.description}</span>
                  </span>
                  <ChevronRight className="hidden h-3.5 w-3.5 opacity-40 lg:block" />
                </button>
              );
            })}
          </div>
        </aside>

        <section className="rounded-lg border border-neutral-200 bg-white">
          <div className="border-b border-neutral-100 px-5 py-4">
            <h3 className="text-base font-semibold text-neutral-900">{activePanel.label}</h3>
            <p className="mt-0.5 text-[11px] text-neutral-400">Appears on: {activePanel.page}</p>
          </div>
          <div className="p-5">
            {active === 'contact' ? (
              <div className="space-y-5">
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-xs leading-relaxed text-blue-700">Used in the footer, Contact page, About and Services pages. Anything left blank is hidden on the website.</div>
                <div className="grid gap-4 md:grid-cols-2">
                  {contactFields.map(({ key, label, placeholder, hint }) => (
                    <div key={key}>
                      <label className={labelClass}>{label}</label>
                      <input value={content.contact[key]} placeholder={placeholder} onChange={(e) => patchContact({ [key]: e.target.value })} className={inputClass} />
                      {hint && <p className="mt-1 text-[10px] text-neutral-400">{hint}</p>}
                    </div>
                  ))}
                </div>
              </div>
            ) : renderSection(active)}
          </div>
        </section>
      </div>

      {mediaPicker && <MediaPickerModal media={media} onSelect={mediaPicker} onClose={() => setMediaPicker(null)} />}
    </motion.div>
  );
};
