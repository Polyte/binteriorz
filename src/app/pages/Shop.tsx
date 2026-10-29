import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronDown, LayoutGrid, Rows3, Search, SlidersHorizontal, X } from 'lucide-react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { ProductCard } from '../components/ProductCard';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { CATEGORY_PAGES, categorySlug } from '../content/landing';

interface ShopProps {
  products: any[];
  onAddToCart: (p: any) => void;
  onToggleWishlist: (p: any) => void;
  onQuickView: (p: any) => void;
  wishlistItems: any[];
  loading: boolean;
}

type Facet = 'category' | 'room' | 'material' | 'colour' | 'price';

const container = 'mx-auto max-w-[1480px] px-6 sm:px-8 lg:px-12';
const PAGE_SIZE = 12;

// Catalogue colours and materials are free text; group them into a few families shoppers recognise.
const COLOUR_FAMILIES: { name: string; swatch: string; match: RegExp }[] = [
  { name: 'White & Cream', swatch: '#f4efe6', match: /white|cream|off-white|ivory/i },
  { name: 'Beige & Sand', swatch: '#d8c3a5', match: /beige|sand|taupe|natural(?! wood)/i },
  { name: 'Grey', swatch: '#9a9a96', match: /gr[ae]y|charcoal|smoked/i },
  { name: 'Black', swatch: '#1f1d1b', match: /black/i },
  { name: 'Brown & Wood', swatch: '#7a5136', match: /brown|wood|walnut|caramel|tan\b|leather/i },
  { name: 'Gold & Brass', swatch: '#c9a24a', match: /gold|brass|mustard/i },
  { name: 'Green', swatch: '#4f6b4a', match: /green|sage/i },
  { name: 'Blue', swatch: '#4b6584', match: /blue/i },
  { name: 'Multicolour', swatch: 'conic-gradient(#c9a24a, #7a5136, #4f6b4a, #4b6584, #c9a24a)', match: /multi/i },
];

const MATERIAL_FAMILIES: { name: string; match: RegExp }[] = [
  { name: 'Fabric & Upholstery', match: /fabric|velvet|suede|boucle/i },
  { name: 'Wood', match: /wood|walnut|oak/i },
  { name: 'Metal & Brass', match: /metal|brass|iron|steel/i },
  { name: 'Glass', match: /glass/i },
  { name: 'Leather', match: /leather/i },
  { name: 'Wool', match: /wool/i },
  { name: 'Rope & Natural Fibre', match: /rope|rattan|jute|cane/i },
];

const PRICE_BANDS = [
  { id: 'under-1k', label: 'Under R1 000', min: 0, max: 999 },
  { id: '1k-5k', label: 'R1 000 – R5 000', min: 1000, max: 5000 },
  { id: '5k-15k', label: 'R5 000 – R15 000', min: 5001, max: 15000 },
  { id: '15k-30k', label: 'R15 000 – R30 000', min: 15001, max: 30000 },
  { id: '30k-plus', label: 'R30 000 and above', min: 30001, max: Infinity },
];

const ROOM_LABELS: Record<string, string> = {
  'living-room': 'Living Room',
  bedroom: 'Bedroom',
  'dining-room': 'Dining Room',
  'home-office': 'Home Office',
  entryway: 'Entryway',
};

const colourFamilies = (product: any) => COLOUR_FAMILIES.filter((family) => family.match.test(product.color || '')).map((family) => family.name);
const materialFamilies = (product: any) => MATERIAL_FAMILIES.filter((family) => family.match.test(`${product.material || ''} ${product.materialFinish || ''}`)).map((family) => family.name);
const priceBand = (product: any) => PRICE_BANDS.find((band) => product.price >= band.min && product.price <= band.max)?.id;

const toggle = (list: string[], value: string) => (list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);

/** Compact, vintage-styled header: parchment tones, gilt rules and arched frames around showroom antiques. */
const ShopHeader = ({ total, categories, heading, intro, related }: { total: number; categories: number; heading?: string; intro?: string; related?: { label: string; to: string } }) => (
  <section className="relative overflow-hidden border-b border-[#c8b48a]/50 bg-[#efe6d4] pt-48 md:pt-40">
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-multiply"
      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 240 240' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.45 0 0 0 0 0.35 0 0 0 0 0.2 0 0 0 0.35 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)'/%3E%3C/svg%3E\")" }}
    />
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(92,64,28,0.18)_100%)]" />

    <div className={`${container} relative grid items-end gap-10 pb-10 md:pb-12 lg:grid-cols-12`}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="lg:col-span-6 lg:pb-6">
        <div className="mb-5 flex items-center gap-3 text-[#8a6a2f]">
          <span className="h-px w-10 bg-[#b8964a]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.4em]">B Interior Designz · Alberton</span>
        </div>
        <h1 className="font-serif text-5xl leading-[0.95] tracking-tight text-[#2b2116] md:text-7xl">
          {heading ? heading : <>The <em className="font-normal italic text-[#8a6a2f]">Collection</em></>}
        </h1>
        <div className="my-6 flex items-center gap-3 text-[#b8964a]" aria-hidden="true">
          <span className="h-px w-16 bg-current" />
          <span className="text-xs">✦</span>
          <span className="h-px w-16 bg-current" />
        </div>
        <p className="max-w-lg text-base font-light leading-relaxed text-[#4a3c2b] md:text-lg">
          {intro || 'Timeless furniture, lighting, textiles and décor, chosen piece by piece for homes with character.'}
        </p>
        {related && <Link to={related.to} className="mt-5 inline-block border-b border-[#8a6a2f] pb-1 text-[10px] font-bold uppercase tracking-[0.25em] text-[#8a6a2f] hover:text-[#2b2116]">{related.label}</Link>}
        <dl className="mt-8 flex gap-10 text-[#2b2116]">
          <div><dt className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#8a6a2f]">Pieces</dt><dd className="mt-1 font-serif text-3xl tabular-nums">{total}</dd></div>
          <div><dt className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#8a6a2f]">Categories</dt><dd className="mt-1 font-serif text-3xl tabular-nums">{categories}</dd></div>
        </dl>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="hidden grid-cols-[1fr_1.25fr_1fr] items-end gap-4 sm:grid lg:col-span-6">
        {[
          { src: '/product-images/bi-209.jpg', alt: 'Vintage bicycle décor piece', className: 'aspect-[3/4]' },
          { src: '/product-images/bi-226.jpg', alt: 'Antique-style Roman numeral wall clock', className: 'aspect-[3/4.4]' },
          { src: '/product-images/bi-111.jpg', alt: 'Tan leather bench with brass buckles', className: 'aspect-[3/4]' },
        ].map((image) => (
          <figure key={image.src} className="rounded-t-full border border-[#b8964a]/70 bg-[#f6efe1] p-1.5 shadow-[0_24px_40px_-28px_rgba(60,40,15,.8)]">
            <div className={`${image.className} overflow-hidden rounded-t-full`}>
              <ImageWithFallback src={image.src} alt={image.alt} loading="eager" sizes="(min-width: 1024px) 240px, 30vw" className="h-full w-full object-cover sepia-[.3] saturate-[.85] contrast-[1.04]" />
            </div>
          </figure>
        ))}
      </motion.div>
    </div>
  </section>
);

const FilterGroup = ({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-neutral-200 py-5">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between text-left" aria-expanded={open}>
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-900">{title}</span>
        <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
};

const CheckRow = ({ label, count, checked, onChange, swatch }: { label: string; count: number; checked: boolean; onChange: () => void; swatch?: string }) => (
  <button type="button" onClick={onChange} disabled={!checked && count === 0} className="group flex w-full items-center gap-3 py-1.5 text-left disabled:opacity-35">
    <span className={`grid h-4 w-4 flex-shrink-0 place-items-center border transition-colors ${checked ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-300 group-hover:border-neutral-900'}`}>
      {checked && <Check className="h-3 w-3" />}
    </span>
    {swatch && <span className="h-4 w-4 flex-shrink-0 rounded-full border border-black/10" style={{ background: swatch }} />}
    <span className={`flex-1 text-sm ${checked ? 'font-medium text-neutral-900' : 'text-neutral-600'}`}>{label}</span>
    <span className="text-xs tabular-nums text-neutral-400">{count}</span>
  </button>
);

export const Shop = ({ products, onAddToCart, onToggleWishlist, onQuickView, wishlistItems, loading }: ShopProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { category: categoryParam } = useParams<{ category: string }>();
  const categoryPage = categoryParam ? CATEGORY_PAGES[categoryParam] : undefined;
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [rooms, setRooms] = useState<string[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);
  const [colours, setColours] = useState<string[]>([]);
  const [prices, setPrices] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('featured');
  const [dense, setDense] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Keep filters in sync with links from the mega menu and room navigator.
  useEffect(() => {
    const room = searchParams.get('room');
    const category = categoryPage?.name || searchParams.get('category');
    setRooms(room ? [room] : []);
    setCategories(category && category !== 'All' ? [category] : []);
  }, [searchParams, categoryPage]);

  const matches = (product: any, skip?: Facet) => {
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      const haystack = [product.name, product.category, product.material, product.color, ...(product.tags || [])].join(' ').toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    if (skip !== 'category' && categories.length && !categories.includes(product.category)) return false;
    if (skip !== 'room' && rooms.length && !rooms.some((room) => (product.rooms || []).includes(room))) return false;
    if (skip !== 'material' && materials.length && !materialFamilies(product).some((family) => materials.includes(family))) return false;
    if (skip !== 'colour' && colours.length && !colourFamilies(product).some((family) => colours.includes(family))) return false;
    if (skip !== 'price' && prices.length && !prices.includes(priceBand(product) || '')) return false;
    return true;
  };

  // Each count reflects every other active filter, so shoppers never pick an option that returns nothing.
  const facetCounts = useMemo(() => {
    const counts: Record<Facet, Map<string, number>> = { category: new Map(), room: new Map(), material: new Map(), colour: new Map(), price: new Map() };
    const add = (facet: Facet, key: string) => counts[facet].set(key, (counts[facet].get(key) || 0) + 1);
    for (const product of products) {
      if (matches(product, 'category')) add('category', product.category);
      if (matches(product, 'room')) (product.rooms || []).forEach((room: string) => add('room', room));
      if (matches(product, 'material')) materialFamilies(product).forEach((family) => add('material', family));
      if (matches(product, 'colour')) colourFamilies(product).forEach((family) => add('colour', family));
      if (matches(product, 'price')) { const band = priceBand(product); if (band) add('price', band); }
    }
    return counts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, searchQuery, categories, rooms, materials, colours, prices]);

  const allCategories = useMemo(() => {
    const byName = new Map<string, { name: string; image: string; total: number }>();
    for (const product of products) {
      const entry = byName.get(product.category) || { name: product.category, image: product.image_url || product.image, total: 0 };
      entry.total += 1;
      byName.set(product.category, entry);
    }
    return [...byName.values()].sort((a, b) => b.total - a.total);
  }, [products]);

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => matches(product));
    return [...filtered].sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, searchQuery, categories, rooms, materials, colours, prices, sortBy]);

  // Render the catalogue in batches; more pieces load as the shopper nears the end of the list.
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [filteredProducts]);
  const hasMore = visibleCount < filteredProducts.length;
  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel || !hasMore) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisibleCount((count) => count + PAGE_SIZE);
    }, { rootMargin: '600px 0px' });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, visibleCount]);


  const clearAll = () => {
    setCategories([]); setRooms([]); setMaterials([]); setColours([]); setPrices([]); setSearchQuery('');
    if (categoryParam) navigate('/shop'); else setSearchParams(new URLSearchParams(), { replace: true });
  };

  const activeChips = [
    ...categories.map((value) => ({ facet: 'category' as Facet, value, label: value })),
    ...rooms.map((value) => ({ facet: 'room' as Facet, value, label: ROOM_LABELS[value] || value })),
    ...materials.map((value) => ({ facet: 'material' as Facet, value, label: value })),
    ...colours.map((value) => ({ facet: 'colour' as Facet, value, label: value })),
    ...prices.map((value) => ({ facet: 'price' as Facet, value, label: PRICE_BANDS.find((band) => band.id === value)?.label || value })),
  ];

  const removeChip = (facet: Facet, value: string) => {
    if (facet === 'category' && categoryPage?.name === value) { navigate('/shop'); return; }
    if (facet === 'category') setCategories((list) => list.filter((item) => item !== value));
    if (facet === 'room') setRooms((list) => list.filter((item) => item !== value));
    if (facet === 'material') setMaterials((list) => list.filter((item) => item !== value));
    if (facet === 'colour') setColours((list) => list.filter((item) => item !== value));
    if (facet === 'price') setPrices((list) => list.filter((item) => item !== value));
  };

  const filterPanel = (
    <div>
      <FilterGroup title="Category">
        {allCategories.map(({ name }) => (
          <CheckRow key={name} label={name} count={facetCounts.category.get(name) || 0} checked={categories.includes(name)} onChange={() => setCategories((list) => toggle(list, name))} />
        ))}
      </FilterGroup>
      <FilterGroup title="Room">
        {Object.entries(ROOM_LABELS).map(([id, label]) => (
          <CheckRow key={id} label={label} count={facetCounts.room.get(id) || 0} checked={rooms.includes(id)} onChange={() => setRooms((list) => toggle(list, id))} />
        ))}
      </FilterGroup>
      <FilterGroup title="Price">
        {PRICE_BANDS.map((band) => (
          <CheckRow key={band.id} label={band.label} count={facetCounts.price.get(band.id) || 0} checked={prices.includes(band.id)} onChange={() => setPrices((list) => toggle(list, band.id))} />
        ))}
      </FilterGroup>
      <FilterGroup title="Colour">
        {COLOUR_FAMILIES.map((family) => (
          <CheckRow key={family.name} label={family.name} swatch={family.swatch} count={facetCounts.colour.get(family.name) || 0} checked={colours.includes(family.name)} onChange={() => setColours((list) => toggle(list, family.name))} />
        ))}
      </FilterGroup>
      <FilterGroup title="Material" defaultOpen={false}>
        {MATERIAL_FAMILIES.map((family) => (
          <CheckRow key={family.name} label={family.name} count={facetCounts.material.get(family.name) || 0} checked={materials.includes(family.name)} onChange={() => setMaterials((list) => toggle(list, family.name))} />
        ))}
      </FilterGroup>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative min-h-screen bg-[#fbf9f5] pb-24">
      <ShopHeader
        total={categoryPage ? products.filter((product) => product.category === categoryPage.name).length : products.length}
        categories={allCategories.length}
        heading={categoryPage?.name}
        intro={categoryPage?.intro}
        related={categoryPage?.relatedService ? { label: 'About our related service', to: `/services/${categoryPage.relatedService}` } : undefined}
      />

      {/* Category strip */}
      <div className="border-b border-neutral-200 bg-white/70">
        <div className={`${container} flex gap-3 overflow-x-auto py-5 [scrollbar-width:none]`}>
          <Link to="/shop" className={`flex flex-shrink-0 items-center gap-3 rounded-full border py-1.5 pl-1.5 pr-5 transition-colors ${categories.length === 0 ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-900'}`}>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#efe6d4] font-serif text-sm text-[#8a6a2f]">All</span>
            <span className="text-xs font-medium">Everything</span>
          </Link>
          {allCategories.map((category) => {
            const active = categories.length === 1 && categories[0] === category.name;
            return (
              <Link key={category.name} to={active || !CATEGORY_PAGES[categorySlug(category.name)] ? '/shop' : `/shop/${categorySlug(category.name)}`} aria-current={active ? 'page' : undefined} className={`flex flex-shrink-0 items-center gap-3 rounded-full border py-1.5 pl-1.5 pr-5 transition-colors ${active ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-900'}`}>
                <ImageWithFallback src={category.image} alt="" sizes="40px" className="h-9 w-9 rounded-full object-cover" />
                <span className="text-xs font-medium">{category.name}</span>
                <span className={`text-[10px] tabular-nums ${active ? 'text-white/60' : 'text-neutral-400'}`}>{category.total}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className={`${container} mt-10 grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)] xl:gap-14`}>
        {/* Desktop filters */}
        <aside className="hidden lg:block">
          <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 [scrollbar-width:thin]">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
              <span className="font-serif text-xl text-neutral-900">Refine</span>
              {activeChips.length > 0 && <button type="button" onClick={clearAll} className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 underline underline-offset-4 hover:text-neutral-900">Clear all</button>}
            </div>
            {filterPanel}
          </div>
        </aside>

        <div className="min-w-0">
          {/* Toolbar */}
          <div className="flex flex-col gap-4 border-b border-neutral-200 pb-5 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setIsDrawerOpen(true)} className="flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] lg:hidden">
                <SlidersHorizontal className="h-4 w-4" /> Filters{activeChips.length > 0 && ` (${activeChips.length})`}
              </button>
              <h2 className="font-serif text-2xl text-neutral-900"><span className="tabular-nums">{filteredProducts.length}</span> <span className="text-neutral-500">{filteredProducts.length === 1 ? 'piece' : 'pieces'}</span></h2>
            </div>
            <div className="flex flex-1 flex-col gap-3 sm:flex-row md:justify-end">
              <label className="relative block min-w-0 flex-1 md:max-w-xs">
                <span className="sr-only">Search products</span>
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input type="search" placeholder="Search the collection" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full rounded-full border border-neutral-200 bg-white py-2.5 pl-11 pr-5 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-900" />
              </label>
              <div className="flex gap-3">
                <label className="relative block flex-1 sm:w-48">
                  <span className="sr-only">Sort products</span>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="h-full w-full appearance-none rounded-full border border-neutral-200 bg-white py-2.5 pl-5 pr-10 text-[10px] font-bold uppercase tracking-[0.15em] outline-none focus:border-neutral-900">
                    <option value="featured">Featured first</option>
                    <option value="price-low">Price: low to high</option>
                    <option value="price-high">Price: high to low</option>
                    <option value="name">Name: A–Z</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
                </label>
                <div className="hidden overflow-hidden rounded-full border border-neutral-200 bg-white xl:flex">
                  <button type="button" onClick={() => setDense(false)} aria-label="Larger cards" aria-pressed={!dense} className={`px-3 ${!dense ? 'bg-neutral-900 text-white' : 'text-neutral-500'}`}><Rows3 className="h-4 w-4" /></button>
                  <button type="button" onClick={() => setDense(true)} aria-label="More cards per row" aria-pressed={dense} className={`px-3 ${dense ? 'bg-neutral-900 text-white' : 'text-neutral-500'}`}><LayoutGrid className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          </div>

          {activeChips.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {activeChips.map((chip) => (
                <button key={`${chip.facet}-${chip.value}`} type="button" onClick={() => removeChip(chip.facet, chip.value)} className="flex items-center gap-2 rounded-full bg-[#efe6d4] px-3 py-1.5 text-xs text-[#4a3c2b] transition-colors hover:bg-[#e4d6bb]">
                  {chip.label} <X className="h-3 w-3" />
                </button>
              ))}
              <button type="button" onClick={clearAll} className="px-2 text-xs text-neutral-500 underline underline-offset-4 hover:text-neutral-900">Clear all</button>
            </div>
          )}

          <div className={`mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 ${dense ? 'xl:grid-cols-4' : 'xl:grid-cols-3'}`}>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-[4/5] animate-pulse rounded-[1.4rem] bg-neutral-100" />
                  <div className="h-4 w-2/3 animate-pulse bg-neutral-100" />
                  <div className="h-4 w-1/3 animate-pulse bg-neutral-100" />
                </div>
              ))
            ) : filteredProducts.length > 0 ? (
              filteredProducts.slice(0, visibleCount).map((product, idx) => (
                <ProductCard
                  key={product.id}
                  {...product}
                  eager={idx < 3}
                  onAddToCart={() => onAddToCart(product)}
                  onToggleWishlist={() => onToggleWishlist(product)}
                  onQuickView={() => onQuickView(product)}
                  isWishlisted={wishlistItems.some((item) => item.id === product.id)}
                />
              ))
            ) : (
              <div className="col-span-full py-24 text-center">
                <p className="font-serif text-2xl italic tracking-tight text-neutral-400">No pieces match your current selection.</p>
                <button type="button" onClick={clearAll} className="mt-8 text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-900 underline underline-offset-8">Reset all filters</button>
              </div>
            )}
          </div>

          {!loading && hasMore && (
            <div ref={loadMoreRef} className="mt-14 flex flex-col items-center gap-3">
              <p className="text-xs text-neutral-500">Showing {Math.min(visibleCount, filteredProducts.length)} of {filteredProducts.length}</p>
              <button type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)} className="rounded-full border border-neutral-900 px-8 py-3 text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-900 transition hover:bg-neutral-900 hover:text-white">Show more</button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDrawerOpen(false)} className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 220 }} className="fixed bottom-0 right-0 top-0 z-[120] flex w-full max-w-sm flex-col bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-5">
                <h2 className="font-serif text-2xl">Refine</h2>
                <button type="button" onClick={() => setIsDrawerOpen(false)} aria-label="Close filters" className="grid h-10 w-10 place-items-center rounded-full bg-neutral-100"><X className="h-5 w-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto px-6">{filterPanel}</div>
              <div className="flex gap-3 border-t border-neutral-200 p-4">
                <button type="button" onClick={clearAll} className="border border-neutral-200 px-5 py-4 text-[10px] font-bold uppercase tracking-[0.2em]">Reset</button>
                <button type="button" onClick={() => setIsDrawerOpen(false)} className="flex-1 bg-neutral-900 py-4 text-[10px] font-bold uppercase tracking-[0.25em] text-white">Show {filteredProducts.length} pieces</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
