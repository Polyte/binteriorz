// Copy for the individual service pages (/services/:id) and shop category pages (/shop/:slug).
// Imported by the app and by scripts/prerender-seo.mjs, so keep this file free of imports.

export interface LandingMeta {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
}

export interface ServicePage extends LandingMeta {
  intro: string[];
  includes: string[];
  idealFor: string[];
  relatedCategories: string[];
}

export interface CategoryPage extends LandingMeta {
  name: string;
  intro: string;
  relatedService?: string;
}

export const categorySlug = (name: string) => String(name || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const SERVICE_PAGES: Record<string, ServicePage> = {
  'design-styling': {
    metaTitle: 'Interior Design & Styling in Alberton | B Interior Designz',
    metaDescription: 'Interior design and styling in Alberton and Johannesburg South: concept, space planning, finishes, furniture selection and final styling, coordinated in one place.',
    keywords: 'interior designer Alberton, interior design Johannesburg South, interior styling, space planning',
    intro: [
      'Good design starts with how a space needs to work. We begin with your brief, the purpose of the room and the way you live or work in it, then develop a design direction that brings furniture, colour, texture, lighting and accessories together.',
      'Whether you need a single room styled or a full home or office designed, we coordinate the selections so that every piece belongs, rather than being bought separately and hoping it works.',
    ],
    includes: ['Consultation and design brief', 'Concept development and design direction', 'Space planning and layout', 'Finishes, colour and material selection', 'Furniture and décor selection', 'Final styling and handover'],
    idealFor: ['Homeowners', 'New builds and renovations', 'Rental and holiday properties', 'Offices and practices'],
    relatedCategories: ['Sofas', 'Chairs', 'Tables'],
  },
  'bespoke-furniture': {
    metaTitle: 'Bespoke Furniture in Alberton | B Interior Designz',
    metaDescription: 'Custom couches, chairs, beds, headboards and tables made to your project requirements, designed and coordinated by B Interior Designz in Alberton.',
    keywords: 'bespoke furniture Alberton, custom couches Johannesburg, custom headboards, made to measure furniture',
    intro: [
      'When standard furniture does not fit the space, the brief or the look, we design pieces around your requirements. We work with trusted manufacturers to produce couches, chairs, beds, headboards, tables and other furniture to the size, fabric and finish your project needs.',
      'Every bespoke piece is chosen to work with the rest of the room, so it feels part of the design rather than an add-on.',
    ],
    includes: ['Custom couches and sofas', 'Accent and dining chairs', 'Beds and headboards', 'Coffee, side and dining tables', 'Fabric and finish selection', 'Coordination with manufacturers through to delivery'],
    idealFor: ['Awkward or unusual spaces', 'Specific size or fabric requirements', 'Hospitality and reception seating', 'Statement pieces'],
    relatedCategories: ['Sofas', 'Chairs', 'Beds', 'Tables'],
  },
  upholstery: {
    metaTitle: 'Upholstery & Furniture Refurbishment | B Interior Designz',
    metaDescription: 'Refresh existing sofas and chairs with new fabrics, finishes and upholstery. Furniture refurbishment for homes and businesses in Alberton and Johannesburg.',
    keywords: 'upholstery Alberton, reupholster couch Johannesburg, furniture refurbishment, recover chairs',
    intro: [
      'A well-made piece of furniture can often be given a new life. We refresh existing sofas, chairs and other pieces with new fabrics, finishes and upholstery chosen to suit the room they belong in.',
      'It is a practical way to update a space, keep furniture you value and bring it in line with a new design direction.',
    ],
    includes: ['Reupholstery of sofas and chairs', 'Fabric selection and sampling', 'Refinishing and finish updates', 'Coordination with your wider room design'],
    idealFor: ['Favourite or inherited pieces', 'Office and reception seating', 'B&Bs and guest houses', 'Budget-conscious refreshes'],
    relatedCategories: ['Sofas', 'Chairs'],
  },
  curtains: {
    metaTitle: 'Custom Curtains in Alberton | B Interior Designz',
    metaDescription: 'Made-to-measure curtains and window treatments in Alberton and Johannesburg South, including motorised and remote-controlled options where required.',
    keywords: 'curtains Alberton, custom curtains Johannesburg South, window treatments, motorised curtains',
    intro: [
      'Curtains shape how a room feels: light, privacy, warmth and softness. We help you choose fabrics and styles that suit the room, then coordinate tailored window solutions for your windows.',
      'Where it makes sense for the space, we can include motorised or remote-controlled systems.',
    ],
    includes: ['Fabric and style selection', 'Tailored curtains for your windows', 'Motorised and remote-controlled options where required', 'Coordination with the rest of the room'],
    idealFor: ['Living rooms and bedrooms', 'Large or double-volume windows', 'Offices and practices', 'Hospitality spaces'],
    relatedCategories: ['Curtains'],
  },
  'soft-furnishings': {
    metaTitle: 'Cushions & Soft Furnishings | B Interior Designz',
    metaDescription: 'Curated scatter cushions and customised soft furnishings that add colour, texture and personality. Shop cushions or have them made for your space.',
    keywords: 'scatter cushions South Africa, cushions Alberton, soft furnishings Johannesburg, custom cushions',
    intro: [
      'Cushions and soft furnishings are one of the quickest ways to change how a room feels. We curate cushion collections and customise soft furnishings to add colour, texture and personality.',
      'Shop our cushions in the showroom and online, or ask us to put a coordinated set together for your sofa, bed or reading corner.',
    ],
    includes: ['Curated cushion collections', 'Customised cushions and covers', 'Colour and texture layering', 'Styling advice for sofas and beds'],
    idealFor: ['Quick room refreshes', 'Seasonal updates', 'New sofas and beds', 'Gifts'],
    relatedCategories: ['Cushions'],
  },
  lighting: {
    metaTitle: 'Decorative Lighting & Pendants | B Interior Designz',
    metaDescription: 'Decorative and functional lighting, from table lamps to pendant lights, selected to complement your space by B Interior Designz in Alberton.',
    keywords: 'pendant lights South Africa, table lamps Alberton, decorative lighting Johannesburg',
    intro: [
      'Lighting does two jobs: it lets a room work, and it sets the mood. We select decorative and functional lighting, including table lamps and pendant lights, to complement the design of the space.',
    ],
    includes: ['Pendant and feature lighting', 'Table and floor lamps', 'Lighting selection as part of a room design'],
    idealFor: ['Living and dining rooms', 'Bedrooms', 'Reception areas', 'Statement features'],
    relatedCategories: ['Lamps', 'Pendant Lights'],
  },
  carpets: {
    metaTitle: 'Carpets & Rugs in Alberton | B Interior Designz',
    metaDescription: 'Rugs and carpets selected to support your design, from textured boucle to sculpted pile. Shop rugs or let us choose floor finishes for your room.',
    keywords: 'rugs Johannesburg, rugs Alberton, carpets Alberton, textured rugs South Africa',
    intro: [
      'The right rug anchors a room and ties the furniture together. We select carpets and rugs that support the overall design direction, considering size, texture and colour.',
    ],
    includes: ['Rug selection and sizing advice', 'Carpets and floor finishes', 'Texture and colour coordination'],
    idealFor: ['Living rooms', 'Bedrooms', 'Open-plan spaces', 'Offices'],
    relatedCategories: ['Rugs'],
  },
  decor: {
    metaTitle: 'Décor & Accessories in Alberton | B Interior Designz',
    metaDescription: 'Ornaments, artwork, plants, books and finishing pieces that complete a room. Shop décor in our Alberton showroom or book a styling service.',
    keywords: 'home décor Alberton, décor shop Johannesburg South, home accessories, interior styling',
    intro: [
      'Décor is what makes a space feel finished and personal. We source ornaments, artwork, plants, books, soft accessories and finishing pieces, and style them so the room feels complete.',
    ],
    includes: ['Ornaments and sculptural pieces', 'Artwork and wall décor', 'Plants, books and accessories', 'Shelf and table styling'],
    idealFor: ['Finishing a new space', 'Show houses and rentals', 'Décor-led refreshes', 'Gifts'],
    relatedCategories: ['Decor', 'Consoles'],
  },
  commercial: {
    metaTitle: 'Office & Hospitality Interior Design | B Interior Designz',
    metaDescription: 'Interior design for reception areas, offices, medical practices, B&Bs and hospitality spaces in Alberton and Johannesburg. One coordinated point of contact.',
    keywords: 'office interior design Alberton, medical practice interior design, hospitality interior design Johannesburg, B&B interior design',
    intro: [
      'Client-facing spaces say a lot about a business. We design and furnish reception areas, offices, medical practices, B&Bs and hospitality spaces that are welcoming, practical and durable.',
      'You get one coordinated point of contact across furniture, curtains, lighting, flooring and décor, from quotation through delivery, installation and styling.',
    ],
    includes: ['Reception and waiting areas', 'Offices and boardrooms', 'Medical and professional practices', 'B&Bs, guest houses and hospitality', 'Project coordination through installation'],
    idealFor: ['Medical practices', 'Professional offices', 'B&Bs and hotels', 'Property developers'],
    relatedCategories: ['Chairs', 'Tables', 'Consoles'],
  },
  refurbishment: {
    metaTitle: 'Home Refurbishment & Finishing | B Interior Designz',
    metaDescription: 'Targeted upgrades and coordinated improvements to existing homes and offices in Alberton and Johannesburg South, planned and managed by B Interior Designz.',
    keywords: 'home refurbishment Alberton, interior renovation Johannesburg South, room makeover',
    intro: [
      'Not every project needs to start from scratch. We plan targeted upgrades and coordinated improvements to existing spaces, so that new finishes, furniture and décor work together as one result.',
    ],
    includes: ['Assessment of the existing space', 'Planned, targeted upgrades', 'Finishes and furnishings coordination', 'Supplier coordination and installation'],
    idealFor: ['Dated rooms', 'Rental property upgrades', 'Pre-sale refreshes', 'Offices'],
    relatedCategories: [],
  },
};

export const CATEGORY_PAGES: Record<string, CategoryPage> = {
  tables: { name: 'Tables', relatedService: 'bespoke-furniture', metaTitle: 'Coffee, Side & Dining Tables | B Interior Designz', metaDescription: 'Shop coffee tables, side tables and dining tables in timber, marble and glass from B Interior Designz in Alberton.', keywords: 'coffee tables South Africa, side tables Alberton, dining tables Johannesburg', intro: 'Coffee tables, side tables and dining tables in timber, stone and glass, chosen to anchor living and dining spaces.' },
  cushions: { name: 'Cushions', relatedService: 'soft-furnishings', metaTitle: 'Scatter Cushions | B Interior Designz', metaDescription: 'Shop scatter cushions in rich colours, patterns and textures from B Interior Designz in Alberton. Layer them on sofas, chairs and beds.', keywords: 'scatter cushions South Africa, cushions Alberton, decorative cushions', intro: 'Scatter cushions in colour, pattern and texture, the quickest way to refresh a sofa, chair or bed.' },
  sofas: { name: 'Sofas', relatedService: 'bespoke-furniture', metaTitle: 'Sofas & Couches | B Interior Designz', metaDescription: 'Shop sofas and couches, from curved boucle to classic leather, at B Interior Designz in Alberton. Bespoke sizes and fabrics on request.', keywords: 'sofas Alberton, couches Johannesburg, boucle sofa South Africa, leather couch', intro: 'Sofas and couches from curved boucle to classic leather. Ask us about bespoke sizes and fabrics.' },
  chairs: { name: 'Chairs', relatedService: 'bespoke-furniture', metaTitle: 'Armchairs & Accent Chairs | B Interior Designz', metaDescription: 'Shop armchairs, accent chairs and statement seating at B Interior Designz in Alberton, for lounges, bedrooms and reading corners.', keywords: 'accent chairs South Africa, armchairs Alberton, occasional chairs Johannesburg', intro: 'Armchairs, accent chairs and statement seating for lounges, bedrooms and reading corners.' },
  rugs: { name: 'Rugs', relatedService: 'carpets', metaTitle: 'Rugs | B Interior Designz', metaDescription: 'Shop textured, sculpted and patterned rugs from B Interior Designz in Alberton to anchor your living room or bedroom.', keywords: 'rugs Johannesburg, rugs Alberton, textured rugs South Africa', intro: 'Textured, sculpted and patterned rugs that anchor a room and tie the furniture together.' },
  lamps: { name: 'Lamps', relatedService: 'lighting', metaTitle: 'Table & Floor Lamps | B Interior Designz', metaDescription: 'Shop table lamps and floor lamps in stone, brass and woven finishes from B Interior Designz in Alberton.', keywords: 'table lamps South Africa, lamps Alberton, floor lamps Johannesburg', intro: 'Table and floor lamps in stone, brass and woven finishes, for light that sets the mood.' },
  decor: { name: 'Decor', relatedService: 'decor', metaTitle: 'Home Décor & Accessories | B Interior Designz', metaDescription: 'Shop décor and accessories, from sculptural pieces to wall clocks, at B Interior Designz in Alberton.', keywords: 'home décor Alberton, décor accessories South Africa, decorative pieces', intro: 'Sculptural pieces, clocks and accessories that make a room feel finished and personal.' },
  curtains: { name: 'Curtains', relatedService: 'curtains', metaTitle: 'Curtains | B Interior Designz', metaDescription: 'Shop curtain fabrics and have curtains made for your windows by B Interior Designz in Alberton.', keywords: 'curtains Alberton, curtain fabric Johannesburg, custom curtains', intro: 'Curtain fabrics in calm, natural tones. We can tailor them to your windows.' },
  consoles: { name: 'Consoles', relatedService: 'decor', metaTitle: 'Consoles & Sideboards | B Interior Designz', metaDescription: 'Shop console tables and sideboards for entrances, living rooms and dining rooms at B Interior Designz in Alberton.', keywords: 'console tables South Africa, sideboards Alberton, TV units Johannesburg', intro: 'Console tables and sideboards for entrances, living rooms and dining rooms.' },
  'pendant-lights': { name: 'Pendant Lights', relatedService: 'lighting', metaTitle: 'Pendant Lights | B Interior Designz', metaDescription: 'Shop statement pendant lights for dining tables, entrances and living spaces from B Interior Designz in Alberton.', keywords: 'pendant lights South Africa, ceiling lights Alberton, statement lighting', intro: 'Statement pendant lights for dining tables, entrances and living spaces.' },
  beds: { name: 'Beds', relatedService: 'bespoke-furniture', metaTitle: 'Beds & Headboards | B Interior Designz', metaDescription: 'Shop beds and upholstered headboards from B Interior Designz in Alberton. Bespoke sizes and fabrics on request.', keywords: 'beds Alberton, upholstered headboards South Africa, bedroom furniture Johannesburg', intro: 'Beds and upholstered headboards for calm, layered bedrooms. Bespoke sizes on request.' },
};

export const categoryPageFor = (name: string) => CATEGORY_PAGES[categorySlug(name)];

/** Metadata for /services/:id and /shop/:slug, or undefined for any other path. */
export const landingMetadata = (pathname: string) => {
  const [, section, slug] = pathname.split('/');
  const page = section === 'services' ? SERVICE_PAGES[slug] : section === 'shop' ? CATEGORY_PAGES[slug] : undefined;
  return page ? { title: page.metaTitle, description: page.metaDescription, keywords: page.keywords } : undefined;
};

export const LANDING_ROUTES = [
  ...Object.keys(SERVICE_PAGES).map((id) => `/services/${id}`),
  ...Object.keys(CATEGORY_PAGES).map((slug) => `/shop/${slug}`),
];
