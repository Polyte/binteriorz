import React from 'react';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router';

interface Room {
  name: string;
  slug: string;
  image: string;
  pieces: string;
  span: string;
  aspect: string;
}

const rooms: Room[] = [
  {
    name: 'Living Room',
    slug: 'living-room',
    image:
      'https://images.unsplash.com/photo-1728649060658-8e64dccf2711?auto=format&fit=crop&q=80&w=1200',
    pieces: 'Sofas, Coffee Tables, Shelving',
    span: 'md:col-span-2 md:row-span-2',
    aspect: 'aspect-[4/5] md:aspect-auto md:h-full',
  },
  {
    name: 'Bedroom',
    slug: 'bedroom',
    image:
      'https://images.unsplash.com/photo-1560185128-e173042f79dd?auto=format&fit=crop&q=80&w=1080',
    pieces: 'Beds, Nightstands, Wardrobes',
    span: '',
    aspect: 'aspect-[4/3]',
  },
  {
    name: 'Dining Room',
    slug: 'dining-room',
    image:
      'https://images.unsplash.com/photo-1663756915302-437cd36f4cfd?auto=format&fit=crop&q=80&w=1080',
    pieces: 'Dining Tables, Chairs, Sideboards',
    span: '',
    aspect: 'aspect-[4/3]',
  },
  {
    name: 'Home Office',
    slug: 'home-office',
    image:
      'https://images.unsplash.com/photo-1699831112447-9c8c803f584b?auto=format&fit=crop&q=80&w=1080',
    pieces: 'Desks, Bookshelves, Task Chairs',
    span: '',
    aspect: 'aspect-[4/3]',
  },
  {
    name: 'Outdoor',
    slug: 'outdoor',
    image:
      'https://images.unsplash.com/photo-1768527339600-3127e34acdad?auto=format&fit=crop&q=80&w=1080',
    pieces: 'Lounge Sets, Planters, Lighting',
    span: '',
    aspect: 'aspect-[4/3]',
  },
];

export const ShopByRoom = () => {
  return (
    <section className="py-28 md:py-36 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 md:mb-20 gap-6"
        >
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-px bg-neutral-300" />
              <span
                className="text-[10px] uppercase tracking-[0.5em] text-neutral-400 font-bold"
                style={{ fontFamily: 'var(--font-josefin)' }}
              >
                Shop by Room
              </span>
            </div>
            <h2
              className="text-4xl md:text-5xl lg:text-6xl text-neutral-900 leading-tight tracking-tight"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Find Your Space
            </h2>
          </div>
          <p
            className="text-base md:text-lg text-neutral-400 max-w-sm leading-relaxed"
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            Every room tells a story. Explore curated collections designed for
            the way you live.
          </p>
        </motion.div>

        {/* Asymmetric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4 auto-rows-auto">
          {rooms.map((room, i) => (
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
                {/* Image */}
                <ImageWithFallback
                  src={room.image}
                  alt={room.name}
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-[1.2s] ease-out group-hover:scale-110 grayscale-[0.1] group-hover:grayscale-0"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />

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