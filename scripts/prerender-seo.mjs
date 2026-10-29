// Runs after `vite build`. Writes one HTML file per page and product so crawlers and link
// previews see the right title, description, canonical URL and structured data without
// running JavaScript, then generates sitemap.xml. The React app boots from each file as usual.
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { productCatalogue } from '../src/app/data/catalogue.ts';
import { LANDING_ROUTES, landingMetadata } from '../src/app/content/landing.ts';
import { DEFAULT_HOMEPAGE_CONTENT } from '../src/app/content/homepage.ts';
import { DEFAULT_COMPANY_CONTENT } from '../src/app/content/company.ts';
import { IMAGE_VARIANTS } from '../src/app/data/imageVariants.ts';
import {
  DEFAULT_OG_IMAGE, PAGE_METADATA, SITE_NAME, SITE_URL,
  absoluteUrl, businessJsonLd, productImage, productJsonLd, productMetadata, productPath,
} from '../src/app/seo.ts';

const dist = path.resolve('dist');
const template = await readFile(path.join(dist, 'index.html'), 'utf8');
const SEO_REGION = /<!-- seo:start[^>]*-->[\s\S]*?<!-- seo:end -->/;
if (!SEO_REGION.test(template)) throw new Error('dist/index.html is missing the <!-- seo:start --> region.');

const escapeHtml = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Keep JSON-LD from closing its own <script> tag.
const jsonForScript = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

// Lets the browser start downloading the page's main image before the app's JavaScript runs.
const preloadImage = (src, sizes = '100vw', media) => {
  const file = src?.match(/^\/product-images\/([^/?#]+)$/)?.[1];
  const entry = file && IMAGE_VARIANTS[file];
  if (!entry) return src ? `<link rel="preload" as="image" href="${escapeHtml(src)}" fetchpriority="high"${media ? ` media="${media}"` : ''} />` : '';
  const base = file.replace(/\.[^.]+$/, '');
  const srcset = entry.sizes.map((size) => `/img/${base}-${size}.webp ${Math.min(size, entry.width)}w`).join(', ');
  return `<link rel="preload" as="image" type="image/webp" imagesrcset="${srcset}" imagesizes="${sizes}" fetchpriority="high"${media ? ` media="${media}"` : ''} />`;
};

// Each route's page module, so its code (and the chunks it imports) can be fetched alongside the main bundle.
const manifest = JSON.parse(await readFile(path.join(dist, '.vite', 'manifest.json'), 'utf8'));
const entryChunks = new Set(Object.values(manifest).filter((chunk) => chunk.isEntry).flatMap((chunk) => [chunk.file, ...(chunk.imports || []).map((key) => manifest[key]?.file)]));
const chunkFiles = (key, seen = new Set()) => {
  const chunk = manifest[key];
  if (!chunk || seen.has(key)) return [];
  seen.add(key);
  return [chunk.file, ...(chunk.imports || []).flatMap((child) => chunkFiles(child, seen))];
};
const PAGE_MODULES = {
  '/': 'Home', '/shop': 'Shop', '/services': 'Services', '/about': 'About', '/contact': 'Contact',
  '/login': 'Login', '/account': 'Account', '/checkout': 'Checkout', '/thank-you': 'ThankYou', '/become-a-partner': 'VendorApplication',
};
const pageModuleFor = (route) => PAGE_MODULES[route]
  || (route.startsWith('/product/') && 'ProductDetail')
  || (route.startsWith('/services/') && 'ServiceDetail')
  || (route.startsWith('/shop/') && 'Shop');
const preloadCode = (route) => {
  const page = pageModuleFor(route);
  if (!page) return '';
  return [...new Set(chunkFiles(`src/app/pages/${page}.tsx`))]
    .filter((file) => !entryChunks.has(file))
    .map((file) => `<link rel="modulepreload" crossorigin href="/${file}" />`)
    .join('\n      ');
};

const firstHeroSlide = DEFAULT_HOMEPAGE_CONTENT.sections.hero.slides.find((slide) => slide.enabled !== false && slide.id !== 'material-stories');
const company = DEFAULT_COMPANY_CONTENT.sections;
const ROUTE_IMAGES = {
  '/': firstHeroSlide && preloadImage(firstHeroSlide.image.url),
  '/about': preloadImage(company.hero.image.url),
  '/services': preloadImage('/product-images/bi-036.jpg'),
  '/contact': preloadImage('/product-images/bi-066.jpg'),
  '/shop': preloadImage('/product-images/bi-226.jpg', '240px', '(min-width: 640px)'),
};
for (const item of company.services.items) ROUTE_IMAGES[`/services/${item.id}`] = preloadImage(item.image?.url, '(min-width: 768px) 100vw, 360px');

const renderHead = ({ meta, url, image, type = 'website', jsonLd, preload = '' }) => [
  '<!-- seo:start -->',
  `<title>${escapeHtml(meta.title)}</title>`,
  `<meta name="description" content="${escapeHtml(meta.description)}" />`,
  meta.keywords ? `<meta name="keywords" content="${escapeHtml(meta.keywords)}" />` : '',
  `<meta name="robots" content="${meta.noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'}" />`,
  `<link rel="canonical" href="${escapeHtml(url)}" />`,
  `<meta property="og:type" content="${type}" />`,
  `<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`,
  `<meta property="og:locale" content="en_ZA" />`,
  `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
  `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
  `<meta property="og:url" content="${escapeHtml(url)}" />`,
  `<meta property="og:image" content="${escapeHtml(image)}" />`,
  '<meta name="twitter:card" content="summary_large_image" />',
  `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
  `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
  `<meta name="twitter:image" content="${escapeHtml(image)}" />`,
  `<script type="application/ld+json" id="seo-jsonld">${jsonForScript(jsonLd)}</script>`,
  preload,
  preloadCode(new URL(url).pathname),
  '<!-- seo:end -->',
].filter(Boolean).join('\n      ');

const writePage = async (route, html) => {
  // Cloudflare Pages serves /shop from shop.html and / from index.html.
  const file = route === '/' ? 'index.html' : `${route.replace(/^\//, '')}.html`;
  const target = path.join(dist, file);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, html);
};

const business = businessJsonLd();
let pages = 0;

for (const [route, meta] of Object.entries(PAGE_METADATA)) {
  const html = template.replace(SEO_REGION, renderHead({ meta, url: absoluteUrl(route), image: absoluteUrl(DEFAULT_OG_IMAGE), jsonLd: [business], preload: ROUTE_IMAGES[route] }));
  await writePage(route, html);
  pages += 1;
}

for (const route of LANDING_ROUTES) {
  const html = template.replace(SEO_REGION, renderHead({ meta: landingMetadata(route), url: absoluteUrl(route), image: absoluteUrl(DEFAULT_OG_IMAGE), jsonLd: [business], preload: ROUTE_IMAGES[route] }));
  await writePage(route, html);
  pages += 1;
}

for (const product of productCatalogue) {
  const route = productPath(product);
  const html = template.replace(SEO_REGION, renderHead({
    meta: productMetadata(product),
    url: absoluteUrl(route),
    image: absoluteUrl(productImage(product)),
    type: 'product',
    jsonLd: [business, ...productJsonLd(product)],
    preload: preloadImage(productImage(product), '(min-width: 1024px) 55vw, calc(100vw - 48px)'),
  }));
  await writePage(decodeURIComponent(route), html);
  pages += 1;
}

const today = new Date().toISOString().slice(0, 10);
const indexable = [
  ...Object.entries(PAGE_METADATA).filter(([, meta]) => !meta.noIndex).map(([route]) => ({ loc: absoluteUrl(route), priority: route === '/' ? '1.0' : '0.8', changefreq: 'weekly' })),
  ...LANDING_ROUTES.map((route) => ({ loc: absoluteUrl(route), priority: route.startsWith('/services/') ? '0.8' : '0.7', changefreq: 'weekly' })),
  ...productCatalogue.map((product) => ({ loc: absoluteUrl(productPath(product)), priority: '0.6', changefreq: 'monthly', image: absoluteUrl(productImage(product)) })),
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${indexable.map((entry) => `  <url>
    <loc>${escapeHtml(entry.loc)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>${entry.image ? `
    <image:image><image:loc>${escapeHtml(entry.image)}</image:loc></image:image>` : ''}
  </url>`).join('\n')}
</urlset>
`;
await writeFile(path.join(dist, 'sitemap.xml'), sitemap);

await rm(path.join(dist, '.vite'), { recursive: true, force: true });
console.log(`SEO: wrote ${pages} pages and a sitemap with ${indexable.length} URLs for ${SITE_URL}.`);
