import type { HomepageImage } from './homepage';

export type CompanyImage = HomepageImage;

export interface CompanyCard {
  id: string;
  title: string;
  text: string;
  image?: CompanyImage;
}

export interface CompanySectionBase {
  enabled: boolean;
  eyebrow: string;
  title: string;
}

export interface CompanyContent {
  version: number;
  updatedAt?: string;
  sections: {
    hero: CompanySectionBase & { tagline: string; intro: string; image: CompanyImage };
    about: CompanySectionBase & { paragraphs: string[]; image: CompanyImage; secondaryImage: CompanyImage };
    promise: CompanySectionBase & { intro: string; points: string[]; image: CompanyImage };
    services: CompanySectionBase & { intro: string; items: CompanyCard[] };
    experience: CompanySectionBase & { intro: string; steps: string[]; image: CompanyImage };
    clients: CompanySectionBase & { items: string[] };
    whyUs: CompanySectionBase & { items: string[] };
    portfolio: CompanySectionBase & { intro: string; items: CompanyCard[] };
    vision: CompanySectionBase & { vision: string; mission: string; image: CompanyImage };
    values: CompanySectionBase & { items: CompanyCard[] };
    cta: CompanySectionBase & { text: string; image: CompanyImage };
  };
  contact: {
    whatsapp: string;
    email: string;
    phone: string;
    address: string;
    instagram: string;
    tiktok: string;
    facebook: string;
  };
}

const image = (url: string, alt: string): CompanyImage => ({ url, alt });
const card = (id: string, title: string, text: string, img?: CompanyImage): CompanyCard => ({ id, title, text, ...(img ? { image: img } : {}) });

export const COMPANY_NAME = 'B Interior Designz';

export const DEFAULT_COMPANY_CONTENT: CompanyContent = {
  version: 1,
  sections: {
    hero: {
      enabled: true,
      eyebrow: 'Interior Design • Bespoke Furniture • Décor',
      title: 'B Interior Designz',
      tagline: 'Elevating spaces through considered design, bespoke detail and personalised service.',
      intro: '',
      image: image('/product-images/hero-living-curated.jpg', 'Bright living room with curved sofas and tall windows'),
    },
    about: {
      enabled: true,
      eyebrow: 'Who we are',
      title: 'Refined, functional and personalised spaces.',
      paragraphs: [
        'B Interior Designz is an interior design and décor company creating refined, functional and personalised spaces for residential, commercial and hospitality clients. We bring together design, furniture, soft furnishings, décor and refurbishment to deliver a cohesive look from concept through to completion.',
        'Our approach is personal and practical: we understand the client’s brief, work within the project requirements and coordinate trusted suppliers and manufacturers to bring the vision to life.',
      ],
      image: image('/product-images/bi-066.jpg', 'Showroom lounge with layered seating and sculptural mirrors'),
      secondaryImage: image('/product-images/bi-187.jpg', 'Styled shelving with curated cushions and décor'),
    },
    promise: {
      enabled: true,
      eyebrow: 'Our design promise',
      title: 'We do more than fill a room.',
      intro: 'We help our clients create spaces that feel intentional, welcoming and distinctive.',
      points: [
        'Design-led solutions tailored to the purpose and character of each space.',
        'Customised furniture and finishes where standard options do not meet the brief.',
        'Coordinated sourcing across furniture, curtains, cushions, lighting, carpets and décor.',
        'Professional project coordination from quotation and sourcing through delivery, installation and styling.',
        'Solutions that balance aesthetics, functionality, quality and budget.',
      ],
      image: image('/product-images/bi-135.jpg', 'Layered lounge with sculptural seating and pendant lighting'),
    },
    services: {
      enabled: true,
      eyebrow: 'Our services',
      title: 'Everything your space needs, coordinated in one place.',
      intro: 'From a single statement piece to a full refurbishment, each service can stand alone or work together as one cohesive project.',
      items: [
        card('design-styling', 'Interior Design & Styling', 'Concept development, space planning, finishes, furniture selection and final styling.', image('/product-images/bi-146.jpg', 'Styled living room with cream sofa')),
        card('bespoke-furniture', 'Bespoke Furniture', 'Custom couches, chairs, beds, headboards, tables and other furniture made to project requirements.', image('/product-images/bi-163.jpg', 'Green chesterfield sofa with timber coffee table')),
        card('upholstery', 'Upholstery & Refurbishment', 'Refreshing existing furniture through new fabrics, finishes and upholstery.', image('/product-images/bi-114.jpg', 'Leather upholstery detail with buckle strap')),
        card('curtains', 'Curtains & Window Treatments', 'Curtains and tailored window solutions, including options for motorised/remote-controlled systems where required.', image('/product-images/bi-004.jpg', 'Curtain fabric drapes')),
        card('soft-furnishings', 'Cushions & Soft Furnishings', 'Curated cushion collections and customised soft furnishings that add colour, texture and personality.', image('/product-images/bi-187.jpg', 'Curated cushions on styled shelving')),
        card('lighting', 'Lighting', 'Decorative and functional lighting selected to complement the space.', image('/product-images/bi-227.jpg', 'Sculptural ring pendant light')),
        card('carpets', 'Carpets & Rugs', 'Floor finishes selected to support the overall design direction.', image('/product-images/bi-014.jpg', 'Textured woven rug detail')),
        card('decor', 'Décor & Accessories', 'Ornaments, artwork, plants, books, soft accessories and finishing pieces.', image('/product-images/bi-117.jpg', 'Sculptural vases on a round coffee table')),
        card('commercial', 'Commercial & Hospitality Interiors', 'Reception areas, offices, medical practices, B&Bs and hospitality spaces.', image('/product-images/bi-173.jpg', 'Lounge seating area with swivel chairs')),
        card('refurbishment', 'Refurbishment & Finishing', 'Targeted upgrades and coordinated improvements to existing spaces.', image('/product-images/hero-reflective-balance.jpg', 'Refurbished living space with feature wall')),
      ],
    },
    experience: {
      enabled: true,
      eyebrow: 'The B Interior experience',
      title: 'From first conversation to final styling.',
      intro: 'Our clients can engage us for a focused décor refresh or a broader transformation. We coordinate the key elements of the space so that furniture, colour, texture, lighting and accessories work together rather than being treated as separate purchases.',
      steps: [
        'Consultation & brief',
        'Design direction and product selection',
        'Quotation and project approval',
        'Supplier/manufacturer coordination',
        'Production, delivery and installation',
        'Final styling and project handover',
      ],
      image: image('/product-images/bi-121.jpg', 'Marble console with brass table lamps'),
    },
    clients: {
      enabled: true,
      eyebrow: 'Who we work with',
      title: 'Spaces for living, working and hosting.',
      items: [
        'Homeowners and private clients',
        'Medical practices and professional offices',
        'B&Bs, hotels and hospitality businesses',
        'Property developers and property owners',
        'Businesses looking to refresh reception, office or client-facing spaces',
      ],
    },
    whyUs: {
      enabled: true,
      eyebrow: 'Why clients choose us',
      title: 'Why clients choose B Interior Designz',
      items: [
        'Personal attention to each project',
        'Customisation rather than a one-size-fits-all approach',
        'One coordinated point of contact across multiple interior categories',
        'Access to supplier and manufacturing relationships',
        'Focus on practical solutions as well as aesthetics',
        'Commitment to professional communication and project follow-through',
      ],
    },
    portfolio: {
      enabled: true,
      eyebrow: 'Selected project experience',
      title: 'Project portfolio',
      intro: 'Our project work includes bedroom transformations, bespoke furniture and upholstery, commercial and medical-office spaces, reception areas, hospitality opportunities and décor-led refreshes.',
      items: [
        card('bedroom', 'Bedroom transformations', 'Calm, layered bedrooms with tailored bedding, lighting and window treatments.', image('/product-images/bi-213.jpg', 'Styled bedroom with white bedding and pendant lights')),
        card('bespoke-upholstery', 'Bespoke furniture & upholstery', 'Made-to-measure seating and refreshed pieces finished in fabrics chosen for the space.', image('/product-images/bi-063.jpg', 'Patterned upholstered armchair')),
        card('reception', 'Reception & office spaces', 'Welcoming client-facing areas for practices and professional offices.', image('/product-images/bi-173.jpg', 'Reception-style lounge seating')),
        card('decor-refresh', 'Décor-led refreshes', 'Targeted styling with cushions, accessories and art that lift an existing room.', image('/product-images/bi-198.jpg', 'Lounge refreshed with cushions and décor')),
      ],
    },
    vision: {
      enabled: true,
      eyebrow: 'Vision & mission',
      title: 'Where we are going',
      vision: 'To become a trusted interior design and lifestyle brand known for distinctive spaces, quality solutions and strong client relationships.',
      mission: 'To transform spaces through thoughtful design, personalised service and reliable execution, while building lasting relationships with our clients, suppliers and partners.',
      image: image('/product-images/hero-sculpted-spaces.jpg', 'Grand interior with columns and draped curtains'),
    },
    values: {
      enabled: true,
      eyebrow: 'Our values',
      title: 'What guides every project',
      items: [
        card('client-focus', 'Client Focus', "We start with the client's needs and design around the purpose of the space."),
        card('quality', 'Quality', 'We pay attention to materials, workmanship and the finished result.'),
        card('creativity', 'Creativity', 'We bring fresh ideas and practical design thinking to every brief.'),
        card('professionalism', 'Professionalism', 'We communicate clearly, coordinate responsibly and take ownership.'),
        card('integrity', 'Integrity', 'We aim to be transparent and accountable throughout each project.'),
        card('collaboration', 'Collaboration', 'We work closely with clients, suppliers and specialists to achieve the desired result.'),
      ],
    },
    cta: {
      enabled: true,
      eyebrow: 'Get in touch',
      title: "Let's transform your space",
      text: 'Whether you are furnishing one room, refreshing a reception area, upgrading a medical practice, styling a hospitality space or planning a larger refurbishment, B Interior Designz is ready to assist.',
      image: image('/product-images/hero-restful-retreats.jpg', 'Serene bedroom with marble feature wall'),
    },
  },
  contact: {
    whatsapp: '',
    email: '',
    phone: '',
    address: '35 Radio Street, Alberton, Johannesburg, 1449',
    instagram: '',
    tiktok: '',
    facebook: '',
  },
};

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export const normalizeCompanyContent = (value?: Partial<CompanyContent> | null): CompanyContent => {
  const defaults = clone(DEFAULT_COMPANY_CONTENT);
  if (!value || typeof value !== 'object') return defaults;
  const incoming = (value.sections || {}) as Partial<CompanyContent['sections']>;
  const sections = { ...defaults.sections } as CompanyContent['sections'];
  (Object.keys(defaults.sections) as Array<keyof CompanyContent['sections']>).forEach((key) => {
    if (incoming[key]) sections[key] = { ...defaults.sections[key], ...incoming[key] } as never;
  });
  return { ...defaults, ...value, sections, contact: { ...defaults.contact, ...(value.contact || {}) } };
};

/** Turns a WhatsApp number in any local format into a wa.me link, or '' when blank. */
export const whatsappLink = (number: string, message = '') => {
  let digits = number.replace(/[^0-9]/g, '');
  if (!digits) return '';
  if (digits.startsWith('0')) digits = `27${digits.slice(1)}`;
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
};

/** Accepts a full URL or an @handle and returns a profile URL, or '' when blank. */
export const socialLink = (value: string, base: string) => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `${base}${trimmed.replace(/^@/, '')}`;
};
