import React from 'react';
import { Instagram, Facebook, Twitter, Mail, MapPin, Phone } from 'lucide-react';
const logo = "/logo.png";

export const Footer = () => {
  return (
    <footer className="relative z-20 bg-neutral-900 pt-24 pb-28 text-white md:pb-12">
      <div className="relative z-10 max-w-[1480px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black rounded-full overflow-hidden border border-neutral-700">
                <img src={logo} alt="B-Interiors" className="w-full h-full object-contain" />
              </div>
              <span className="text-2xl font-serif font-bold tracking-tighter uppercase">B-Interiors</span>
            </div>
            <p className="text-neutral-400 leading-relaxed">
              Premium custom furniture and interior decor services. Crafting elegance for homes and businesses across Alberton and beyond.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-neutral-800 rounded-full hover:bg-neutral-700 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-neutral-800 rounded-full hover:bg-neutral-700 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-neutral-800 rounded-full hover:bg-neutral-700 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm uppercase tracking-widest font-bold mb-8">Quick Links</h4>
            <ul className="space-y-4 text-neutral-400">
              <li><a href="#" className="hover:text-white transition-colors">All Furniture</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Bespoke Services</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Office Collections</a></li>
              <li><a href="#" className="hover:text-white transition-colors">About B-Interiors</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm uppercase tracking-widest font-bold mb-8">Partnerships</h4>
            <ul className="space-y-4 text-neutral-400">
              <li><a href="/become-a-partner" className="hover:text-white transition-colors">Become an Artisan</a></li>
              <li><a href="/become-a-partner" className="hover:text-white transition-colors">Vendor Login</a></li>
              <li><a href="/become-a-partner" className="hover:text-white transition-colors">The Guild Program</a></li>
              <li><a href="/become-a-partner" className="hover:text-white transition-colors">Logistics Network</a></li>
              <li><a href="/become-a-partner" className="hover:text-white transition-colors">Sustainability Seal</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm uppercase tracking-widest font-bold mb-8">Contact Info</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4 text-neutral-400">
                <MapPin className="w-5 h-5 flex-shrink-0 text-white" />
                <span>123 Design Quarter, Alberton, South Africa</span>
              </li>
              <li className="flex items-center gap-4 text-neutral-400">
                <Phone className="w-5 h-5 flex-shrink-0 text-white" />
                <span>+27 11 123 4567</span>
              </li>
              <li className="flex items-center gap-4 text-neutral-400">
                <Mail className="w-5 h-5 flex-shrink-0 text-white" />
                <span>hello@b-interiors.co.za</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-neutral-800 text-center text-neutral-500 text-sm">
          <p>© {new Date().getFullYear()} B-Interiors. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
