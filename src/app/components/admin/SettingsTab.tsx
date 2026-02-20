import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Settings, Globe, Mail, ShoppingCart, Shield, UserPlus, UserCog, Trash2,
  CreditCard, CheckCircle2, AlertCircle, Eye, EyeOff, ExternalLink, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { projectId } from '../../../../utils/supabase/info';
import { useAdmin } from './AdminContext';

const API = `https://${projectId}.supabase.co/functions/v1/make-server-710d82e2`;

export const SettingsTab = () => {
  const {
    siteSettings, session, isOwner, teamMembers, authHeaders,
    inviteEmail, setInviteEmail, inviteRole, setInviteRole,
    handleSaveSettings, handleInviteTeamMember,
    handleRemoveTeamMember, handleUpdateTeamRole,
  } = useAdmin();

  // PayFast settings state
  const [pfLoading, setPfLoading] = useState(true);
  const [pfSaving, setPfSaving] = useState(false);
  const [pfSettings, setPfSettings] = useState<any>({});
  const [pfMerchantId, setPfMerchantId] = useState('');
  const [pfMerchantKey, setPfMerchantKey] = useState('');
  const [pfPassphrase, setPfPassphrase] = useState('');
  const [pfSandbox, setPfSandbox] = useState(true);
  const [showPfKey, setShowPfKey] = useState(false);
  const [showPfPass, setShowPfPass] = useState(false);

  // Fetch PayFast settings
  useEffect(() => {
    const fetchPf = async () => {
      try {
        const h = authHeaders();
        const res = await fetch(`${API}/payfast/settings`, { headers: h });
        if (res.ok) {
          const data = await res.json();
          setPfSettings(data);
          setPfMerchantId(data.merchantId || '');
          setPfMerchantKey(data.merchantKey || '');
          setPfPassphrase(data.passphrase || '');
          setPfSandbox(data.sandbox !== undefined ? data.sandbox : true);
        }
      } catch { /* silent */ }
      finally { setPfLoading(false); }
    };
    fetchPf();
  }, [authHeaders]);

  const handleSavePayFast = async () => {
    setPfSaving(true);
    try {
      const body: any = { sandbox: pfSandbox };
      if (pfMerchantId) body.merchantId = pfMerchantId;
      if (pfMerchantKey && !pfMerchantKey.startsWith('••••')) body.merchantKey = pfMerchantKey;
      if (pfPassphrase && !pfPassphrase.startsWith('••••')) body.passphrase = pfPassphrase;

      const res = await fetch(`${API}/payfast/settings`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success('PayFast settings saved');
        // Re-fetch to get masked values
        const refetch = await fetch(`${API}/payfast/settings`, { headers: authHeaders() });
        if (refetch.ok) {
          const data = await refetch.json();
          setPfSettings(data);
          setPfMerchantId(data.merchantId || '');
          setPfMerchantKey(data.merchantKey || '');
          setPfPassphrase(data.passphrase || '');
          setPfSandbox(data.sandbox !== undefined ? data.sandbox : true);
        }
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to save PayFast settings');
      }
    } catch { toast.error('Failed to save PayFast settings'); }
    finally { setPfSaving(false); }
  };

  return (
    <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
      <div>
        <h2 className="text-2xl font-serif text-neutral-900">Settings</h2>
        <p className="text-xs text-neutral-500 mt-0.5">Manage site configuration</p>
      </div>

      {!siteSettings ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-neutral-200 border-t-neutral-900 animate-spin rounded-full" />
        </div>
      ) : (
      <form onSubmit={handleSaveSettings} className="space-y-4">
        {/* General */}
        <div className="bg-white rounded-lg border border-neutral-200 p-5 space-y-4">
          <h3 className="text-[11px] uppercase tracking-[0.15em] font-bold text-neutral-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-neutral-400" /> General
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 mb-1.5 block">Site Name</label>
              <input name="siteName" defaultValue={siteSettings.siteName} className="w-full bg-neutral-50 border border-neutral-200 rounded-md px-3 py-2 text-sm outline-none focus:border-neutral-900 transition-colors" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 mb-1.5 block">Tagline</label>
              <input name="tagline" defaultValue={siteSettings.tagline} className="w-full bg-neutral-50 border border-neutral-200 rounded-md px-3 py-2 text-sm outline-none focus:border-neutral-900 transition-colors" />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-lg border border-neutral-200 p-5 space-y-4">
          <h3 className="text-[11px] uppercase tracking-[0.15em] font-bold text-neutral-900 flex items-center gap-2">
            <Mail className="w-4 h-4 text-neutral-400" /> Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 mb-1.5 block">Email</label>
              <input name="contactEmail" defaultValue={siteSettings.contactEmail} className="w-full bg-neutral-50 border border-neutral-200 rounded-md px-3 py-2 text-sm outline-none focus:border-neutral-900 transition-colors" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 mb-1.5 block">Phone</label>
              <input name="contactPhone" defaultValue={siteSettings.contactPhone} className="w-full bg-neutral-50 border border-neutral-200 rounded-md px-3 py-2 text-sm outline-none focus:border-neutral-900 transition-colors" />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 mb-1.5 block">Address</label>
              <input name="address" defaultValue={siteSettings.address} className="w-full bg-neutral-50 border border-neutral-200 rounded-md px-3 py-2 text-sm outline-none focus:border-neutral-900 transition-colors" />
            </div>
          </div>
        </div>

        {/* Commerce */}
        <div className="bg-white rounded-lg border border-neutral-200 p-5 space-y-4">
          <h3 className="text-[11px] uppercase tracking-[0.15em] font-bold text-neutral-900 flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-neutral-400" /> Commerce
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 mb-1.5 block">Currency</label>
              <input name="currency" defaultValue={siteSettings.currency} className="w-full bg-neutral-50 border border-neutral-200 rounded-md px-3 py-2 text-sm outline-none focus:border-neutral-900 transition-colors" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 mb-1.5 block">Free Shipping Threshold (R)</label>
              <input name="freeShippingThreshold" type="number" defaultValue={siteSettings.freeShippingThreshold} className="w-full bg-neutral-50 border border-neutral-200 rounded-md px-3 py-2 text-sm outline-none focus:border-neutral-900 transition-colors" />
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="bg-white rounded-lg border border-neutral-200 p-5 space-y-4">
          <h3 className="text-[11px] uppercase tracking-[0.15em] font-bold text-neutral-900 flex items-center gap-2">
            <Settings className="w-4 h-4 text-neutral-400" /> Features
          </h3>
          <div className="space-y-3">
            {[
              { name: 'enableReviews', label: 'Product Reviews', desc: 'Allow customers to leave reviews on products', defaultChecked: siteSettings.enableReviews },
              { name: 'enableNewsletter', label: 'Newsletter', desc: 'Enable newsletter subscription form on the website', defaultChecked: siteSettings.enableNewsletter },
              { name: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Put the site in maintenance mode (visitors see a maintenance page)', defaultChecked: siteSettings.maintenanceMode },
            ].map(toggle => (
              <label key={toggle.name} className="flex items-center justify-between py-2 cursor-pointer group">
                <div>
                  <p className="text-sm font-medium text-neutral-900">{toggle.label}</p>
                  <p className="text-[10px] text-neutral-400">{toggle.desc}</p>
                </div>
                <input type="checkbox" name={toggle.name} defaultChecked={toggle.defaultChecked} className="w-4 h-4 accent-neutral-900 cursor-pointer" />
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="px-6 py-2.5 bg-neutral-900 text-white rounded-md text-xs font-medium hover:bg-neutral-800 transition-colors">
            Save Settings
          </button>
        </div>
      </form>
      )}

      {/* ─── PayFast Payment Gateway ─── */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="p-5 border-b border-neutral-100">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] uppercase tracking-[0.15em] font-bold text-neutral-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-neutral-400" /> PayFast Payment Gateway
            </h3>
            {!pfLoading && (
              <div className="flex items-center gap-2">
                {pfSettings.activeSource === 'admin' ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Configured via Admin
                  </span>
                ) : pfSettings.activeSource === 'env' ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Configured via Env
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                    <AlertCircle className="w-3 h-3" /> Not Configured
                  </span>
                )}
              </div>
            )}
          </div>
          <p className="text-[10px] text-neutral-400 mt-1">
            Accept payments from South African customers via PayFast. Settings entered here override environment variables.
          </p>
        </div>

        {pfLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 animate-spin rounded-full" />
          </div>
        ) : (
          <div className="p-5 space-y-5">
            {/* Mode Toggle */}
            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-neutral-900">Payment Mode</p>
                <p className="text-[10px] text-neutral-400">
                  {pfSandbox ? 'Testing mode — no real payments processed' : 'Live mode — real payments will be processed'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${pfSandbox ? 'text-amber-600' : 'text-neutral-300'}`}>Sandbox</span>
                <button
                  type="button"
                  onClick={() => setPfSandbox(!pfSandbox)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${pfSandbox ? 'bg-amber-500' : 'bg-emerald-500'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${pfSandbox ? 'left-0.5' : 'left-[22px]'}`} />
                </button>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${!pfSandbox ? 'text-emerald-600' : 'text-neutral-300'}`}>Live</span>
              </div>
            </div>

            {/* Credentials */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 mb-1.5 block">Merchant ID</label>
                <input
                  value={pfMerchantId}
                  onChange={(e) => setPfMerchantId(e.target.value)}
                  placeholder="e.g. 10000100"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-md px-3 py-2 text-sm outline-none focus:border-neutral-900 transition-colors font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 mb-1.5 block">Merchant Key</label>
                <div className="relative">
                  <input
                    type={showPfKey ? 'text' : 'password'}
                    value={pfMerchantKey}
                    onChange={(e) => setPfMerchantKey(e.target.value)}
                    placeholder="e.g. 46f0cd694581a"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-md px-3 py-2 pr-9 text-sm outline-none focus:border-neutral-900 transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPfKey(!showPfKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPfKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 mb-1.5 block">Passphrase <span className="text-neutral-300">(optional but recommended)</span></label>
                <div className="relative">
                  <input
                    type={showPfPass ? 'text' : 'password'}
                    value={pfPassphrase}
                    onChange={(e) => setPfPassphrase(e.target.value)}
                    placeholder="Your PayFast passphrase"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-md px-3 py-2 pr-9 text-sm outline-none focus:border-neutral-900 transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPfPass(!showPfPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPfPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-700">How it works</p>
              <ul className="text-[11px] text-blue-600 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">1.</span>
                  Create a PayFast account at <a href="https://www.payfast.co.za" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800 inline-flex items-center gap-0.5">payfast.co.za <ExternalLink className="w-2.5 h-2.5" /></a>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">2.</span>
                  Find your Merchant ID and Key in PayFast Dashboard → Settings → Integration
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">3.</span>
                  Set a passphrase in PayFast → Settings → Security and enter it above
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">4.</span>
                  Use Sandbox mode to test, then switch to Live when ready
                </li>
              </ul>
              {pfSandbox && (
                <p className="text-[10px] text-amber-600 mt-2 font-medium">
                  Sandbox test credentials: Merchant ID <code className="bg-amber-100 px-1 py-0.5 rounded text-[10px]">10000100</code>, Key <code className="bg-amber-100 px-1 py-0.5 rounded text-[10px]">46f0cd694581a</code>, Passphrase <code className="bg-amber-100 px-1 py-0.5 rounded text-[10px]">jt7NOE43FZPn</code>
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSavePayFast}
                disabled={pfSaving}
                className="px-6 py-2.5 bg-neutral-900 text-white rounded-md text-xs font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {pfSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                Save PayFast Settings
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Team Management (Owner Only) */}
      {isOwner && (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="p-5 border-b border-neutral-100">
            <h3 className="text-[11px] uppercase tracking-[0.15em] font-bold text-neutral-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-neutral-400" /> Team & Access Control
            </h3>
            <p className="text-[10px] text-neutral-400 mt-1">Manage who can access the admin console and their permission level</p>
          </div>

          {/* Invite New */}
          <div className="p-4 bg-neutral-50 border-b border-neutral-100">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="teammate@email.com"
                className="flex-1 bg-white border border-neutral-200 rounded-md py-2 px-3 text-sm outline-none focus:border-neutral-900 transition-colors"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="bg-white border border-neutral-200 rounded-md py-2 px-3 text-xs outline-none focus:border-neutral-900 transition-colors w-full sm:w-32"
              >
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
                <option value="owner">Owner</option>
              </select>
              <button
                onClick={handleInviteTeamMember}
                disabled={!inviteEmail.trim()}
                className="px-4 py-2 bg-neutral-900 text-white rounded-md text-xs font-medium hover:bg-neutral-800 transition-colors disabled:opacity-30 flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
            <p className="text-[9px] text-neutral-400 mt-2">The user must have a B-Interiors account first. Enter their registered email.</p>
          </div>

          {/* Team List */}
          <div className="divide-y divide-neutral-100">
            {teamMembers.map((member: any) => (
              <div key={member.userId} className="px-5 py-3 flex items-center justify-between group hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    member.role === 'owner' ? 'bg-neutral-900' : member.role === 'admin' ? 'bg-blue-600' : 'bg-neutral-400'
                  }`}>
                    {member.email?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{member.name || member.email}</p>
                    <p className="text-[10px] text-neutral-400">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {member.role === 'owner' && member.userId === session?.user?.id ? (
                    <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-neutral-900 text-white">You (Owner)</span>
                  ) : (
                    <>
                      <select
                        value={member.role}
                        onChange={(e) => handleUpdateTeamRole(member.userId, member.email, e.target.value)}
                        className="text-[10px] border border-neutral-200 rounded px-2 py-1 bg-white outline-none cursor-pointer"
                      >
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                        <option value="owner">Owner</option>
                      </select>
                      <button
                        onClick={() => handleRemoveTeamMember(member.userId, member.email)}
                        className="p-1 hover:bg-red-50 rounded text-neutral-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {teamMembers.length === 0 && (
              <div className="px-5 py-8 text-center text-neutral-400 text-xs">
                <UserCog className="w-8 h-8 mx-auto mb-2 text-neutral-200" />
                <p>No team members yet. You are the sole administrator.</p>
              </div>
            )}
          </div>

          {/* Role Legend */}
          <div className="p-4 bg-neutral-50 border-t border-neutral-100">
            <p className="text-[9px] text-neutral-400 uppercase tracking-widest font-semibold mb-2">Role permissions</p>
            <div className="grid grid-cols-3 gap-3 text-[10px]">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-neutral-900 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-bold text-neutral-700">Owner</p>
                  <p className="text-neutral-400">Full access + team management + settings</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-bold text-neutral-700">Admin</p>
                  <p className="text-neutral-400">Full access except team management</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-neutral-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-bold text-neutral-700">Editor</p>
                  <p className="text-neutral-400">View all, edit products & orders, no delete or settings</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};