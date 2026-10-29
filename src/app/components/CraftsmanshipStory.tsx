import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Hammer, Palette, Ruler, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';

interface CraftsmanshipStoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CraftsmanshipStory = ({ isOpen, onClose }: CraftsmanshipStoryProps) => {
  const [isBooking, setIsBooking] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [showFilm, setShowFilm] = useState(false);

  const handleBookVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (window.navigator.vibrate) window.navigator.vibrate(50);
    setIsBooked(true);
    toast.success("Workshop visit request sent");
  };

  const toggleBooking = () => {
    if (window.navigator.vibrate) window.navigator.vibrate(10);
    setIsBooking(!isBooking);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-neutral-900/95 backdrop-blur-md z-[200] flex items-center justify-center p-4 md:p-8"
          >
            {/* Grain Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.8, bounce: 0.3 }}
              className="relative w-full max-w-5xl bg-neutral-50 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[90vh] md:h-auto md:aspect-[16/10]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image Section */}
              <div className="w-full md:w-1/2 h-48 md:h-full relative overflow-hidden">
                <ImageWithFallback 
                  src="/product-images/bi-089.jpg"
                  alt="Craftsmanship"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:bg-gradient-to-r" />
                
                <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 text-white">
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-3 mb-2"
                  >
                    <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center backdrop-blur-sm">
                      <ShieldCheck className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Heritage Verified</span>
                  </motion.div>
                  <motion.h2 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-3xl md:text-5xl font-serif"
                  >
                    The Alberton <br /> Workshop
                  </motion.h2>
                </div>
              </div>

              {/* Content Section */}
              <div className="flex-1 p-8 md:p-16 flex flex-col justify-center relative overflow-y-auto">
                <button 
                  onClick={onClose}
                  className="absolute top-6 right-6 p-3 bg-neutral-100 rounded-full hover:bg-neutral-900 hover:text-white transition-all duration-300 z-10"
                >
                  <X className="w-5 h-5" />
                </button>

                <AnimatePresence mode="wait">
                  {!isBooking ? (
                    <motion.div 
                      key="story"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-12"
                    >
                      <div className="space-y-4">
                        <span className="text-[10px] uppercase tracking-[0.5em] text-neutral-400 font-bold">Our Philosophy</span>
                        <h3 className="text-2xl md:text-3xl font-serif text-neutral-900 leading-tight">
                          Where heritage meets <br /> contemporary precision.
                        </h3>
                        <p className="text-neutral-500 font-light leading-relaxed">
                          At B-Interiors, every piece is more than furniture; it's a testament to the tactile 
                          beauty of natural materials. Our Alberton workshop brings together master 
                          artisans and advanced CNC precision.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 text-neutral-900">
                            <Hammer className="w-4 h-4" />
                            <h4 className="text-[9px] uppercase tracking-widest font-bold">Noble Materials</h4>
                          </div>
                          <p className="text-[11px] text-neutral-500 leading-relaxed">
                            Sustainable Oak, Walnut, and ethically gathered marbles.
                          </p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 text-neutral-900">
                            <Palette className="w-4 h-4" />
                            <h4 className="text-[9px] uppercase tracking-widest font-bold">Manual Finish</h4>
                          </div>
                          <p className="text-[11px] text-neutral-500 leading-relaxed">
                            Hand-sanded and finished with natural oils.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setShowFilm(true)}
                          className="flex-1 bg-neutral-100 text-neutral-900 py-4 px-8 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-neutral-200 transition-colors"
                        >
                          View Workshop Film
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={toggleBooking}
                          className="flex-1 bg-neutral-900 text-white py-4 px-8 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-xl shadow-neutral-900/10"
                        >
                          <Calendar className="w-4 h-4" /> Book a Visit
                        </motion.button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="booking"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <button 
                        onClick={toggleBooking}
                        className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 hover:text-neutral-900 flex items-center gap-2 transition-colors mb-4"
                      >
                        <ArrowRight className="w-3 h-3 rotate-180" /> Back to Story
                      </button>

                      {isBooked ? (
                        <div className="py-12 flex flex-col items-center text-center space-y-6">
                          <motion.div
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shadow-inner"
                          >
                            <CheckCircle2 className="w-10 h-10" />
                          </motion.div>
                          <div className="space-y-2">
                            <h3 className="text-2xl font-serif text-neutral-900">Request Received</h3>
                            <p className="text-neutral-500 font-light max-w-xs mx-auto">
                              Our workshop curator will reach out within 24 hours to finalize your appointment.
                            </p>
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={onClose}
                            className="bg-neutral-900 text-white py-4 px-12 text-[10px] uppercase tracking-[0.4em] font-bold"
                          >
                            Close Experience
                          </motion.button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div>
                            <span className="text-[10px] uppercase tracking-[0.5em] text-neutral-400 font-bold">Personal Inquiry</span>
                            <h3 className="text-2xl md:text-3xl font-serif text-neutral-900">Experience the craft.</h3>
                          </div>
                          <form onSubmit={handleBookVisit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[9px] uppercase tracking-widest font-bold text-neutral-400 ml-1">Full Name</label>
                                <input required type="text" placeholder="Elias Thorne" className="w-full bg-white border border-neutral-200 px-4 py-3 text-sm focus:outline-none focus:border-neutral-900 transition-colors rounded-none" />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[9px] uppercase tracking-widest font-bold text-neutral-400 ml-1">Email Address</label>
                                <input required type="email" placeholder="elias@example.com" className="w-full bg-white border border-neutral-200 px-4 py-3 text-sm focus:outline-none focus:border-neutral-900 transition-colors rounded-none" />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[9px] uppercase tracking-widest font-bold text-neutral-400 ml-1">Preferred Date Range</label>
                              <select className="w-full bg-white border border-neutral-200 px-4 py-3 text-sm focus:outline-none focus:border-neutral-900 transition-colors rounded-none appearance-none">
                                <option>February 2026 - Week 2</option>
                                <option>February 2026 - Week 3</option>
                                <option>March 2026 - Early</option>
                              </select>
                            </div>
                            <div className="pt-4">
                              <motion.button
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                className="w-full bg-neutral-900 text-white py-4 px-8 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
                              >
                                Send Appointment Request
                              </motion.button>
                            </div>
                            <p className="text-[10px] text-neutral-400 text-center italic">
                              *Visits are by invitation only to preserve workshop tranquility.
                            </p>
                          </form>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>

          {/* Workshop Film Modal */}
          <AnimatePresence>
            {showFilm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[300] bg-black flex items-center justify-center p-4"
              >
                <button 
                  onClick={() => setShowFilm(false)}
                  className="absolute top-8 right-8 text-white hover:text-neutral-400 transition-colors z-[310]"
                >
                  <X className="w-8 h-8" />
                </button>
                <div className="w-full max-w-6xl aspect-video bg-neutral-900 shadow-2xl relative">
                  <iframe
                    src={`https://www.youtube.com/embed/0JnGiu5ffMs?autoplay=1&mute=0&controls=1&rel=0&vq=hd1080`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    title="Workshop Film"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
};