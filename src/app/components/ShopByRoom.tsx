import React from 'react';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router';

interface Room {
  name: string;
  slug: string;
  image: string;
  video?: string;
  pieces: string;
  span: string;
  aspect: string;
}

const defaultRooms: Room[] = [
  {
    name: 'Living Room',
    slug: 'living-room',
    image: '/product-images/bi-057.jpg',
    pieces: 'Sofas, Coffee Tables, Shelving',
    span: 'md:col-span-2 md:row-span-2',
    aspect: 'aspect-[4/5] md:aspect-auto md:h-full',
  },
  {
    name: 'Bedroom',
    slug: 'bedroom',
    image: '/product-images/bi-100.jpg',
    video: 'https://www.youtube.com/embed/gBv6sOXVG08?autoplay=1&mute=1&controls=0&loop=1&playlist=gBv6sOXVG08&rel=0&iv_load_policy=3&playsinline=1',
    pieces: 'Beds, Nightstands, Wardrobes',
    span: '',
    aspect: 'aspect-[4/3]',
  },
  {
    name: 'Dining Room',
    slug: 'dining-room',
    image: '/product-images/bi-091.jpg',
    pieces: 'Dining Tables, Chairs, Sideboards',
    span: '',
    aspect: 'aspect-[4/3]',
  },
  {
    name: 'Home Office',
    slug: 'home-office',
    image: '/product-images/bi-072.jpg',
    video: 'https://www.youtube.com/embed/pKwzfvIEiBs?autoplay=1&mute=1&controls=0&loop=1&playlist=pKwzfvIEiBs&start=30&rel=0&iv_load_policy=3&playsinline=1',
    pieces: 'Desks, Bookshelves, Task Chairs',
    span: '',
    aspect: 'aspect-[4/3]',
  },
  {
    name: 'Outdoor',
    slug: 'outdoor',
    image: '/product-images/bi-115.jpg',
    pieces: 'Lounge Sets, Planters, Lighting',
    span: '',
    aspect: 'aspect-[4/3]',
  },
];

interface ShopByRoomProps {
  rooms?: Array<Pick<Room, 'name' | 'slug' | 'image' | 'video' | 'pieces'>>;
  eyebrow?: string;
  title?: string;
  description?: string;
}

export const ShopByRoom = ({ rooms = defaultRooms, eyebrow = 'Shop by Room', title = 'Find Your Space', description = 'Every room tells a story. Explore curated collections designed for the way you live.' }: ShopByRoomProps) => {
  const displayRooms: Room[] = rooms.map((room, index) => ({
    ...room,
    span: index === 0 ? 'md:col-span-2 md:row-span-2' : '',
    aspect: index === 0 ? 'aspect-[4/5] md:aspect-auto md:h-full' : 'aspect-[16/10]',
  }));
  return (
    <section className="overflow-hidden bg-white py-16 md:py-20">
      <div className="max-w-[1480px] mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 flex flex-col items-start justify-between gap-6 md:mb-12 md:flex-row md:items-end"
        >
          <div>
            <div className="mb-5 flex items-center gap-3">
              <div className="w-10 h-px bg-neutral-300" />
              <span
                className="text-[10px] uppercase tracking-[0.5em] text-neutral-400 font-bold"
                style={{ fontFamily: 'var(--font-josefin)' }}
              >
                {eyebrow}
              </span>
            </div>
            <h2
              className="text-4xl md:text-5xl lg:text-6xl text-neutral-900 leading-tight tracking-tight"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {title}
            </h2>
          </div>
          <p
            className="text-base md:text-lg text-neutral-400 max-w-sm leading-relaxed"
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            {description}
          </p>
        </motion.div>

        {/* Asymmetric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4 auto-rows-auto">
          {displayRooms.map((room, i) => (
            <motion.div
              key={room.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                delay: i * 0.08,
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`${room.span}`}
            >
              <Link
                to={`/shop?room=${room.slug}`}
                className={`group relative block overflow-hidden ${room.aspect} h-full`}
              >
                {/* Framed image with warm, editorial color on hover */}
                <div className="absolute inset-0 overflow-hidden">
                  {room.video ? (
                    <iframe
                      src={room.video}
                      title={`${room.name} collection video`}
                      loading="lazy"
                      tabIndex={-1}
                      aria-hidden="true"
                      allow="autoplay; encrypted-media; picture-in-picture"
                      className="pointer-events-none absolute left-1/2 top-1/2 h-full w-[112%] max-w-none -translate-x-1/2 -translate-y-1/2 transition-transform duration-1000 ease-out group-hover:scale-[1.04]"
                    />
                  ) : (
                    <ImageWithFallback
                      src={room.image}
                      alt={room.name}
                      className="h-full w-full object-cover transition-[transform,filter] duration-1000 ease-out group-hover:scale-[1.07] group-hover:saturate-[1.12] group-hover:contrast-[1.03]"
                    />
                  )}
                </div>
                <div aria-hidden="true" className="pointer-events-none absolute inset-3 border border-white/0 transition-all duration-700 group-hover:inset-5 group-hover:border-white/35" />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent opacity-70 transition-opacity duration-700 group-hover:opacity-95" />

                {/* Content */}
                <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                  <div className="transition-transform duration-500 group-hover:-translate-y-2">
                    <p
                      className="text-[9px] uppercase tracking-[0.4em] text-white/50 mb-2 font-bold"
                      style={{ fontFamily: 'var(--font-josefin)' }}
                    >
                      {room.pieces}
                    </p>
                    <div className="flex items-end justify-between gap-4">
                      <h3
                        className="text-2xl md:text-3xl text-white tracking-tight leading-none"
                        style={{ fontFamily: 'var(--font-playfair)' }}
                      >
                        {room.name}
                      </h3>
                      <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-500 flex-shrink-0">
                        <ArrowUpRight className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Animated underline */}
                  <div className="mt-4 h-[2px] w-0 bg-white/60 transition-all duration-700 group-hover:w-full" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
