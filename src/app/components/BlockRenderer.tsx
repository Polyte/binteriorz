import React, { useState } from 'react';
import { motion, useInView } from 'motion/react';
import { ChevronDown, Star, CheckCircle2, MapPin, ExternalLink } from 'lucide-react';
import { useRef } from 'react';

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

// ─── Animated Wrapper ────────────────────────────────────────
const AnimatedBlock = ({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ─── Block Settings Wrapper ──────────────────────────────────
const BlockWrapper = ({ block, children }: { block: any; children: React.ReactNode }) => {
  const s = block.settings || {};
  const paddingMap: Record<string, string> = {
    none: 'py-0',
    sm: 'py-6 md:py-8',
    md: 'py-10 md:py-16',
    lg: 'py-16 md:py-24',
    xl: 'py-24 md:py-36',
  };
  const paddingClass = paddingMap[s.paddingY || 'md'] || paddingMap.md;
  const hasBackground = s.bgColor || s.bgImage;

  return (
    <section
      id={s.anchor || undefined}
      className={`relative ${s.fullBleed ? '' : ''} ${paddingClass} ${s.customClass || ''}`}
      style={{
        backgroundColor: s.bgColor || undefined,
      }}
    >
      {s.bgImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${s.bgImage})` }}
          />
          <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${s.bgOverlay || 0})` }} />
        </>
      )}
      <div className={`relative z-10 ${s.fullBleed ? '' : 'max-w-6xl mx-auto px-4 md:px-8'}`}>
        {children}
      </div>
    </section>
  );
};

// ─── Individual Block Renderers ──────────────────────────────

const HeroBlock = ({ data, settings }: { data: any; settings: any }) => {
  const heightMap: Record<string, string> = {
    sm: 'h-[40vh] md:h-[50vh]',
    md: 'h-[55vh] md:h-[65vh]',
    lg: 'h-[70vh] md:h-[85vh]',
  };
  const alignMap: Record<string, string> = {
    left: 'items-start text-left',
    center: 'items-center text-center',
    right: 'items-end text-right',
  };
  return (
    <div className={`relative ${heightMap[data.height || 'lg']} overflow-hidden`}>
      {data.image && (
        <motion.img
          src={data.image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.4, ease }}
        />
      )}
      <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${data.overlay || 0.4})` }} />
      <div className={`relative z-10 h-full flex flex-col ${alignMap[data.alignment || 'center']} justify-center px-6 md:px-16 max-w-5xl ${data.alignment === 'center' ? 'mx-auto' : ''}`}>
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease }}
          className="text-white text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-serif font-bold leading-[1.1] tracking-tight"
        >
          {data.heading}
        </motion.h1>
        {data.subheading && (
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease }}
            className="text-white/70 text-sm sm:text-base md:text-lg mt-4 md:mt-6 max-w-xl leading-relaxed"
          >
            {data.subheading}
          </motion.p>
        )}
        {data.ctaText && (
          <motion.a
            href={data.ctaLink || '/'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6, ease }}
            className="mt-6 md:mt-8 inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-3.5 bg-white text-neutral-900 text-xs md:text-sm font-bold uppercase tracking-[0.15em] rounded-sm hover:bg-neutral-100 transition-colors"
          >
            {data.ctaText}
          </motion.a>
        )}
      </div>
    </div>
  );
};

const HeadingBlock = ({ data }: { data: any }) => {
  const alignMap: Record<string, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };
  const Tag = (data.level || 'h2') as keyof JSX.IntrinsicElements;
  const sizeMap: Record<string, string> = {
    h1: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl',
    h2: 'text-2xl sm:text-3xl md:text-4xl',
    h3: 'text-xl sm:text-2xl md:text-3xl',
  };
  return (
    <AnimatedBlock className={alignMap[data.alignment || 'center']}>
      <Tag className={`${sizeMap[data.level || 'h2']} font-serif font-bold text-neutral-900 dark:text-white leading-tight tracking-tight`}>
        {data.text}
      </Tag>
      {data.subtitle && (
        <p className="text-neutral-500 dark:text-neutral-400 text-sm md:text-base mt-3 md:mt-4 max-w-2xl leading-relaxed" style={{ margin: data.alignment === 'center' ? '1rem auto 0' : undefined }}>
          {data.subtitle}
        </p>
      )}
    </AnimatedBlock>
  );
};

const TextBlock = ({ data }: { data: any }) => {
  const alignMap: Record<string, string> = { left: 'text-left', center: 'text-center mx-auto', right: 'text-right ml-auto' };
  const widthMap: Record<string, string> = { prose: 'max-w-prose', full: 'max-w-full', narrow: 'max-w-lg' };
  return (
    <AnimatedBlock className={`${widthMap[data.maxWidth || 'prose']} ${alignMap[data.alignment || 'left']}`}>
      <div className="text-neutral-600 dark:text-neutral-300 text-base md:text-lg leading-relaxed whitespace-pre-wrap">
        {data.content}
      </div>
    </AnimatedBlock>
  );
};

const ImageBlock = ({ data }: { data: any }) => {
  if (!data.url) return null;
  return (
    <AnimatedBlock className={data.fullWidth ? '' : 'max-w-3xl mx-auto'}>
      <figure>
        <img
          src={data.url}
          alt={data.alt || ''}
          className={`w-full h-auto ${data.rounded !== false ? 'rounded-xl' : ''} ${data.shadow !== false ? 'shadow-lg' : ''}`}
          loading="lazy"
        />
        {data.caption && (
          <figcaption className="text-center text-xs text-neutral-400 mt-3 italic">{data.caption}</figcaption>
        )}
      </figure>
    </AnimatedBlock>
  );
};

const ImageTextBlock = ({ data }: { data: any }) => {
  return (
    <AnimatedBlock>
      <div className={`flex flex-col ${data.imagePosition === 'right' ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 md:gap-12 items-center`}>
        <div className="w-full md:w-1/2">
          {data.image ? (
            <img src={data.image} alt="" className="w-full h-auto rounded-xl shadow-md object-cover aspect-[4/3]" loading="lazy" />
          ) : (
            <div className="w-full aspect-[4/3] bg-neutral-100 rounded-xl" />
          )}
        </div>
        <div className="w-full md:w-1/2 space-y-4">
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-neutral-900 dark:text-white leading-tight">{data.heading}</h3>
          <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">{data.text}</p>
          {data.ctaText && (
            <a href={data.ctaLink || '/'} className="inline-flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider hover:underline underline-offset-4">
              {data.ctaText} <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </AnimatedBlock>
  );
};

const GalleryBlock = ({ data }: { data: any }) => {
  const colsMap: Record<number, string> = { 2: 'grid-cols-1 sm:grid-cols-2', 3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3', 4: 'grid-cols-2 md:grid-cols-4' };
  const gapMap: Record<string, string> = { sm: 'gap-2', md: 'gap-4', lg: 'gap-6' };
  const images = (data.images || []).filter((img: any) => img.url);
  if (images.length === 0) return null;
  return (
    <AnimatedBlock>
      <div className={`grid ${colsMap[data.columns || 3] || colsMap[3]} ${gapMap[data.gap || 'md']}`}>
        {images.map((img: any, i: number) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08, ease }}
            className={`overflow-hidden ${data.rounded !== false ? 'rounded-xl' : ''}`}
          >
            <img src={img.url} alt={img.alt || ''} className="w-full aspect-square object-cover hover:scale-105 transition-transform duration-700" loading="lazy" />
          </motion.div>
        ))}
      </div>
    </AnimatedBlock>
  );
};

const VideoBlock = ({ data }: { data: any }) => {
  if (!data.url) return null;
  // YouTube embed
  const youtubeMatch = data.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  const vimeoMatch = data.url.match(/vimeo\.com\/(\d+)/);
  return (
    <AnimatedBlock className="max-w-4xl mx-auto">
      <div className="aspect-video rounded-xl overflow-hidden shadow-lg bg-neutral-900">
        {youtubeMatch ? (
          <iframe src={`https://www.youtube.com/embed/${youtubeMatch[1]}`} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen title="Video" />
        ) : vimeoMatch ? (
          <iframe src={`https://player.vimeo.com/video/${vimeoMatch[1]}`} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen title="Video" />
        ) : (
          <video src={data.url} controls poster={data.poster} className="w-full h-full object-cover" />
        )}
      </div>
      {data.caption && <p className="text-center text-xs text-neutral-400 mt-3 italic">{data.caption}</p>}
    </AnimatedBlock>
  );
};

const CTABlock = ({ data }: { data: any }) => {
  const styleMap: Record<string, string> = {
    dark: 'bg-neutral-900 text-white',
    light: 'bg-neutral-50 text-neutral-900 border border-neutral-200',
    gradient: 'bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-700 text-white',
  };
  return (
    <AnimatedBlock>
      <div className={`${styleMap[data.style || 'dark']} rounded-2xl px-8 py-12 md:px-16 md:py-20 text-center ${data.fullWidth ? '' : 'max-w-4xl mx-auto'}`}>
        <h3 className="text-2xl md:text-4xl font-serif font-bold leading-tight">{data.heading}</h3>
        {data.subheading && (
          <p className={`mt-3 md:mt-4 text-sm md:text-base max-w-lg mx-auto leading-relaxed ${data.style === 'light' ? 'text-neutral-500' : 'text-white/60'}`}>
            {data.subheading}
          </p>
        )}
        {data.buttonText && (
          <a
            href={data.buttonLink || '/'}
            className={`mt-6 md:mt-8 inline-flex items-center gap-2 px-6 md:px-8 py-3 text-xs md:text-sm font-bold uppercase tracking-[0.15em] rounded-sm transition-colors ${
              data.style === 'dark' || data.style === 'gradient'
                ? 'bg-white text-neutral-900 hover:bg-neutral-100'
                : 'bg-neutral-900 text-white hover:bg-neutral-800'
            }`}
          >
            {data.buttonText}
          </a>
        )}
      </div>
    </AnimatedBlock>
  );
};

const ColumnsBlock = ({ data }: { data: any }) => {
  const cols = data.columns || [];
  return (
    <AnimatedBlock>
      <div className={`grid ${data.count === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6 md:gap-10`}>
        {cols.map((col: any, i: number) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1, ease }}
          >
            <h4 className="text-lg md:text-xl font-serif font-bold text-neutral-900 dark:text-white mb-3">{col.heading}</h4>
            <p className="text-neutral-600 dark:text-neutral-300 text-sm md:text-base leading-relaxed">{col.text}</p>
          </motion.div>
        ))}
      </div>
    </AnimatedBlock>
  );
};

const TestimonialBlock = ({ data }: { data: any }) => {
  return (
    <AnimatedBlock className="max-w-2xl mx-auto text-center">
      <div className="text-4xl text-neutral-200 dark:text-neutral-700 font-serif mb-4">&ldquo;</div>
      <blockquote className="text-lg md:text-xl text-neutral-700 dark:text-neutral-200 font-serif italic leading-relaxed">
        {data.quote}
      </blockquote>
      <div className="mt-6 flex items-center justify-center gap-3">
        {data.avatar ? (
          <img src={data.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-sm font-bold text-neutral-500 dark:text-neutral-400">
            {(data.author || '?')[0]}
          </div>
        )}
        <div className="text-left">
          <p className="text-sm font-bold text-neutral-900 dark:text-white">{data.author}</p>
          {data.role && <p className="text-xs text-neutral-400">{data.role}</p>}
        </div>
      </div>
      {data.rating > 0 && (
        <div className="flex justify-center gap-1 mt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`w-4 h-4 ${i < data.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'}`} />
          ))}
        </div>
      )}
    </AnimatedBlock>
  );
};

const DividerBlock = ({ data }: { data: any }) => {
  const spacingMap: Record<string, string> = { sm: 'py-4', md: 'py-8', lg: 'py-14' };
  return (
    <div className={spacingMap[data.spacing || 'md']}>
      {data.type === 'line' ? (
        <hr className="border-neutral-200 dark:border-neutral-800" />
      ) : data.type === 'dots' ? (
        <div className="flex justify-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
        </div>
      ) : null}
    </div>
  );
};

const StatsBlock = ({ data }: { data: any }) => {
  const stats = data.stats || [];
  return (
    <AnimatedBlock>
      <div className={`grid grid-cols-${Math.min(stats.length, 4)} gap-6 md:gap-8`}>
        {stats.map((stat: any, i: number) => (
          <motion.div
            key={i}
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1, ease }}
          >
            <p className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-neutral-900 dark:text-white">{stat.value}</p>
            <p className="text-[10px] md:text-xs text-neutral-400 uppercase tracking-[0.2em] mt-2 font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </AnimatedBlock>
  );
};

const FAQBlock = ({ data }: { data: any }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const items = data.items || [];
  return (
    <AnimatedBlock className="max-w-2xl mx-auto">
      <div className="divide-y divide-neutral-200 dark:divide-neutral-800 border-t border-b border-neutral-200 dark:border-neutral-800">
        {items.map((item: any, i: number) => (
          <div key={i}>
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between py-5 text-left group"
            >
              <span className="text-sm md:text-base font-medium text-neutral-900 dark:text-white pr-4 group-hover:text-neutral-600 transition-colors">{item.question}</span>
              <ChevronDown className={`w-4 h-4 text-neutral-400 flex-shrink-0 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`} />
            </button>
            <motion.div
              initial={false}
              animate={{ height: openIndex === i ? 'auto' : 0, opacity: openIndex === i ? 1 : 0 }}
              transition={{ duration: 0.3, ease }}
              className="overflow-hidden"
            >
              <p className="pb-5 text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">{item.answer}</p>
            </motion.div>
          </div>
        ))}
      </div>
    </AnimatedBlock>
  );
};

const ProductGridBlock = ({ data }: { data: any }) => {
  // Placeholder — in a real implementation you'd fetch products here
  return (
    <AnimatedBlock>
      <div className={`grid grid-cols-2 md:grid-cols-${Math.min(data.count || 4, 4)} gap-4 md:gap-6`}>
        {Array.from({ length: data.count || 4 }).map((_, i) => (
          <div key={i} className="group">
            <div className="aspect-square bg-neutral-100 dark:bg-neutral-800 rounded-xl overflow-hidden mb-3">
              <div className="w-full h-full flex items-center justify-center text-neutral-300">
                <span className="text-xs uppercase tracking-widest">Product {i + 1}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AnimatedBlock>
  );
};

const MapBlock = ({ data }: { data: any }) => {
  if (!data.embedUrl) return null;
  return (
    <AnimatedBlock>
      <div className="rounded-xl overflow-hidden shadow-lg" style={{ height: data.height || 400 }}>
        <iframe src={data.embedUrl} className="w-full h-full border-0" allowFullScreen loading="lazy" title={data.address || 'Map'} />
      </div>
      {data.address && (
        <p className="flex items-center gap-1.5 text-xs text-neutral-400 mt-3">
          <MapPin className="w-3.5 h-3.5" /> {data.address}
        </p>
      )}
    </AnimatedBlock>
  );
};

const ListBlock = ({ data }: { data: any }) => {
  const items = data.items || [];
  return (
    <AnimatedBlock className="max-w-2xl mx-auto">
      <div className={`${data.columns === 2 ? 'grid md:grid-cols-2 gap-x-8' : ''}`}>
        {items.map((item: string, i: number) => (
          <div key={i} className="flex items-start gap-3 py-2.5">
            {data.style === 'check' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            ) : data.style === 'number' ? (
              <span className="w-6 h-6 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-neutral-400 flex-shrink-0 mt-2" />
            )}
            <span className="text-sm md:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed">{item}</span>
          </div>
        ))}
      </div>
    </AnimatedBlock>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN BLOCK RENDERER
// ═══════════════════════════════════════════════════════════════
const renderBlock = (block: any) => {
  const { data, settings } = block;
  switch (block.type) {
    case 'hero': return <HeroBlock data={data} settings={settings} />;
    case 'heading': return <HeadingBlock data={data} />;
    case 'text': return <TextBlock data={data} />;
    case 'image': return <ImageBlock data={data} />;
    case 'image-text': return <ImageTextBlock data={data} />;
    case 'gallery': return <GalleryBlock data={data} />;
    case 'video': return <VideoBlock data={data} />;
    case 'cta': return <CTABlock data={data} />;
    case 'columns': return <ColumnsBlock data={data} />;
    case 'testimonial': return <TestimonialBlock data={data} />;
    case 'divider': return <DividerBlock data={data} />;
    case 'stats': return <StatsBlock data={data} />;
    case 'faq': return <FAQBlock data={data} />;
    case 'product-grid': return <ProductGridBlock data={data} />;
    case 'map': return <MapBlock data={data} />;
    case 'list': return <ListBlock data={data} />;
    default: return null;
  }
};

interface BlockRendererProps {
  blocks: any[];
  template?: string;
}

export const BlockRenderer = ({ blocks, template = 'default' }: BlockRendererProps) => {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="block-renderer">
      {blocks.map((block, index) => {
        // Hero blocks render full-bleed regardless of settings
        if (block.type === 'hero') {
          return (
            <div key={block.id || index} id={block.settings?.anchor || undefined} className={block.settings?.customClass || ''}>
              {renderBlock(block)}
            </div>
          );
        }
        return (
          <BlockWrapper key={block.id || index} block={block}>
            {renderBlock(block)}
          </BlockWrapper>
        );
      })}
    </div>
  );
};
