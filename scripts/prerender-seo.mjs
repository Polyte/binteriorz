// Runs after `vite build`. Writes one HTML file per page and product so crawlers and link
// previews see the right title, description, canonical URL and structured data without
// running JavaScript, then generates sitemap.xml. The React app boots from each file as usual.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { productCatalogue } from '../src/app/data/catalogue.ts';
import { LANDING_ROUTES, landingMetadata } from '../src/app/content/landing.ts';
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

const renderHead = ({ meta, url, image, type = 'website', jsonLd }) => [
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
  const html = template.replace(SEO_REGION, renderHead({ meta, url: absoluteUrl(route), image: absoluteUrl(DEFAULT_OG_IMAGE), jsonLd: [business] }));
  await writePage(route, html);
  pages += 1;
}

for (const route of LANDING_ROUTES) {
  const html = template.replace(SEO_REGION, renderHead({ meta: landingMetadata(route), url: absoluteUrl(route), image: absoluteUrl(DEFAULT_OG_IMAGE), jsonLd: [business] }));
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

console.log(`SEO: wrote ${pages} pages and a sitemap with ${indexable.length} URLs for ${SITE_URL}.`);
