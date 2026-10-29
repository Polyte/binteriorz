// Shared SEO metadata. Used by the app at runtime and by scripts/prerender-seo.mjs at build time,
// so keep this file free of imports.

export const SITE_URL = 'https://b-interiorz.co.za';
export const SITE_NAME = 'B Interior Designz';
export const DEFAULT_OG_IMAGE = '/product-images/bi-068.jpg';

export interface PageMetadata {
  title: string;
  description: string;
  keywords: string;
  noIndex?: boolean;
}

export const PAGE_METADATA: Record<string, PageMetadata> = {
  '/': {
    title: 'Interior Design & Décor in Alberton | B Interior Designz',
    description: 'Interior design, bespoke furniture, curtains, rugs and décor from our Alberton showroom. Shop the collection or book a consultation in Johannesburg South.',
    keywords: 'interior designer Alberton, interior design Johannesburg South, furniture shop Alberton, home décor Alberton, bespoke furniture',
  },
  '/shop': {
    title: 'Shop Furniture, Rugs & Décor Online | B Interior Designz',
    description: 'Shop sofas, chairs, tables, rugs, curtains, cushions and lighting from B Interior Designz in Alberton. Filter by room, colour and price.',
    keywords: 'furniture shop Alberton, rugs Johannesburg, scatter cushions South Africa, curtains Alberton, coffee tables South Africa',
  },
  '/services': {
    title: 'Interior Design Services in Alberton | B Interior Designz',
    description: 'Interior design, space planning, bespoke furniture, curtains, décor styling and refurbishment for homes, rentals and offices in Alberton and Johannesburg South.',
    keywords: 'interior design services Alberton, interior decorator Johannesburg South, bespoke furniture Alberton, home staging Johannesburg, Airbnb interior design',
  },
  '/about': {
    title: 'About Our Alberton Interior Studio | B Interior Designz',
    description: 'Meet B Interior Designz, an Alberton interior design studio creating functional, beautiful spaces with bespoke furniture, décor and refurbishment.',
    keywords: 'B Interior Designz, interior design studio Alberton, interior designers Johannesburg South',
  },
  '/contact': {
    title: 'Contact Our Alberton Design Studio | B Interior Designz',
    description: 'Visit B Interior Designz at 35 Radio Street, Alberton, or send us your brief to book an interior design consultation.',
    keywords: 'contact interior designer Alberton, interior design consultation Johannesburg South',
  },
  '/become-a-partner': { title: `Become a Partner | ${SITE_NAME}`, description: `Apply to partner with ${SITE_NAME}.`, keywords: '', noIndex: true },
  '/checkout': { title: `Checkout | ${SITE_NAME}`, description: `Complete your ${SITE_NAME} order securely.`, keywords: '', noIndex: true },
  '/thank-you': { title: `Thank You | ${SITE_NAME}`, description: `Thank you for choosing ${SITE_NAME}.`, keywords: '', noIndex: true },
  '/login': { title: `Sign In | ${SITE_NAME}`, description: `Sign in to your ${SITE_NAME} account.`, keywords: '', noIndex: true },
  '/account': { title: `Your Account | ${SITE_NAME}`, description: `Manage your ${SITE_NAME} account and orders.`, keywords: '', noIndex: true },
  '/admin': { title: `Administration | ${SITE_NAME}`, description: `${SITE_NAME} administration.`, keywords: '', noIndex: true },
};

export const FALLBACK_METADATA: PageMetadata = {
  title: `${SITE_NAME} | Interior Design & Décor, Alberton`,
  description: 'Interior design, furniture and décor by B Interior Designz in Alberton, South Africa.',
  keywords: '',
};

export const NOT_FOUND_METADATA: PageMetadata = {
  title: `Page Not Found | ${SITE_NAME}`,
  description: 'The page you are looking for could not be found.',
  keywords: '',
  noIndex: true,
};

export const absoluteUrl = (path: string) => new URL(path || '/', SITE_URL).href;

const plainText = (value: unknown) => String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

// Catalogue descriptions end with supplier notes ("…; confirm dimensions and finish before ordering").
// Keep the customer-facing part and drop the notes.
export const customerDescription = (value: unknown) => plainText(value)
  .replace(/[;,]\s*confirm\b[^.]*\./gi, '.')
  .split(/(?<=\.)\s+/)
  .filter((sentence) => sentence && !/\bconfirm\b|markup|supplier|estimated/i.test(sentence))
  .join(' ');

const customerSentences = customerDescription;

const truncate = (value: string, max: number) => (value.length <= max ? value : `${value.slice(0, max - 1).replace(/\s+\S*$/, '')}…`);

const formatRand = (price: unknown) => `R${Number(price || 0).toLocaleString('en-ZA').replace(/ /g, ' ')}`;

export const productPath = (product: any) => `/product/${encodeURIComponent(product.id)}`;
export const productImage = (product: any) => product.image_url || product.mainImage || product.image || DEFAULT_OG_IMAGE;

export const productMetadata = (product: any): PageMetadata => {
  const details = customerSentences(product.description);
  const lead = `${product.name} for ${formatRand(product.price)} from ${SITE_NAME}, Alberton.`;
  return {
    title: truncate(`${product.name} | ${SITE_NAME}`, 70),
    description: truncate(details ? `${lead} ${details}` : `${lead} Shop considered furniture and décor for every room.`, 158),
    keywords: [product.name, product.category, product.color, 'Alberton', SITE_NAME].filter(Boolean).join(', '),
  };
};

export interface BusinessContact {
  phone?: string;
  whatsapp?: string;
  email?: string;
  sameAs?: string[];
}

export const businessJsonLd = (contact: BusinessContact = {}) => {
  const telephone = (contact.phone || contact.whatsapp || '').trim();
  return {
    '@context': 'https://schema.org',
    '@type': 'FurnitureStore',
    '@id': `${SITE_URL}/#business`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: absoluteUrl('/logo.png'),
    image: absoluteUrl(DEFAULT_OG_IMAGE),
    description: PAGE_METADATA['/'].description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '35 Radio Street',
      addressLocality: 'Alberton',
      addressRegion: 'Gauteng',
      postalCode: '1449',
      addressCountry: 'ZA',
    },
    areaServed: ['Alberton', 'Johannesburg', 'Gauteng'],
    ...(telephone ? { telephone } : {}),
    ...(contact.email?.trim() ? { email: contact.email.trim() } : {}),
    ...(contact.sameAs?.length ? { sameAs: contact.sameAs } : {}),
  };
};

export const productJsonLd = (product: any) => {
  const available = !/unavailable|out of stock|discontinued/i.test(product.availability || '') && product.stock !== 0;
  const images = [productImage(product), ...(Array.isArray(product.gallery) ? product.gallery.map((item: any) => (typeof item === 'string' ? item : item?.url)) : [])]
    .filter((url, index, list) => url && list.indexOf(url) === index)
    .map((url) => absoluteUrl(url));
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: customerSentences(product.description) || product.name,
      image: images,
      sku: product.sku || product.internalSku || product.id,
      category: product.category,
      ...(product.color && !/to confirm/i.test(product.color) ? { color: product.color } : {}),
      ...(product.material && !/to confirm/i.test(product.material) ? { material: product.material } : {}),
      brand: { '@type': 'Brand', name: SITE_NAME },
      offers: {
        '@type': 'Offer',
        url: absoluteUrl(productPath(product)),
        priceCurrency: product.currency || 'ZAR',
        price: Number(product.price || 0).toFixed(2),
        availability: available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition',
        seller: { '@id': `${SITE_URL}/#business` },
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Shop', item: absoluteUrl('/shop') },
        { '@type': 'ListItem', position: 3, name: product.name, item: absoluteUrl(productPath(product)) },
      ],
    },
  ];
};
