export interface HomepageImage {
  url: string;
  storagePath?: string;
  alt?: string;
}

export interface HomepageSectionBase {
  enabled: boolean;
  eyebrow: string;
  title: string;
}

export interface HomepageContent {
  version: number;
  updatedAt?: string;
  publishedAt?: string;
  sections: {
    hero: HomepageSectionBase & {
      slides: Array<{
        id: string;
        enabled: boolean;
        title: string;
        subtitle: string;
        tag: string;
        image: HomepageImage;
        video?: string;
        fit?: 'cover' | 'contain';
      }>;
    };
    catalogue: HomepageSectionBase;
    bespoke: HomepageSectionBase;
    categories: HomepageSectionBase;
    featured: HomepageSectionBase & {
      description: string;
      image: HomepageImage;
      detailImage: HomepageImage;
    };
    rooms: HomepageSectionBase & {
      description: string;
      items: Array<{
        name: string;
        slug: string;
        pieces: string;
        image: HomepageImage;
        video?: string;
      }>;
    };
    moodGallery: HomepageSectionBase & {
      images: HomepageImage[];
    };
    trust: HomepageSectionBase;
    services: HomepageSectionBase & {
      description: string;
      image: HomepageImage;
    };
    artisan: HomepageSectionBase & {
      description: string;
      image: HomepageImage;
    };
    newsletter: HomepageSectionBase & {
      description: string;
      image: HomepageImage;
    };
  };
}

const image = (url: string, alt: string): HomepageImage => ({ url, alt });

export const DEFAULT_HOMEPAGE_CONTENT: HomepageContent = {
  version: 1,
  sections: {
    hero: {
      enabled: true,
      eyebrow: 'Homepage hero',
      title: 'Hero carousel',
      slides: [
        {
          id: 'cinematic-living',
          enabled: true,
          video: 'https://www.youtube.com/embed/1v5hcZpOMUI?autoplay=1&mute=1&controls=0&loop=1&playlist=1v5hcZpOMUI&start=8&rel=0&iv_load_policy=3&vq=hd1080&enablejsapi=1&playsinline=1',
          image: image('/product-images/hero-living-curated.jpg', 'Bright classic living room with curved sofas and tall windows'),
          title: 'Curated Living',
          subtitle: 'Layered interiors, sculptural furniture and considered finishes, composed around the way you live.',
          tag: 'The House Edit',
        },
        {
          id: 'masterful-artistry',
          enabled: true,
          video: 'https://www.youtube.com/embed/NErMeyBrYTE?autoplay=1&mute=1&controls=0&loop=1&playlist=NErMeyBrYTE&rel=0&iv_load_policy=3&vq=hd1080&enablejsapi=1&playsinline=1',
          image: image('/product-images/hero-studio-artistry.jpg', 'Tailored study with tufted blue chesterfield sofa and chess table'),
          title: 'Bespoke Artistry',
          subtitle: 'Made-to-measure pieces and refined detailing, shaped by our studio for spaces with a distinct point of view.',
          tag: 'Inside the Design Studio',
        },
        {
          id: 'bespoke-office-setup',
          enabled: true,
          video: 'https://www.youtube.com/embed/LxpWWAdFSgs?autoplay=1&mute=1&controls=0&loop=1&playlist=LxpWWAdFSgs&rel=0&iv_load_policy=3&vq=hd1080&enablejsapi=1&playsinline=1',
          image: image('/product-images/bi-072.jpg', 'Bespoke office setup'),
          title: 'Bespoke Office Setup',
          subtitle: 'Tailored workspaces where considered storage, refined materials and focused comfort work beautifully together.',
          tag: 'The Executive Edit',
        },
        {
          id: 'timeless-craftsmanship',
          enabled: true,
          image: image('/product-images/hero-enduring-interiors.jpg', 'Timeless reception room with armchairs framed by a curtained bay window'),
          title: 'Enduring Interiors',
          subtitle: 'Timeless rooms grounded in honest materials, balanced proportions and craftsmanship made to last.',
          tag: 'The Signature Collection',
        },
        {
          id: 'sculpted-spaces',
          enabled: true,
          image: image('/product-images/hero-sculpted-spaces.jpg', 'Grand columned interior with draped curtains and a gold lattice screen'),
          title: 'Sculpted Spaces',
          subtitle: 'A study in proportion, light and materiality—where every element is composed to give the room its own quiet rhythm.',
          tag: 'The Spatial Edit',
        },
        {
          id: 'reflective-balance',
          enabled: true,
          image: image('/product-images/hero-reflective-balance.jpg', 'Living space with a mirrored feature wall and layered lighting'),
          title: 'Reflective Balance',
          subtitle: 'Art, light and sculptural forms meet in a composition designed to shift beautifully from every point of view.',
          tag: 'The Art of Composition',
        },
        {
          id: 'restful-retreats',
          enabled: true,
          image: image('/product-images/hero-restful-retreats.jpg', 'Serene bedroom with an upholstered bed against a marble feature wall'),
          title: 'Restful Retreats',
          subtitle: 'Private spaces layered with tactile comfort, softened light and a calm, deeply personal sense of luxury.',
          tag: 'Private Spaces',
        },
      ],
    },
    catalogue: { enabled: true, eyebrow: 'The collection', title: 'Shop the Catalogue' },
    bespoke: { enabled: true, eyebrow: 'Your bespoke journey', title: 'A considered process, from idea to home.' },
    categories: { enabled: true, eyebrow: 'Curated Selection', title: 'Refined Living' },
    featured: {
      enabled: true,
      eyebrow: 'Featured Piece',
      title: 'Where Material Meets Mastery',
      description: 'Each B Interior Designz piece begins as a dialogue between raw material and refined vision. Every element earns its place through merit, not convenience.',
      image: image('/product-images/bi-057.jpg', 'Featured B Interior Designz craftsmanship'),
      detailImage: image('/product-images/bi-094.jpg', 'Material and joinery detail'),
    },
    rooms: {
      enabled: true,
      eyebrow: 'Shop by Room',
      title: 'Find Your Space',
      description: 'Every room tells a story. Explore curated collections designed for the way you live.',
      items: [
        { name: 'Living Room', slug: 'living-room', pieces: 'Sofas, Coffee Tables, Shelving', image: image('/product-images/bi-057.jpg', 'Living room collection') },
        {
          name: 'Bedroom',
          slug: 'bedroom',
          pieces: 'Beds, Nightstands, Wardrobes',
          image: image('/product-images/bi-100.jpg', 'Bedroom collection'),
          video: 'https://www.youtube.com/embed/gBv6sOXVG08?autoplay=1&mute=1&controls=0&loop=1&playlist=gBv6sOXVG08&rel=0&iv_load_policy=3&playsinline=1',
        },
        { name: 'Dining Room', slug: 'dining-room', pieces: 'Dining Tables, Chairs, Sideboards', image: image('/product-images/bi-091.jpg', 'Dining room collection') },
        {
          name: 'Home Office',
          slug: 'home-office',
          pieces: 'Desks, Bookshelves, Task Chairs',
          image: image('/product-images/bi-072.jpg', 'Home office collection'),
          video: 'https://www.youtube.com/embed/pKwzfvIEiBs?autoplay=1&mute=1&controls=0&loop=1&playlist=pKwzfvIEiBs&start=30&rel=0&iv_load_policy=3&playsinline=1',
        },
        { name: 'Outdoor', slug: 'outdoor', pieces: 'Lounge Sets, Planters, Lighting', image: image('/product-images/bi-115.jpg', 'Outdoor collection') },
      ],
    },
    moodGallery: {
      enabled: true,
      eyebrow: 'The Mood',
      title: 'Curated Interiors',
      images: [
        image('/product-images/bi-057.jpg', 'Curated interior mood 1'),
        image('/product-images/bi-094.jpg', 'Curated interior mood 2'),
        image('/product-images/bi-010.jpg', 'Curated interior mood 3'),
        image('/product-images/bi-167.jpg', 'Curated interior mood 4'),
        image('/product-images/bi-100.jpg', 'Curated interior mood 5'),
        image('/product-images/bi-023.jpg', 'Curated interior mood 6'),
      ],
    },
    trust: { enabled: true, eyebrow: 'Why B Interior Designz', title: 'Built on Principle' },
    services: {
      enabled: true,
      eyebrow: 'Our Services',
      title: 'Bespoke Interior Decor Services',
      description: 'Based in Alberton, B Interior Designz provides end-to-end decor solutions for discerning clients — from residential sanctuaries to corporate boardrooms.',
      image: image('/product-images/bi-036.jpg', 'B Interior Designz design consultation'),
    },
    artisan: {
      enabled: true,
      eyebrow: 'The Guild',
      title: 'For the Artisans',
      description: "Showcase your craftsmanship alongside the world's most refined collections. Join our network of verified luxury vendors.",
      image: image('/product-images/bi-151.jpg', 'B Interior Designz artisan guild'),
    },
    newsletter: {
      enabled: true,
      eyebrow: 'The Inner Circle',
      title: 'Stay Inspired with B Interior Designz',
      description: 'Be the first to receive exclusive previews of our new collections, artisan stories, and bespoke interior inspiration.',
      image: image('/product-images/bi-040.jpg', 'B Interior Designz interior inspiration'),
    },
  },
};

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export const normalizeHomepageContent = (value?: Partial<HomepageContent> | null): HomepageContent => {
  const defaults = clone(DEFAULT_HOMEPAGE_CONTENT);
  if (!value?.sections) return defaults;

  const incomingSections = value.sections as Partial<HomepageContent['sections']>;
  const sections = { ...defaults.sections } as HomepageContent['sections'];
  (Object.keys(defaults.sections) as Array<keyof HomepageContent['sections']>).forEach((key) => {
    const incoming = incomingSections[key];
    if (incoming) sections[key] = { ...defaults.sections[key], ...incoming } as never;
  });

  const incomingHeroSlides = incomingSections.hero?.slides;
  if (Array.isArray(incomingHeroSlides)) {
    const incomingById = new Map(incomingHeroSlides.map((slide) => [slide.id, slide]));
    const defaultIds = new Set(defaults.sections.hero.slides.map((slide) => slide.id));
    sections.hero.slides = [
      ...defaults.sections.hero.slides.map((slide) => ({ ...slide, ...(incomingById.get(slide.id) || {}) })),
      ...incomingHeroSlides.filter((slide) => !defaultIds.has(slide.id)),
    ];
  }

  return {
    ...defaults,
    ...value,
    sections,
  };
};
