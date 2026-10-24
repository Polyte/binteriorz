import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { motion } from 'motion/react';
import { BlockRenderer } from '../components/BlockRenderer';
import { Loader2 } from 'lucide-react';

const API = `/api`;

export const DynamicPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Derive slug from either /p/:slug param or catch-all pathname
  const pageSlug = slug || location.pathname.replace(/^\/+/, '').replace(/\/+$/, '');

  useEffect(() => {
    if (!pageSlug) { setNotFound(true); setLoading(false); return; }

    const fetchPage = async () => {
      try {
        const res = await fetch(`${API}/page/${pageSlug}`, {
          headers: {
          },
        });
        if (res.status === 404) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch page');
        const data = await res.json();
        setPage(data);
      } catch (err) {
        console.error('Failed to load page:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [pageSlug]);

  // Parse blocks
  const blocks = React.useMemo(() => {
    if (!page) return [];
    if (page.blocks && Array.isArray(page.blocks)) return page.blocks;
    if (page.content) {
      try {
        const parsed = JSON.parse(page.content);
        if (Array.isArray(parsed)) return parsed;
      } catch { /* fallback to raw content */ }
    }
    return [];
  }, [page]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-8 h-8 text-neutral-300 animate-spin" />
          <p className="text-xs text-neutral-400 uppercase tracking-[0.2em]">Loading</p>
        </motion.div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center px-6"
        >
          <h1 className="text-6xl md:text-8xl font-serif font-bold text-neutral-200 dark:text-neutral-800">404</h1>
          <p className="text-sm text-neutral-500 mt-4">This page doesn't exist or hasn't been published yet.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-6 px-6 py-2.5 bg-neutral-900 text-white text-xs font-bold uppercase tracking-[0.15em] rounded-sm hover:bg-neutral-800 transition-colors"
          >
            Return Home
          </button>
        </motion.div>
      </div>
    );
  }

  // If page has no blocks but has raw HTML content, render it
  if (blocks.length === 0 && page?.content) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen"
      >
        {page.metaDescription && (
          <meta name="description" content={page.metaDescription} />
        )}
        <div className={`${page.template === 'full-width' ? '' : 'max-w-4xl mx-auto px-4 md:px-8'} py-16 md:py-24`}>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-neutral-900 dark:text-white mb-8 text-center">{page.title}</h1>
          <div
            className="prose prose-neutral dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
      <BlockRenderer blocks={blocks} template={page?.template} />
    </motion.div>
  );
};