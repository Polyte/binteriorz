import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ArrowRight, Package, FileText, Command } from 'lucide-react';
import { useNavigate } from 'react-router';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  products: any[];
}

const STATIC_PAGES = [
  { title: 'Shop Collection', path: '/shop', type: 'page' },
  { title: 'Services & Design Consultation', path: '/services', type: 'page' },
  { title: 'About B-Interiors', path: '/about', type: 'page' },
  { title: 'Contact Us', path: '/contact', type: 'page' },
  { title: 'Become a Partner', path: '/become-a-partner', type: 'page' },
  { title: 'My Account', path: '/account', type: 'page' },
];

export const GlobalSearch = ({ isOpen, onClose, products }: GlobalSearchProps) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const results = useCallback(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const productResults = products
      .filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.material?.toLowerCase().includes(q) ||
        p.color?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        (p.tags || []).some((t: string) => t.toLowerCase().includes(q)) ||
        (p.subcategory || '').toLowerCase().includes(q)
      )
      .slice(0, 6)
      .map(p => ({
        id: p.id,
        title: p.name,
        subtitle: `${p.category} · ${p.material} · R ${p.price?.toLocaleString()}`,
        image: p.gallery?.[0]?.url || p.image_url || p.image,
        path: `/product/${p.id}`,
        type: 'product' as const,
      }));

    const pageResults = STATIC_PAGES
      .filter(pg => pg.title.toLowerCase().includes(q))
      .map(pg => ({
        id: pg.path,
        title: pg.title,
        subtitle: pg.path,
        image: null as string | null,
        path: pg.path,
        type: 'page' as const,
      }));

    return [...productResults, ...pageResults];
  }, [query, products])();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (path: string) => {
    onClose();
    navigate(path);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex].path);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  // Global Cmd+K / Ctrl+K
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        // opening is handled by parent
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[201] flex items-start justify-center pt-[12vh] px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto border border-neutral-200/50"
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 px-5 border-b border-neutral-100">
                <Search className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search products, pages..."
                  className="flex-1 py-4 text-base outline-none text-neutral-900 placeholder:text-neutral-400 bg-transparent"
                />
                {query && (
                  <button onClick={() => setQuery('')} className="p-1 hover:bg-neutral-100 rounded-md transition-colors">
                    <X className="w-4 h-4 text-neutral-400" />
                  </button>
                )}
                <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 bg-neutral-100 rounded text-[10px] text-neutral-500 font-mono">
                  ESC
                </div>
              </div>

              {/* Results */}
              <div className="max-h-[50vh] overflow-y-auto">
                {query.trim() === '' ? (
                  <div className="px-5 py-8 text-center">
                    <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search className="w-5 h-5 text-neutral-300" />
                    </div>
                    <p className="text-sm text-neutral-400">Search the B-Interiors catalogue</p>
                    <p className="text-[10px] text-neutral-300 mt-2 uppercase tracking-widest">Type to begin</p>
                  </div>
                ) : results.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <p className="text-sm text-neutral-400">No results for "{query}"</p>
                    <p className="text-[10px] text-neutral-300 mt-1">Try a different search term</p>
                  </div>
                ) : (
                  <div className="py-2">
                    {results.some(r => r.type === 'product') && (
                      <div className="px-4 py-1.5">
                        <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-neutral-400">Products</p>
                      </div>
                    )}
                    {results.filter(r => r.type === 'product').map((result, idx) => {
                      const globalIdx = results.indexOf(result);
                      return (
                        <button
                          key={result.id}
                          onClick={() => handleSelect(result.path)}
                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                            selectedIndex === globalIdx ? 'bg-neutral-50' : 'hover:bg-neutral-50'
                          }`}
                        >
                          {result.image ? (
                            <img src={result.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-neutral-100" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                              <Package className="w-4 h-4 text-neutral-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-900 truncate">{result.title}</p>
                            <p className="text-[11px] text-neutral-400 truncate">{result.subtitle}</p>
                          </div>
                          {selectedIndex === globalIdx && (
                            <ArrowRight className="w-4 h-4 text-neutral-300 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}

                    {results.some(r => r.type === 'page') && (
                      <div className="px-4 py-1.5 mt-1 border-t border-neutral-50">
                        <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-neutral-400 pt-1.5">Pages</p>
                      </div>
                    )}
                    {results.filter(r => r.type === 'page').map((result) => {
                      const globalIdx = results.indexOf(result);
                      return (
                        <button
                          key={result.id}
                          onClick={() => handleSelect(result.path)}
                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                            selectedIndex === globalIdx ? 'bg-neutral-50' : 'hover:bg-neutral-50'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 text-neutral-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-900 truncate">{result.title}</p>
                            <p className="text-[11px] text-neutral-400 font-mono truncate">{result.subtitle}</p>
                          </div>
                          {selectedIndex === globalIdx && (
                            <ArrowRight className="w-4 h-4 text-neutral-300 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-3 text-[10px] text-neutral-400">
                  <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-white border border-neutral-200 rounded text-[9px] font-mono">↑</kbd><kbd className="px-1 py-0.5 bg-white border border-neutral-200 rounded text-[9px] font-mono">↓</kbd> Navigate</span>
                  <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-white border border-neutral-200 rounded text-[9px] font-mono">↵</kbd> Open</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                  <Command className="w-3 h-3" />
                  <span>K to search</span>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};