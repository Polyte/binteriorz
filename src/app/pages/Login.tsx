import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../../utils/supabase/client';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { toast } from 'sonner';
import { Lock, Mail, ArrowRight, UserPlus, RefreshCw, User, AlertTriangle } from 'lucide-react';

const API = `https://${projectId}.supabase.co/functions/v1/make-server-710d82e2`;

type Mode = 'login' | 'signup' | 'reset';

export const Login = () => {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [resetKey, setResetKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success('Welcome back to the Studio');
      window.location.href = '/admin';
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/signup`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: name.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');

      // Auto sign-in after signup
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      toast.success('Account created — welcome to the Studio');
      window.location.href = '/admin';
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetKey.trim()) { toast.error('Please enter the service role key'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/reset-admin-roles`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ secret: resetKey.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');
      toast.success('Admin roles cleared. Log in to claim owner access.');
      setResetKey('');
      setMode('login');
    } catch (error: any) {
      toast.error(error.message || 'Reset failed — check your key');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setEmail('');
    setPassword('');
    setName('');
    setResetKey('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf9] px-4">
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white border border-neutral-200 p-12 shadow-2xl relative"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <div className={`w-16 h-16 ${mode === 'reset' ? 'bg-amber-600' : 'bg-neutral-900'} text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl transition-colors`}>
            {mode === 'login' && <Lock className="w-6 h-6" />}
            {mode === 'signup' && <UserPlus className="w-6 h-6" />}
            {mode === 'reset' && <RefreshCw className="w-6 h-6" />}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="text-3xl font-serif text-neutral-900 mb-2">
                {mode === 'login' && 'Management Portal'}
                {mode === 'signup' && 'Create Account'}
                {mode === 'reset' && 'Reset Admin Access'}
              </h1>
              <p className="text-xs uppercase tracking-[0.4em] text-neutral-400 font-black">
                {mode === 'login' && 'Authorized Personnel Only'}
                {mode === 'signup' && 'Register a New Admin Account'}
                {mode === 'reset' && 'Clear All Admin Roles'}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Login Form */}
        <AnimatePresence mode="wait">
          {mode === 'login' && (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onSubmit={handleLogin}
              className="space-y-8"
            >
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-black text-neutral-400 mb-2 block">Studio Email</label>
                  <div className="relative">
                    <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent border-b border-neutral-200 py-4 pl-8 outline-none focus:border-neutral-900 transition-colors"
                      placeholder="admin@b-interiors.design"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-black text-neutral-400 mb-2 block">Security Token</label>
                  <div className="relative">
                    <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent border-b border-neutral-200 py-4 pl-8 outline-none focus:border-neutral-900 transition-colors"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-6 bg-neutral-900 text-white text-[10px] uppercase tracking-[0.4em] font-black hover:bg-neutral-800 transition-all flex items-center justify-center gap-4 group"
              >
                {loading ? 'Authenticating...' : 'Enter Console'}
                {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />}
              </button>

              <div className="flex items-center justify-between pt-4">
                <button type="button" onClick={() => switchMode('signup')} className="text-[10px] uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors font-black">
                  Create Account
                </button>
                <button type="button" onClick={() => switchMode('reset')} className="text-[10px] uppercase tracking-widest text-neutral-400 hover:text-amber-600 transition-colors font-black">
                  Reset Access
                </button>
              </div>
            </motion.form>
          )}

          {/* Signup Form */}
          {mode === 'signup' && (
            <motion.form
              key="signup"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onSubmit={handleSignup}
              className="space-y-8"
            >
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-black text-neutral-400 mb-2 block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-transparent border-b border-neutral-200 py-4 pl-8 outline-none focus:border-neutral-900 transition-colors"
                      placeholder="Your Name"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-black text-neutral-400 mb-2 block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent border-b border-neutral-200 py-4 pl-8 outline-none focus:border-neutral-900 transition-colors"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-black text-neutral-400 mb-2 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent border-b border-neutral-200 py-4 pl-8 outline-none focus:border-neutral-900 transition-colors"
                      placeholder="Min 6 characters"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-6 bg-neutral-900 text-white text-[10px] uppercase tracking-[0.4em] font-black hover:bg-neutral-800 transition-all flex items-center justify-center gap-4 group"
              >
                {loading ? 'Creating Account...' : 'Register & Enter'}
                {!loading && <UserPlus className="w-4 h-4 group-hover:translate-x-2 transition-transform" />}
              </button>

              <div className="text-center pt-4">
                <button type="button" onClick={() => switchMode('login')} className="text-[10px] uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors font-black">
                  Back to Login
                </button>
              </div>
            </motion.form>
          )}

          {/* Reset Form */}
          {mode === 'reset' && (
            <motion.form
              key="reset"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onSubmit={handleReset}
              className="space-y-8"
            >
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex gap-3 items-start">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  This will clear <strong>all admin roles</strong>. The next person to log in and visit <code className="bg-amber-100 px-1 rounded">/admin</code> will automatically become the <strong>owner</strong>.
                </p>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest font-black text-neutral-400 mb-2 block">Supabase Service Role Key</label>
                <div className="relative">
                  <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                  <input
                    type="password"
                    value={resetKey}
                    onChange={(e) => setResetKey(e.target.value)}
                    className="w-full bg-transparent border-b border-neutral-200 py-4 pl-8 outline-none focus:border-amber-600 transition-colors"
                    placeholder="eyJhbG..."
                    required
                  />
                </div>
                <p className="text-[9px] text-neutral-400 mt-2">Found in your Supabase project Settings &rarr; API &rarr; Service Role Key</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-6 bg-amber-600 text-white text-[10px] uppercase tracking-[0.4em] font-black hover:bg-amber-700 transition-all flex items-center justify-center gap-4 group"
              >
                {loading ? 'Resetting...' : 'Confirm Reset'}
                {!loading && <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />}
              </button>

              <div className="text-center pt-4">
                <button type="button" onClick={() => switchMode('login')} className="text-[10px] uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors font-black">
                  Back to Login
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="mt-12 text-center">
          <p className="text-[10px] text-neutral-400 leading-relaxed uppercase tracking-widest">
            B-Interiors Alberton Studio<br />
            Secure Entry Protocol v4.0.2
          </p>
        </div>
      </motion.div>
    </div>
  );
};