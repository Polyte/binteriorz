import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import { supabase } from '../../../utils/supabase/client';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { toast } from 'sonner';
import {
  User, Package, LogOut, ChevronRight, Clock, CheckCircle2, Truck,
  Mail, MapPin, ShoppingBag, Eye, ArrowRight, Loader2
} from 'lucide-react';

const API = `https://${projectId}.supabase.co/functions/v1/make-server-710d82e2`;

export const Account = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchOrders(session.access_token);
      else setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
      if (session) fetchOrders(session.access_token);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchOrders = async (token: string) => {
    try {
      const res = await fetch(`${API}/my-orders`, {
        headers: { Authorization: `Bearer ${token}`, apikey: publicAnonKey }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
    } catch (e) { console.error('Fetch orders error:', e); }
    finally { setLoading(false); }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      if (authMode === 'signup') {
        const res = await fetch(`${API}/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}`, apikey: publicAnonKey },
          body: JSON.stringify(form)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Signup failed');
        // Now sign in
        const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
        if (error) throw new Error(error.message);
        toast.success('Welcome to B-Interiors. Your account is ready.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
        if (error) throw new Error(error.message);
        toast.success('Welcome back to the studio.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed');
    } finally { setAuthLoading(false); }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setOrders([]);
    toast.info('Signed out successfully.');
  };

  const statusConfig: Record<string, { color: string; bg: string; icon: any }> = {
    confirmed: { color: 'text-emerald-700', bg: 'bg-emerald-50', icon: CheckCircle2 },
    shipped: { color: 'text-blue-700', bg: 'bg-blue-50', icon: Truck },
    delivered: { color: 'text-neutral-700', bg: 'bg-neutral-100', icon: Package },
    pending: { color: 'text-amber-700', bg: 'bg-amber-50', icon: Clock },
  };

  const inputCls = 'w-full bg-transparent border-b border-neutral-200 py-4 text-sm font-light focus:border-neutral-900 outline-none transition-all duration-500 placeholder:text-neutral-300';

  // ─── Auth Gate ──────────────────────────────────
  if (!session) {
    return (
      <div className="min-h-screen pt-36 pb-24 bg-[#fcfcfc]">
        <div className="max-w-md mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-[10px] uppercase tracking-[0.5em] text-neutral-400 font-bold block mb-4">Client Portal</span>
            <h1 className="text-4xl md:text-5xl font-serif text-neutral-900 tracking-tight mb-4">
              {authMode === 'login' ? 'Welcome Back' : 'Join B-Interiors'}
            </h1>
            <p className="text-sm text-neutral-400 font-light">
              {authMode === 'login' ? 'Access your order history and account.' : 'Create an account to track orders and manage your profile.'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {authMode === 'signup' && (
              <div>
                <label className="text-[9px] uppercase tracking-[0.3em] text-neutral-400 font-bold">Full Name</label>
                <input
                  required type="text" placeholder="Your name"
                  value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className={inputCls}
                />
              </div>
            )}
            <div>
              <label className="text-[9px] uppercase tracking-[0.3em] text-neutral-400 font-bold">Email Address</label>
              <input
                required type="email" placeholder="you@email.com"
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-[0.3em] text-neutral-400 font-bold">Password</label>
              <input
                required type="password" placeholder="Min 6 characters" minLength={6}
                value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className={inputCls}
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={authLoading}
              className="w-full bg-neutral-900 text-white py-5 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-neutral-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-8"
            >
              {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {authMode === 'login' ? 'Sign In' : 'Create Account'}
            </motion.button>
          </form>

          <p className="text-center mt-8 text-xs text-neutral-400">
            {authMode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              className="text-neutral-900 font-bold underline"
            >
              {authMode === 'login' ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  // ─── Account Dashboard ──────────────────────────
  const user = session.user;
  const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Client';

  return (
    <div className="min-h-screen pt-32 pb-24 bg-[#fcfcfc]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center flex-shrink-0 shadow-xl">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.4em] text-neutral-400 font-bold block mb-1">Client Portal</span>
              <h1 className="text-3xl md:text-4xl font-serif text-neutral-900 tracking-tight">{userName}</h1>
              <p className="text-xs text-neutral-400 mt-1">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-red-500 hover:text-red-700 transition-colors self-start"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
          <div className="bg-white border border-neutral-100 p-6 rounded-2xl">
            <ShoppingBag className="w-5 h-5 text-neutral-400 mb-3" />
            <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-bold mb-1">Total Orders</p>
            <p className="text-2xl font-serif text-neutral-900">{orders.length}</p>
          </div>
          <div className="bg-white border border-neutral-100 p-6 rounded-2xl">
            <Package className="w-5 h-5 text-neutral-400 mb-3" />
            <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-bold mb-1">Total Invested</p>
            <p className="text-2xl font-serif text-neutral-900">R {orders.reduce((a, o) => a + (o.total || 0), 0).toLocaleString()}</p>
          </div>
          <div className="bg-white border border-neutral-100 p-6 rounded-2xl">
            <Clock className="w-5 h-5 text-neutral-400 mb-3" />
            <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-bold mb-1">Member Since</p>
            <p className="text-2xl font-serif text-neutral-900">{new Date(user.created_at).toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' })}</p>
          </div>
        </div>

        {/* Orders */}
        <div>
          <h2 className="text-[10px] uppercase tracking-[0.4em] font-black text-neutral-900 mb-8 flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-neutral-900 rounded-full" />
            Order History
          </h2>

          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="w-10 h-10 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-neutral-100 rounded-2xl">
              <ShoppingBag className="w-10 h-10 text-neutral-200 mx-auto mb-4" />
              <p className="text-neutral-400 font-serif text-lg mb-4">No orders yet.</p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-3 bg-neutral-900 text-white px-8 py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-neutral-800 transition-colors"
              >
                Explore the Collection <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => {
                const config = statusConfig[order.status] || statusConfig.pending;
                const isExpanded = expandedOrder === order.orderId;
                return (
                  <motion.div
                    key={order.orderId}
                    layout
                    className="bg-white border border-neutral-100 rounded-2xl overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedOrder(isExpanded ? null : order.orderId)}
                      className="w-full px-6 py-5 flex items-center justify-between hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex items-center gap-5">
                        <div className={`p-2.5 rounded-xl ${config.bg}`}>
                          <config.icon className={`w-4 h-4 ${config.color}`} />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-neutral-900 tracking-wider">{order.orderId}</p>
                          <p className="text-[10px] text-neutral-400 mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
                            {' '}&bull;{' '}{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${config.bg} ${config.color}`}>
                          {order.status}
                        </span>
                        <span className="text-sm font-serif font-bold text-neutral-900">R {order.total?.toLocaleString()}</span>
                        <ChevronRight className={`w-4 h-4 text-neutral-300 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 pt-2 border-t border-neutral-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              {/* Items */}
                              <div>
                                <h4 className="text-[9px] uppercase tracking-[0.3em] text-neutral-400 font-bold mb-4">Items</h4>
                                <div className="space-y-3">
                                  {order.items?.map((item: any) => (
                                    <div key={item.id} className="flex items-center gap-3">
                                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-50 flex-shrink-0">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-neutral-900 truncate">{item.name}</p>
                                        <p className="text-[10px] text-neutral-400">Qty: {item.quantity}</p>
                                      </div>
                                      <span className="text-xs font-bold">R {(item.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              {/* Shipping Info */}
                              <div>
                                <h4 className="text-[9px] uppercase tracking-[0.3em] text-neutral-400 font-bold mb-4">Delivery Address</h4>
                                <div className="flex items-start gap-3 text-sm text-neutral-600 font-light">
                                  <MapPin className="w-4 h-4 text-neutral-300 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p>{order.customerInfo?.firstName} {order.customerInfo?.lastName}</p>
                                    <p>{order.customerInfo?.address}</p>
                                    <p>{order.customerInfo?.city}, {order.customerInfo?.postalCode}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-neutral-600 font-light mt-4">
                                  <Mail className="w-4 h-4 text-neutral-300 flex-shrink-0" />
                                  <span>{order.customerInfo?.email}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};