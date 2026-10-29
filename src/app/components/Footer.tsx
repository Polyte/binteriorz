import React from 'react';
import { Link } from 'react-router';
import { useCompanyContent } from '../content/CompanyContentContext';
import { COMPANY_NAME } from '../content/company';
import { contactEntries } from './company/CompanyBlocks';
const logo = "/logo.png";

const socialKeys = ['instagram', 'tiktok', 'facebook'];

export const Footer = () => {
  const content = useCompanyContent();
  const entries = contactEntries(content.contact);
  const socials = entries.filter((entry) => socialKeys.includes(entry.key));
  const details = entries.filter((entry) => !socialKeys.includes(entry.key));

  return (
    <footer className="relative z-20 bg-neutral-900 pt-24 pb-28 text-white md:pb-12">
      <div className="relative z-10 max-w-[1480px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black rounded-full overflow-hidden border border-neutral-700">
                <img src={logo} alt={COMPANY_NAME} className="w-full h-full object-contain" />
              </div>
              <span className="text-2xl font-serif font-bold tracking-tighter uppercase">{COMPANY_NAME}</span>
            </div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-[#d7b96a]">Interior Design • Bespoke Furniture • Décor • Refurbishment</p>
            <p className="text-neutral-400 leading-relaxed">{content.sections.hero.tagline}</p>
            {socials.length > 0 && (
              <div className="flex space-x-4">
                {socials.map(({ key, label, href, icon: Icon }) => (
                  <a key={key} href={href} target="_blank" rel="noreferrer" aria-label={label} className="p-2 bg-neutral-800 rounded-full hover:bg-neutral-700 transition-colors">
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-sm uppercase tracking-widest font-bold mb-8">Explore</h2>
            <ul className="space-y-4 text-neutral-400">
              <li><Link to="/shop" className="hover:text-white transition-colors">Shop the Collection</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Our Services</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm uppercase tracking-widest font-bold mb-8">Services</h2>
            <ul className="space-y-4 text-neutral-400">
              {content.sections.services.items.slice(0, 5).map((service) => (
                <li key={service.id}><Link to={`/services/${service.id}`} className="hover:text-white transition-colors">{service.title}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm uppercase tracking-widest font-bold mb-8">Contact Info</h2>
            <ul className="space-y-6">
              {details.map(({ key, value, href, icon: Icon }) => (
                <li key={key} className="flex items-start gap-4 text-neutral-400">
                  <Icon className="w-5 h-5 flex-shrink-0 text-white" />
                  <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="hover:text-white transition-colors">{value}</a>
                </li>
              ))}
              <li><Link to="/become-a-partner" className="text-neutral-400 hover:text-white transition-colors">Partner with us</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-neutral-800 text-center text-neutral-500 text-sm">
          <p>© {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
